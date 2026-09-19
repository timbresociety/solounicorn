import {expect,it} from 'vitest';
import {operationsTicketPatches,operationsTicketPrice,operationsAutomationUpkeepPerTicket} from '../../src/game/founder/toys';
import {mkdirSync,writeFileSync} from 'node:fs';
it('records ticket tails independently from cash and finite repair utility',()=>{
 const rows=[];
 for(const scale of [0,4])for(const luck of [0,1,2,3,4]){
  const raw:number[]=[],selective:number[]=[],cash:number[]=[];let min=Infinity,max=-Infinity;
  for(let seed=15000;seed<15030;seed++)for(let ticket=1;ticket<=100;ticket++){
   const patches=operationsTicketPatches(seed,ticket,scale,luck,4),price=operationsTicketPrice(scale);
   const value=patches.reduce((n,p)=>n+p.valueCents,0)-price;raw.push(value);min=Math.min(min,value);max=Math.max(max,value);
   selective.push(patches.reduce((n,p)=>n+Math.max(0,p.valueCents),0)-price);cash.push(patches.reduce((n,p)=>n+(p.effect.kind==='cash'?p.effect.cents:0),0)-price);
  }
  const mean=(a:number[])=>a.reduce((a,b)=>a+b,0)/a.length,p=(a:number[],fraction:number)=>a.toSorted((a,b)=>a-b)[Math.floor((a.length-1)*fraction)];
  rows.push({scale,luck,samples:raw.length,price:operationsTicketPrice(scale),wholeTicket:{mean:mean(raw),p01:p(raw,.01),p05:p(raw,.05),p50:p(raw,.5),p95:p(raw,.95),p99:p(raw,.99),minimum:min,maximum:max,lossRate:raw.filter(v=>v<0).length/raw.length,variance:mean(raw.map(v=>(v-mean(raw))**2))},manualSelectiveModeledMean:mean(selective),cashOnlyMean:mean(cash),automationRank1AllocatedCompute:operationsAutomationUpkeepPerTicket(1),automationRank4AllocatedCompute:operationsAutomationUpkeepPerTicket(4)});
 }
 mkdirSync('artifacts/qa/founder-revamp/S15',{recursive:true});writeFileSync('artifacts/qa/founder-revamp/S15/ticket-tails.json',JSON.stringify({seeds:'15000..15029',ticketsPerSeed:100,warning:'Modeled operational utility is not liquid cash. Finite repair saturation and whole-company bills must be assessed separately; samples do not issue extra in-game tickets.',rows},null,2));
 expect(rows.every(r=>r.wholeTicket.mean>0)).toBe(true);
 for(const scale of [0,4])expect(rows.find(r=>r.scale===scale&&r.luck===4)!.wholeTicket.variance).toBeGreaterThan(rows.find(r=>r.scale===scale&&r.luck===0)!.wholeTicket.variance);
});
