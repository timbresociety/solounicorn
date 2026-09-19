import {afterEach,expect,it,vi} from 'vitest';
import {openCheckpointStore} from '../../src/game/founder/checkpoint-db';
import {SAVE_KEY,BACKUP_SAVE_KEY,encodeSave} from '../../src/game/founder/save';
import {createCompany} from '../../src/game/founder/engine';
import {persistCheckpoint,recoverCheckpoint} from '../../src/game/founder/storage';
// Headless transaction test double. Real browser/device IndexedDB is a separate gate.
function fakeDatabase(){
 const values=new Map<string,unknown>();let abortNext=false;
 const db={close:()=>{},onversionchange:null,createObjectStore:()=>{},transaction:(_name:string,mode:string)=>{
  const staged=new Map(values);let aborted=false;
  const tx={oncomplete:()=>{},onerror:()=>{},onabort:()=>{},error:new Error('injected abort'),abort:()=>{aborted=true;},objectStore:()=>({
   get:(key:string)=>{const request={result:staged.get(key),onsuccess:()=>{}};queueMicrotask(()=>request.onsuccess());return request;},
   put:(value:unknown,key:string)=>{staged.set(key,value);},delete:(key:string)=>{staged.delete(key);}
  })};
  setTimeout(()=>{if(aborted||mode==='readwrite'&&abortNext){abortNext=false;tx.onabort();}else{if(mode==='readwrite'){values.clear();for(const entry of staged)values.set(...entry);}tx.oncomplete();}},0);
  return tx;
 }};
 const factory={open:()=>{const request={result:db,onsuccess:()=>{},onerror:()=>{},onblocked:()=>{},onupgradeneeded:()=>{}};queueMicrotask(()=>request.onsuccess());return request;}};
 vi.stubGlobal('indexedDB',factory);const legacy=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>legacy.get(k)??null});
 return {values,legacy,abort:()=>{abortNext=true;}};
}
afterEach(()=>vi.unstubAllGlobals());
it('imports legacy checkpoints and commits atomically without deleting originals',async()=>{
 const db=fakeDatabase(),raw=encodeSave(createCompany(1410));db.legacy.set(SAVE_KEY,raw);
 const store=await openCheckpointStore();expect(recoverCheckpoint(store)!.company.seed).toBe(1410);
 persistCheckpoint(store,createCompany(1411));await store.flush();expect(db.legacy.get(SAVE_KEY)).toBe(raw);
 const reloaded=await openCheckpointStore();expect(recoverCheckpoint(reloaded)!.company.seed).toBe(1411);expect(db.values.get(BACKUP_SAVE_KEY)).toBe(raw);
});
it('an aborted write retains the previous durable checkpoint and retries safely',async()=>{
 const db=fakeDatabase(),store=await openCheckpointStore();persistCheckpoint(store,createCompany(1412));await store.flush();
 persistCheckpoint(store,createCompany(1413));db.abort();await expect(store.flush()).rejects.toThrow();
 expect(recoverCheckpoint(await openCheckpointStore())!.company.seed).toBe(1412);
 await store.flush();expect(recoverCheckpoint(await openCheckpointStore())!.company.seed).toBe(1413);
});
it('rejects a stale second tab instead of overwriting the new company',async()=>{
 fakeDatabase();const first=await openCheckpointStore(),stale=await openCheckpointStore();
 persistCheckpoint(first,createCompany(1414));await first.flush();persistCheckpoint(stale,createCompany(1415));
 await expect(stale.flush()).rejects.toThrow('Another tab');expect(recoverCheckpoint(await openCheckpointStore())!.company.seed).toBe(1414);
});
it('does not silently fall back to an older save when database open fails',async()=>{
 fakeDatabase();vi.stubGlobal('indexedDB',{open:()=>{const r={error:new Error('unavailable'),onerror:()=>{}};queueMicrotask(()=>r.onerror());return r;}});
 await expect(openCheckpointStore()).rejects.toThrow('unavailable');
});
