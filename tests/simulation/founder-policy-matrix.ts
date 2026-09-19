import {expect} from 'vitest';
import {advance,command,createCompany,metrics,skillCost,ready,signal,priceTarget,validateCompany,capitalOffers,pressure,count,queueCap,expansionAccount} from '../../src/game/founder/engine';
import {productBrief,draftOption,initialBoard,packageComplete,mergeOrder,packageNeeds,packageMass,operationsTicketSupply} from '../../src/game/founder/toys';
import {FUNCTIONS,AXES,P} from '../../src/game/founder/profile';
import {rewardById} from '../../src/game/founder/rewards';
import {encodeSave,decodeSave} from '../../src/game/founder/save';
import {recordFounderWin} from '../../src/game/founder/history';
import type {Company,Command} from '../../src/game/founder/model';
export type Policy={mode:'manual'|'hybrid'|'automation';capital:'bootstrap'|'debt'|'vc';luck:0|4;ops:'selective'|'automatic';repeat:boolean;family:'bootstrap'|'growth'|'durable'|'automation';skilled:boolean};
export const policies:Policy[]=(['manual','hybrid','automation'] as const).flatMap((mode,i)=>(['bootstrap','debt','vc'] as const).map((capital,j)=>({mode,capital,luck:(i+j)%2?4:0,ops:mode==='automation'?'automatic':'selective',repeat:j===2,family:(['bootstrap','growth','durable','automation'] as const)[(i+j)%4],skilled:mode==='hybrid'})));
export async function play(seed:number,policy:Policy,horizon=27000,capture?:(s:Company)=>void){
 let s=command(createCompany(seed,policy.repeat?1:0),{type:'start'}),firstCustomer:number|null=null,manualActions=0,swaps=0,funding=false;
 let lastBuy=-1000;const samples:unknown[]=[],latencies:number[]=[];
 const send=(c:Command)=>{const at=performance.now();s=command(s,c);latencies.push(performance.now()-at);if(c.type==='focus')swaps++;else manualActions++;};
 const focus=(work:Company['focus'])=>{if(s.focus!==work)send({type:'focus',work});};
 send({type:'channel',channel:2});
 for(let n=0;s.tick<horizon&&!['failure','unicorn'].includes(s.phase);n++){
  if(s.phase==='quarter-draft'){
   const report=s.reports.find(r=>r.quarter===s.pendingDraftQuarter)!;
   const available=report.choices.filter(id=>draftOption(s,id,report.quarter)?.available);
   const id=available.find(id=>rewardById(id)?.family===policy.family)??available.find(id=>rewardById(id)?.kind==='relic')??available[0];
   send(id?{type:'draft',quarter:report.quarter,id}:{type:'draft-skip',quarter:report.quarter});
  }
  if(s.phase==='paused')send({type:'continue'});
  if(s.phase!=='active')throw Error('Unexpected phase '+s.phase);
  const m=metrics(s);
  const offers=capitalOffers(s);
  if(!funding&&policy.capital!=='bootstrap'&&offers[policy.capital].available&&s.tick>50){send({type:policy.capital==='debt'?'borrow':'raise'});funding=true;}
  if(s.debt&&s.cash> s.debt.principal+m.cost*4)send({type:'repay-debt',loanId:s.debt.id});
  // Reserve covers current accrued bill plus two projected months. No free cash/ranks.
  if((policy.capital!=='bootstrap'||s.lifetimeCollected>0)&&s.tick-lastBuy>=50){
   const options=FUNCTIONS.flatMap(f=>AXES.filter(a=>s.ranks[f][a]<(a==='luck'?policy.luck:a==='automate'?(policy.mode==='manual'?0:4):a==='scale'?(f==='operations'?4:policy.mode==='manual'?0:f==='retention'||f==='expansion'?2:3):4)).map(a=>({f,a,cost:skillCost(s,f,a)})));
   const candidates=options.filter(({f,a})=>{
    if((f==='retention'||f==='expansion')&&!s.accounts.length)return false;
    if(a==='luck'&&s.ranks[f].craft<3)return false;
    if(a==='scale'&&f!=='operations'&&(s.ranks[f].craft<3||s.ranks[f].automate<2))return false;
    if(a==='automate'&&f==='operations'&&policy.ops==='selective')return false;
    if(a==='automate'&&f==='retention'&&s.accounts.length<10)return false;
    if(a==='automate'&&f==='expansion'&&s.tick<1200)return false;
    const projected={...s,ranks:{...s.ranks,[f]:{...s.ranks[f],[a]:s.ranks[f][a]+1}}};
    return f==='operations'||pressure(projected).load<=pressure(projected).capacity*.9;
   }).sort((a,b)=>a.cost-b.cost||(['craft','automate','scale','luck'].indexOf(a.a)-['craft','automate','scale','luck'].indexOf(b.a)));
   const c=candidates.find(c=>s.cash>c.cost+s.expenseAccrued+Math.max(20000,m.cost*2));
   if(c){send({type:'buy',work:c.f,axis:c.a,rank:s.ranks[c.f][c.a]+1});lastBuy=s.tick;if(c.a==='luck'&&!s.risky[c.f])send({type:'risk',work:c.f});}
  }
  const threat=s.accounts.filter(a=>a.active&&a.problem).sort((a,b)=>a.threat-b.threat)[0];
  if(threat&&ready(s,'retention')&&(policy.mode!=='automation'||!s.ranks.retention.automate)){
   focus('retention');const problem=threat.problem!;send({type:'squash-problem',account:threat.id,problem:problem.id,expected:problem.workCompleted});
  }else if(s.trials.length&&ready(s,'monetisation')&&(policy.mode!=='automation'||!s.ranks.monetisation.automate)){
   focus('monetisation');send({type:'price',job:s.trials[0].id,plan:'premium',timing:priceTarget(s).center});
  }else if(s.leads.length&&ready(s,'product')&&count(s.trials)<queueCap(s,'monetisation')&&(policy.mode!=='automation'||!s.ranks.product.automate)){
   focus('product');const lead=s.leads[0];
   // One gesture per policy step, including verification and shipping.
   const brief=productBrief(s,lead).parts;const slot=brief.findIndex((p,i)=>s.recipe.id!==lead.id||s.recipe.slots[i]!==p);
   if(slot>=0)send({type:'part',job:lead.id,slot,part:brief[slot]});
   else if(!s.recipe.tested)send({type:'test-build',job:lead.id});else send({type:'ship',job:lead.id,early:false});
  }else if((policy.capital!=='bootstrap'||s.cash>m.nextBill+P.acquisitionCents[s.channel]+Math.max(20000,m.cost))&&ready(s,'demand')&&count(s.leads)<Math.min(queueCap(s,'product'),P.craft_batch_by_rank[s.ranks.demand.craft]*3)&&(policy.mode!=='automation'||!s.ranks.demand.automate)){
   focus('demand');send({type:'demand',pursue:signal(s).quality==='qualified',signal:s.signal});
  }else if(policy.ops==='selective'&&ready(s,'operations')&&(s.ops.active||s.ops.used<operationsTicketSupply(s.ranks.operations.scale)||s.ops.quarter!==s.quarter)){
   focus('operations');if(!s.ops.active)send({type:'ops-deal'});else {const patch=s.ops.patches.find(p=>!s.ops.inspected.includes(p.id));if(patch)send({type:'ops-inspect',card:s.ops.id,cell:patch.id});else{const positive=s.ops.patches.find(p=>p.sentiment==='positive'&&!s.ops.claimed.includes(p.id));send(positive?{type:'ops-claim',card:s.ops.id,cell:positive.id}:{type:'ops-discard',card:s.ops.id});}}
  }else if(policy.mode==='manual'&&expansionAccount(s)){
   focus('expansion');const a=expansionAccount(s)!;const board=s.package.id===a.id&&s.package.board?s.package.board:initialBoard();
   if(s.package.id===a.id&&packageComplete(s,a,board))send({type:'expand',account:a.id});
   else{let pair:[number,number]|undefined;for(let i=0;i<board.length&&!pair;i++)for(let j=i+1;j<board.length;j++)if(board[i]&&board[j]&&board[i]!.family===board[j]!.family&&board[i]!.tier===board[j]!.tier&&board[i]!.tier<mergeOrder(a.addons)[board[i]!.family].tier){pair=[i,j];break;}
    if(pair)send({type:'merge',account:a.id,from:pair[0],to:pair[1],expectedTier:board[pair[0]]!.tier});else{const need=packageNeeds(a.addons).find(n=>packageMass(board,n.family)<n.mass);if(need)send({type:'supply',account:a.id,family:need.family});}
   }
  }else focus('finance');
  const step=policy.skilled?10:20;s=advance(s,Math.min(step,horizon-s.tick));
  if(firstCustomer===null&&s.accounts.length)firstCustomer=s.accounts[0].born;
  if(s.tick%1800===0){validateCompany(s);samples.push({tick:s.tick,cash:s.cash,...metrics(s)});}
  if(n%100===0)await new Promise<void>(r=>setImmediate(r));
 }
 validateCompany(s);const m=metrics(s);latencies.sort((a,b)=>a-b);
 if(s.wonAt!==null){const loaded=decodeSave(encodeSave(s));expect(recordFounderWin(recordFounderWin({version:2,wins:[],records:[]},loaded),loaded).wins).toHaveLength(1);expect(command(loaded,{type:'continue'}).wonAt).toBe(s.wonAt);}
 capture?.(s);
 return {seed,policy,firstCustomerSeconds:firstCustomer===null?null:firstCustomer/10,manualActions,focusChanges:swaps,activeSeconds:s.tick/10,outcome:s.wonAt!==null?'unicorn':s.phase==='failure'?'failure':'horizon-censored',valuation:m.valuation,cash:s.cash,failure:s.failure,firstUnicornSeconds:s.wonAt===null?null:s.wonAt/10,build:s.inventory.relics,ranks:s.ranks,operations:s.operationsReturns,attentionPerMinute:manualActions/Math.max(1,s.tick/600),commandMs:{p50:latencies[Math.floor(latencies.length*.5)],p95:latencies[Math.floor(latencies.length*.95)],p99:latencies[Math.floor(latencies.length*.99)]},samples};
}
