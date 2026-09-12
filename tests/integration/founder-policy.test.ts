import {bankHits,productBrief} from '../../src/game/founder/toys';
import {it, expect} from 'vitest';
import {advance,command,createCompany,metrics,skillCost,validateCompany,signal,ready} from '../../src/game/founder/engine';
import {FUNCTIONS, type Work, type Axis} from '../../src/game/founder/profile';
import {encodeSave} from '../../src/game/founder/save';
import {writeFileSync,mkdirSync} from 'node:fs';

export function operate(seed:number, maxTicks=45000,capital:'bootstrap'|'debt'='bootstrap'){
 let s=command(createCompany(seed),{type:'start'});s=command(s,{type:'channel',channel:2});
 const buy=(f:Work,a:Axis)=>{s=command(s,{type:'buy',work:f,axis:a,rank:s.ranks[f][a]+1});};
 buy('demand','automate');buy('product','automate');
 const checkpoints:unknown[]=[];
 for(let n=0;n<maxTicks/10&&s.status==='running';n++){
   const m=metrics(s);
   if(capital==='debt'&&!s.debt&&m.mrr>=10000&&s.cash<s.expenseAccrued+m.cost*(600-s.tick%600)/600+m.cost*.5)s=command(s,{type:'borrow'});
   // Invest only while current bills and a reserve are covered. Buy capacity only with current bills and a reserve covered.
   const candidates=FUNCTIONS.flatMap(f=>(['craft','automate','scale'] as Axis[]).filter(a=>s.ranks[f][a]<4).map(a=>({f,a,cost:skillCost(s,f,a)}))).sort((a,b)=>a.cost-b.cost);
   for(const c of candidates){
     if(c.f==='retention'&&!s.accounts.length||c.f==='expansion'&&s.tick<1200)continue;
     if(c.a==='scale'&&s.ranks[c.f].automate===0)continue;
     if(c.a==='scale'&&s.ranks[c.f].craft<s.ranks[c.f].scale+1)continue;
     if(s.cash>c.cost+Math.max(30000,m.cost*3)&&s.tick>s.deployed[c.f]){buy(c.f,c.a);break;}
   }
   for(const r of s.reports){if(!r.chosen){const id=r.choices.find(id=>!s.upgrades.includes(id));if(id&&s.cash>15000*r.quarter+m.cost*3)s=command(s,{type:'draft',quarter:r.quarter,id});}}
   // Founder protects threats and assists the slowest live handoff.
   const threat=s.accounts.find(a=>a.active&&a.threat);
   if(threat&&ready(s,'retention')){s=command(s,{type:'focus',work:'retention'});for(let hit=0;hit<bankHits(s);hit++)s=command(s,{type:'hit-bank',account:threat.id,expected:hit});}
   else if(s.trials.length&&ready(s,'monetisation')&&Math.abs((s.tick%60)/60-.5)<.2){s=command(s,{type:'focus',work:'monetisation'});s=command(s,{type:'price',job:s.trials[0].id,plan:'fair'});}
   else if(s.leads.length&&ready(s,'product')){s=command(s,{type:'focus',work:'product'});const lead=s.leads[0];productBrief(s,lead).parts.forEach((part,slot)=>{s=command(s,{type:'part',job:lead.id,slot,part});});s=command(s,{type:'test-build',job:lead.id});s=command(s,{type:'ship',job:lead.id,early:false});}
   else if(ready(s,'demand')&&s.leads.length<2){s=command(s,{type:'focus',work:'demand'});if(signal(s).quality==='noise')s=command(s,{type:'demand',pursue:false,signal:s.signal});s=command(s,{type:'demand',pursue:true,signal:s.signal});}
   s=advance(s,10);
   if(s.tick%1800===0){validateCompany(s);checkpoints.push({tick:s.tick,quarter:s.quarter,cash:s.cash,...metrics(s),ranks:s.ranks});}
 }
 validateCompany(s);return {s,checkpoints};
}
it('validates viable bootstrap and debt runs, plus genuine cashflow failure',()=>{
 mkdirSync('artifacts/qa/founder',{recursive:true});
 const results=(['bootstrap','debt'] as const).flatMap(capital=>[19,77,84022].map(seed=>{
   const {s,checkpoints}=operate(seed,27000,capital);
   if(capital==='bootstrap'&&seed===19&&s.status==='won'){
     writeFileSync('artifacts/qa/founder/earned-winner.json',encodeSave(s));
     const apex=command(command(command(s,{type:'continue'}),{type:'focus',work:'operations'}),{type:'pause'});
     writeFileSync('artifacts/qa/founder/earned-apex.json',encodeSave(apex));
   }
   return{seed,capital,status:s.status,tick:s.tick,quarter:s.quarter,failure:s.failure,valuation:metrics(s).valuation,cash:s.cash,ranks:s.ranks,checkpoints};
 }));
 writeFileSync('artifacts/qa/founder/policy.json',JSON.stringify(results,null,2));
 console.log(results.map(({seed,capital,status,tick,valuation,failure})=>({seed,capital,status,tick,valuation,failure})));
 // Same market supports different outcomes. A financing rule must not guarantee victory.
 for(const seed of [19,77,84022])expect(results.some(r=>r.seed===seed&&r.status==='won')).toBe(true);
 for(const capital of ['bootstrap','debt'])expect(results.some(r=>r.capital===capital&&r.status==='won')).toBe(true);
 const idle=command(createCompany(404),{type:'start'});idle.cash=1;const idleFailure=advance(idle,600);
 expect(idleFailure.status).toBe('failed');expect(idleFailure.failure).toContain('operating bill');
 expect(results.filter(r=>r.status==='won').every(r=>r.valuation>=100000000000)).toBe(true);
},120000);
