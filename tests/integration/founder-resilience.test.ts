import {expect,it} from 'vitest';
import {createCompany,command,advance,dispatchCompany,replayCompany} from '../../src/game/founder/engine';
import {SAVE_KEY,BACKUP_SAVE_KEY,encodeSave,decodeSave} from '../../src/game/founder/save';
import {PENDING_SAVE_KEY,persistCheckpoint,recoverCheckpoint} from '../../src/game/founder/storage';
import {writeFileSync,mkdirSync} from 'node:fs';
function storage(failAt=Infinity){const data=new Map<string,string>();let writes=0;return {data,getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{if(++writes===failAt)throw new Error('quota');data.set(k,v);},removeItem:(k:string)=>{if(++writes===failAt)throw new Error('quota');data.delete(k);}};}
it('recovers every interrupted checkpoint promotion without losing partial work',()=>{
 const before=command(createCompany(1400),{type:'start'}),after=advance(before,30);
 for(let failAt=1;failAt<=5;failAt++){
  const store=storage(failAt);store.data.set(SAVE_KEY,encodeSave(before));
  try{persistCheckpoint(store,after);}catch{/* Injected interruption. */}
  const restored=recoverCheckpoint(store)!.company;expect([before.tick,after.tick]).toContain(restored.tick);expect(restored.seed).toBe(before.seed);
  expect(decodeSave(encodeSave(restored))).toEqual(restored);
 }
});
it('preserves incompatible bytes, uses verified backup, and prioritizes pending new company',()=>{
 const store=storage();store.data.set(SAVE_KEY,'future-engine');store.data.set(BACKUP_SAVE_KEY,encodeSave(createCompany(1401)));
 expect(recoverCheckpoint(store)!.invalid).toEqual([SAVE_KEY]);
 expect(()=>persistCheckpoint(store,createCompany(1402))).toThrow();expect(store.getItem(SAVE_KEY)).toBe('future-engine');
 store.data.set(PENDING_SAVE_KEY,encodeSave(createCompany(1403)));expect(recoverCheckpoint(store)!.company.seed).toBe(1403);
});
it('preserves replay, prior state and duplicate rejection with a long immutable event log',()=>{
 let s=command(createCompany(1404),{type:'start'});
 for(let i=0;i<2500;i++)s=command(s,{type:'focus',work:i%2?'product':'demand'});
 const encoded=encodeSave(s),times:number[]=[],cloneTimes:number[]=[];
 for(let i=0;i<30;i++){let start=performance.now();structuredClone(s);cloneTimes.push(performance.now()-start);start=performance.now();advance(s,1);times.push(performance.now()-start);}
 expect(encodeSave(s)).toBe(encoded);const next=advance(s,3);expect(replayCompany(next)).toEqual(next);
 expect(dispatchCompany(next,next.actions[2]).result.reason).toBe('duplicate-action');
 const percentile=(a:number[],p:number)=>a.toSorted((a,b)=>a-b)[Math.floor((a.length-1)*p)];
 mkdirSync('artifacts/qa/founder-revamp/S14',{recursive:true});writeFileSync('artifacts/qa/founder-revamp/S14/performance.json',JSON.stringify({environment:process.version,platform:process.platform,arch:process.arch,scenario:'2501 immutable action records, headless Node, 30 samples; no browser frame-time claim',advanceMs:{p50:percentile(times,.5),p95:percentile(times,.95),p99:percentile(times,.99)},previousDeepCloneOnlyMs:{p50:percentile(cloneTimes,.5),p95:percentile(cloneTimes,.95)},saveBytes:encoded.length,frameTime:'pending physical browser/device',economicWorkDropped:false},null,2));
});
it('migrates candidate.12 balances without changing existing customers, commitments or rewards',()=>{
 const s=command(createCompany(1512),{type:'start'});s.ranks.product.craft=4;s.ranks.demand.craft=4;
 const prior={...s,version:'founder-candidate.12'};const data=JSON.stringify(prior);
 let h=2166136261;for(let i=0;i<data.length;i++)h=Math.imul(h^data.charCodeAt(i),16777619);
 const raw=JSON.stringify({version:2,contractVersion:s.contractVersion,contentVersion:s.contentVersion,balanceVersion:prior.version,data,checksum:(h>>>0).toString(16)});
 const loaded=decodeSave(raw);expect(loaded.version).toBe('founder-candidate.15');expect(loaded.cash).toBe(s.cash);expect(loaded.inventory).toEqual(s.inventory);expect(loaded.ranks).toEqual(s.ranks);expect(replayCompany(loaded)).toEqual(loaded);
});
