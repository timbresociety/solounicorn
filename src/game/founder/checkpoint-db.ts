import {SAVE_KEY,BACKUP_SAVE_KEY} from './save';
import {PENDING_SAVE_KEY,type StoragePort} from './storage';
const KEYS=[SAVE_KEY,BACKUP_SAVE_KEY,PENDING_SAVE_KEY];
const REVISION='checkpoint-revision';
export type CheckpointStore=StoragePort & {flush:()=>Promise<void>;close:()=>void;kind:'indexeddb'|'localStorage'};
// Atomic slots and an optimistic revision prevent a stale tab overwriting a
// newer checkpoint. Legacy localStorage bytes remain available for recovery.
export async function openCheckpointStore():Promise<CheckpointStore>{
 if(typeof indexedDB==='undefined')return {kind:'localStorage',getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v),removeItem:k=>localStorage.removeItem(k),flush:()=>Promise.resolve(),close:()=>{}};
 const db=await new Promise<IDBDatabase>((resolve,reject)=>{
  const request=indexedDB.open('solounicorn-checkpoints',1);let blocked=false;
  request.onupgradeneeded=()=>request.result.createObjectStore('slots');
  request.onsuccess=()=>{if(blocked)request.result.close();else resolve(request.result);};request.onerror=()=>reject(request.error);request.onblocked=()=>{blocked=true;reject(new Error('Checkpoint database is blocked. Close other game tabs and retry.'));};
 });
 db.onversionchange=()=>db.close();
 const data=new Map<string,string>();let revision=0;
 try{
  await new Promise<void>((resolve,reject)=>{
   const tx=db.transaction('slots','readonly');
   for(const key of KEYS){const request=tx.objectStore('slots').get(key);request.onsuccess=()=>{if(typeof request.result==='string')data.set(key,request.result);};}
   const request=tx.objectStore('slots').get(REVISION);request.onsuccess=()=>{revision=Number(request.result??0);};
   tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
  if(!data.size)for(const key of KEYS){const raw=localStorage.getItem(key);if(raw)data.set(key,raw);}
 }catch(error){db.close();throw error;}
 return {kind:'indexeddb',close:()=>db.close(),getItem:key=>data.get(key)??null,setItem:(key,value)=>{data.set(key,value);},removeItem:key=>{data.delete(key);},flush:()=>{
  // Capture before awaiting the transaction so a subsequent reset cannot alter it.
  const snapshot=new Map(data);
  return new Promise<void>((resolve,reject)=>{
   const tx=db.transaction('slots','readwrite'),slots=tx.objectStore('slots');let conflict=false;
   const request=slots.get(REVISION);request.onsuccess=()=>{
    if(Number(request.result??0)!==revision){conflict=true;tx.abort();return;}
    for(const key of KEYS){const raw=snapshot.get(key);if(raw!==undefined)slots.put(raw,key);else slots.delete(key);}
    slots.put(revision+1,REVISION);
   };
   tx.oncomplete=()=>{revision++;resolve();};tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(conflict?new Error('Another tab saved a newer company. Export this run, then reload.'):tx.error);
  });
 }};
}
