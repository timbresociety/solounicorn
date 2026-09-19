import {productBrief,draftOption} from '../../src/game/founder/toys';
import {it, expect} from 'vitest';
import {advance,command,createCompany,metrics,priceTarget,skillCost,validateCompany,signal,ready} from '../../src/game/founder/engine';
import {FUNCTIONS, type Work, type Axis} from '../../src/game/founder/profile';
import {encodeSave} from '../../src/game/founder/save';
import {writeFileSync,mkdirSync,writeSync} from 'node:fs';

export async function operate(seed:number, maxTicks=45000,capital:'bootstrap'|'debt'='bootstrap'){
 let s=command(createCompany(seed),{type:'start'});s=command(s,{type:'channel',channel:2});
 const buy=(f:Work,a:Axis)=>{s=command(s,{type:'buy',work:f,axis:a,rank:s.ranks[f][a]+1});};
 buy('demand','automate');buy('product','automate');
 const checkpoints:unknown[]=[];
 for(let n=0;n<maxTicks/10&&!['failure','unicorn'].includes(s.phase);n++){
   if(s.phase==='quarter-draft'){
     const report=s.reports.find(r=>r.quarter===s.pendingDraftQuarter);
     if(!report)throw new Error('Quarter draft has no pending report');
     const id=report.choices.find(id=>draftOption(s,id,report.quarter)?.available);
     s=id?command(s,{type:'draft',quarter:report.quarter,id}):command(s,{type:'draft-skip',quarter:report.quarter});
   }
   if(s.phase==='paused')s=command(s,{type:'continue'});
   if(s.phase!=='active'&&s.phase!=='continuation')throw new Error(`Policy stalled in ${s.phase} at tick ${s.tick}`);
   const beforeTick=s.tick;
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
   // Founder protects threats and assists the slowest live handoff.
   const threat=s.accounts.find(a=>a.active&&a.threat);
   if(threat&&threat.problem&&ready(s,'retention')){s=command(s,{type:'focus',work:'retention'});for(let attempt=0;attempt<16;attempt++){const problem=s.accounts.find(a=>a.id===threat.id)?.problem;if(!problem)break;const before=problem.workCompleted;s=command(s,{type:'squash-problem',account:threat.id,problem:problem.id,expected:before});if(s.accounts.find(a=>a.id===threat.id)?.problem?.workCompleted===before)break;}}
   else if(s.trials.length&&ready(s,'monetisation')&&Math.abs((s.tick%60)/60-.5)<.2){s=command(s,{type:'focus',work:'monetisation'});s=command(s,{type:'price',job:s.trials[0].id,plan:'fair',timing:priceTarget(s).center});}
   else if(s.leads.length&&ready(s,'product')){s=command(s,{type:'focus',work:'product'});const lead=s.leads[0];productBrief(s,lead).parts.forEach((part,slot)=>{s=command(s,{type:'part',job:lead.id,slot,part});});s=command(s,{type:'test-build',job:lead.id});s=command(s,{type:'ship',job:lead.id,early:false});}
   else if(ready(s,'demand')&&s.leads.length<2){s=command(s,{type:'focus',work:'demand'});if(signal(s).quality==='noise')s=command(s,{type:'demand',pursue:false,signal:s.signal});s=command(s,{type:'demand',pursue:true,signal:s.signal});}
   s=advance(s,10);
   if(s.tick===beforeTick&&!['failure','unicorn'].includes(s.phase))throw new Error(`Policy made no progress at tick ${s.tick}`);
   // Long-lived companies must yield to Vitest's worker heartbeat; simulation time is unchanged.
   if(n%50===0)await new Promise<void>(resolve=>setImmediate(resolve));
   if(s.tick%1800===0){if(process.env.FOUNDER_POLICY_PROGRESS)writeSync(1,`Policy ${capital}/${seed}: tick ${s.tick}, ${s.phase}, ${s.actions.length} actions\n`);validateCompany(s);checkpoints.push({tick:s.tick,quarter:s.quarter,cash:s.cash,...metrics(s),ranks:s.ranks});}
 }
 validateCompany(s);return {s,checkpoints};
}
it('validates bootstrap and debt accounting through failures and horizon-censored survivors',async()=>{
 mkdirSync('artifacts/qa/founder',{recursive:true});
 const results=[];
 for(const capital of ['bootstrap','debt'] as const)for(const seed of [19,77,84022]){
   const started=performance.now();
   const {s,checkpoints}=await operate(seed,27000,capital);
   const outcome=s.phase==='failure'?'failure':s.phase==='unicorn'?'unicorn':'horizon-censored';
   if(capital==='bootstrap'&&seed===19&&s.phase==='unicorn'){
     writeFileSync('artifacts/qa/founder/earned-winner.json',encodeSave(s));
     const apex=command(command(command(s,{type:'continue'}),{type:'focus',work:'operations'}),{type:'pause'});
     writeFileSync('artifacts/qa/founder/earned-apex.json',encodeSave(apex));
   }
   results.push({seed,capital,status:s.phase,outcome,horizonTicks:27000,elapsedMs:Math.round(performance.now()-started),tick:s.tick,quarter:s.quarter,failure:s.failure,valuation:metrics(s).valuation,cash:s.cash,ranks:s.ranks,checkpoints});
 }
 writeFileSync('artifacts/qa/founder/policy.json',JSON.stringify(results,null,2));
 console.log(results.map(({seed,capital,status,outcome,tick,valuation,failure,elapsedMs})=>({seed,capital,status,outcome,tick,valuation,failure,elapsedMs})));
 // Candidate balance is not locked. This policy is a deterministic accounting
 // regression, not evidence that every fixed policy reaches a unicorn.
 // Survival at the 45-minute horizon is neither a win nor a failure.
 // Preserve the horizon and disclose censoring rather than forcing an outcome.
 for(const r of results){
   if(r.outcome==='horizon-censored'){expect(r.tick).toBe(r.horizonTicks);expect(['active','quarter-draft','paused']).toContain(r.status);expect(r.failure).toBe('');}
   else expect(['failure','unicorn']).toContain(r.status);
 }
 for(const capital of ['bootstrap','debt'])expect(results.some(r=>r.capital===capital&&r.status==='failure')).toBe(true);
 const idle=command(createCompany(404),{type:'start'});idle.cash=1;const idleFailure=advance(idle,600);
 expect(idleFailure.phase).toBe('failure');expect(idleFailure.failure).toContain('operating bill');
 expect(results.filter(r=>r.status==='unicorn').every(r=>r.valuation>=100000000000)).toBe(true);
},600000);
