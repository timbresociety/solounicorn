import { describe, expect, it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { advance, agentStatus, arr, command, computeCost, createCompany, monthlyCost, pressure, pricingQuote, random, rebaseCompany, replayCompany, signal, validateCompany } from '../../src/game/founder/engine';
import { AXES, FUNCTIONS, P, skillRank } from '../../src/game/founder/profile';
import { checksum, decodeSave, encodeSave } from '../../src/game/founder/save';
import { productBrief } from '../../src/game/founder/toys';
import type { Account, Company } from '../../src/game/founder/model';

const start=(seed=1001)=>{const s=command(createCompany(seed),{type:'start'});s.focus='skills';s.cash=100_000_000;s.serial=1000;return s;};
const account=(id=800):Account=>({id,origin:id,segment:0,count:1,price:4000,basePrice:4000,fit:.8,health:80,defects:0,born:-1200,caredUntil:10000,addons:0,threat:0,earned:0,remainder:0,active:true});
const problem=(s:Company,id=900,deadline=500)=>{const a=s.accounts[0];a.caredUntil=0;a.threat=deadline;a.problem={id,kind:'trust',label:'Promise slipping',detail:'Fix the missed promise.',openedAt:s.tick,deadline,severity:2,workRequired:8,workCompleted:0,exposedArr:a.price*12};};
const until=(s:Company,test:(s:Company)=>boolean,max=500)=>{for(let i=0;i<max&&!test(s)&&s.phase==='active';i++)s=advance(s);return s;};

describe('S10 integrated company automation',()=>{
  it('installs every one of the 96 named ranks once and replays the commitments',()=>{
    const fixture=start();fixture.cash=1_000_000_000_000;let s=rebaseCompany(fixture);
    for(const f of FUNCTIONS)for(const axis of AXES)for(let rank=1;rank<=4;rank++){
      expect(skillRank(f,axis,rank)?.effectId).toBe(`skill:${f}.${axis}.${rank}`);
      s=command(s,{type:'buy',work:f,axis,rank});expect(s.ranks[f][axis]).toBe(rank);
    }
    expect(FUNCTIONS.reduce((sum,f)=>sum+AXES.reduce((n,a)=>n+s.ranks[f][a],0),0)).toBe(96);
    expect(replayCompany(s)).toEqual(s);expect(decodeSave(encodeSave(s))).toEqual(s);
  });

  it('never chains new Demand, Product and Monetisation output within a tick',()=>{
    let s=start();for(const f of ['demand','product','monetisation'] as const){s.ranks[f].automate=4;s.credits[f]=.999;}
    while(signal(s).quality!=='qualified')s.signal++;
    s=rebaseCompany(s);s=advance(s);
    expect(s.leads.length).toBeGreaterThan(0);expect(s.recipe.id).toBe(0);expect(s.trials).toHaveLength(0);expect(arr(s)).toBe(0);
    s=until(s,x=>!!x.completed.product);expect(s.trials.length).toBeGreaterThan(0);expect(s.completed.monetisation).toBe(0);
    s=until(s,x=>!!x.completed.monetisation);expect(arr(s)).toBeGreaterThan(0);expect(replayCompany(s)).toEqual(s);validateCompany(s);
  });

  it('assembles, tests and ships one persisted recipe with a lossless founder handoff',()=>{
    let s=start();s.ranks.product.automate=4;s.leads=[{id:500,segment:0,count:1,fit:.9,expires:1000}];s.credits.product=.999;s=rebaseCompany(s);s=advance(s);
    expect(s.recipe.id).toBe(500);expect(s.recipe.slots.filter(x=>x!==null)).toHaveLength(1);expect(s.trials).toHaveLength(0);
    s=command(s,{type:'focus',work:'product'});const partial=structuredClone(s.recipe);expect(s.jobs.reservations[0].owner).toBe('founder');
    s=advance(decodeSave(encodeSave(s)),30);expect(s.recipe).toEqual(partial);expect(s.trials).toHaveLength(0);
    s=command(s,{type:'focus',work:'skills'});s=until(s,x=>!!x.recipe.tested);expect(s.recipe.verification).toBe('verified');expect(s.trials).toHaveLength(0);
    s=until(s,x=>!!x.completed.product);expect(s.trials).toHaveLength(1);expect(s.productResolution).toMatchObject({leadId:500,trialsCreated:1,arrDelta:0});
    expect(replayCompany(s)).toEqual(s);validateCompany(s);
  });

  it('does not strand the remainder of a Product or Monetisation batch under a closed ID',()=>{
    let s=start();s.focus='product';s.leads=[{id:500,segment:0,count:2,fit:.9,expires:1000}];s=rebaseCompany(s);
    for(let n=0;n<2;n++){
      const lead=s.leads[0];productBrief(s,lead).parts.forEach((part,slot)=>s=command(s,{type:'part',job:lead.id,slot,part}));
      s=command(s,{type:'test-build',job:lead.id});s=command(s,{type:'ship',job:lead.id,early:false});
    }
    expect(s.leads).toHaveLength(0);expect(s.trials.reduce((n,t)=>n+t.count,0)).toBe(2);
    s.ranks.monetisation.automate=4;s.focus='skills';s=rebaseCompany(s);s=until(s,x=>!x.trials.length);
    expect(s.completed.monetisation).toBe(2);expect(replayCompany(s)).toEqual(s);
    const t=start();t.trials=[{id:500,segment:0,count:2,fit:.9,expires:1000}];t.ranks.monetisation.automate=4;
    expect(pricingQuote(t,'fair',true).baseArr).toBe(3200*12);
    const priced=until(t,x=>x.completed.monetisation===2);expect(priced.trials).toHaveLength(0);expect(priced.accounts.reduce((n,a)=>n+a.count,0)).toBe(2);
  });

  it('respects founder timing, installation, disabled agents and finite blocked credits',()=>{
    let s=start();s.focus='monetisation';s.trials=[{id:500,segment:0,count:1,fit:.9,expires:1000}];s.ranks.monetisation.automate=4;s.credits.monetisation=.999;
    s=advance(s,20);expect(s.accounts).toHaveLength(0);expect(s.credits.monetisation).toBe(0);expect(agentStatus(s,'monetisation').state).toBe('founder');
    s=command(s,{type:'focus',work:'skills'});s.deployed.monetisation=s.tick+20;s=advance(s,19);expect(s.accounts).toHaveLength(0);expect(agentStatus(s,'monetisation').state).toBe('installing');
    s=command(s,{type:'automation',work:'monetisation'});expect(computeCost(s,'monetisation')).toBe(0);s=advance(s,30);expect(s.accounts).toHaveLength(0);
    s=command(s,{type:'automation',work:'monetisation'});s=until(s,x=>!!x.accounts.length);expect(s.completed.monetisation).toBe(1);
    s=advance(s,200);expect(s.credits.monetisation).toBe(0);expect(agentStatus(s,'monetisation').state).toBe('waiting');validateCompany(s);
    const back=start();back.ranks.demand.automate=4;back.leads=[{id:500,count:12,fit:.9,segment:0,expires:1000}];back.credits.demand=.999;
    const blocked=advance(back,50);expect(agentStatus(blocked,'demand').state).toBe('backpressure');expect(blocked.attempts.demand).toBe(0);expect(blocked.credits.demand).toBe(0);
  });

  it('resumes founder work after enabling or first installing agents offscreen',()=>{
    let s=start(1014);s.focus='product';s.leads=[{id:500,count:1,segment:0,fit:.9,expires:1000}];s=command(s,{type:'part',job:500,slot:0,part:0});
    s=command(s,{type:'focus',work:'skills'});expect(s.jobs.reservations[0].owner).toBe('founder');
    s=command(s,{type:'buy',work:'product',axis:'automate',rank:1});expect(s.jobs.reservations).toHaveLength(0);
    s=command(s,{type:'focus',work:'product'});s=command(s,{type:'part',job:500,slot:0,part:0});s=command(s,{type:'automation',work:'product'});
    s=command(s,{type:'focus',work:'skills'});expect(s.jobs.reservations[0].owner).toBe('founder');
    s=command(s,{type:'automation',work:'product'});expect(s.jobs.reservations).toHaveLength(0);s=rebaseCompany(s);s=until(s,x=>!!x.completed.product);expect(s.completed.product).toBe(1);expect(replayCompany(s)).toEqual(s);
  });

  it('keeps the in-progress merge board until it is served, then fills the second slot',()=>{
    let s=start();s.accounts=[account(),{...account(801),basePrice:100,price:100}];s.ranks.expansion.automate=4;s.credits.expansion=.999;s=rebaseCompany(s);s=advance(s);
    expect(s.package.id).toBe(800);const board=structuredClone(s.package.board);
    s=command(s,{type:'focus',work:'expansion'});expect(s.jobs.reservations[0].owner).toBe('founder');s=advance(s,30);expect(s.package.board).toEqual(board);
    s=command(s,{type:'focus',work:'skills'});s=until(s,x=>x.accounts.every(a=>a.addons===2),1500);
    expect(s.accounts.map(a=>a.addons)).toEqual([2,2]);expect(s.completed.expansion).toBe(4);expect(replayCompany(s)).toEqual(s);validateCompany(s);
  });

  it('allows a new Retention problem after a completed intervention and a firebreak',()=>{
    let seed=1;while(random(seed,'threat',800,610)>.00001)seed++;
    let s=start(seed);s.accounts=[account()];problem(s);s.focus='retention';s.ranks.retention.craft=4;s=command(s,{type:'squash-problem',account:800,problem:900,expected:0});
    expect(s.jobs.closed['retention:800'].reason).toBe('completed');s=advance(s,610);expect(s.accounts[0].problem).toBeDefined();expect(s.jobs.closed['retention:800']).toBeUndefined();
    const id=s.accounts[0].problem!.id;s.inventory.consumables['consumable:customer-firebreak']=1;
    s=command(s,{type:'consume',id:'consumable:customer-firebreak',account:800});expect(s.accounts[0].problem).toBeUndefined();expect(s.accounts[0].threat).toBe(0);
    expect(command(s,{type:'squash-problem',account:800,problem:id,expected:0}).actionResults.at(-1)?.reason).toBe('stale-job');
  });

  it('runs all six real workflows and freezes them across quarter drafts and reloads',()=>{
    let s=start(1007);s.accounts=[account()];problem(s,900,500);
    for(const f of FUNCTIONS){s.ranks[f].automate=4;s.ranks[f].craft=4;}
    s=rebaseCompany(s);s=advance(s,1800);
    expect(s.phase).toBe('quarter-draft');for(const f of FUNCTIONS)expect(s.completed[f],f).toBeGreaterThan(0);
    expect(s.ops.claimed).toHaveLength(s.ops.patches.length);expect(s.ops.used).toBe(2);
    const restored=decodeSave(encodeSave(s));expect(advance(restored,2000)).toBe(restored);expect(replayCompany(s)).toEqual(s);validateCompany(s);
  });

  it('ends a failing automated ticket at the boundary without a reward or victory overwrite',()=>{
    let s=start(1011);s.tick=1799;s.cash=0;s.ranks.operations.automate=4;s.credits.operations=.999;
    s.ops={...s.ops,id:600,active:true,status:'bought',price:300,purchasedAt:0,purchasedBy:'automated',patches:[{id:0,label:'Cash loss',valueCents:-500,sentiment:'negative',effect:{kind:'cash',cents:-500}}]};
    s.jobs.reservations=[{jobId:'operations:600',owner:'agent:operations',reservedAt:0,actionId:'fixture'}];
    s=rebaseCompany(s);s=advance(s,100);expect(s.phase).toBe('failure');expect(s.tick).toBe(1800);expect(s.failure).toContain('Operations ticket settlement');expect(s.reports).toHaveLength(0);expect(s.wonAt).toBeNull();expect(advance(s,50)).toBe(s);expect(replayCompany(s)).toEqual(s);validateCompany(s);
  });

  it('keeps another Retention intervention running beside a founder-held problem',()=>{
    let s=start(1012);s.accounts=[account()];problem(s);s.accounts.push({...account(801),caredUntil:0,threat:500,problem:{...s.accounts[0].problem!,id:901}});
    s.focus='retention';s.ranks.retention.automate=4;s.ranks.retention.craft=2;
    s=command(s,{type:'squash-problem',account:800,problem:900,expected:0});s=rebaseCompany(s);s=advance(s,40);
    expect(s.accounts[0].problem?.workCompleted).toBe(4);expect(s.accounts[1].problem).toBeUndefined();expect(replayCompany(s)).toEqual(s);
  });

  it('keeps a valid recipe available after explained purchased-Luck rework',()=>{
    let s=start(1013);s.focus='product';s.ranks.product.luck=4;s.risky.product=true;s.strain=10000;s.leads=[{id:500,count:1,segment:0,fit:.9,expires:1000}];
    const parts=productBrief(s,s.leads[0]).parts;parts.forEach((part,slot)=>s=command(s,{type:'part',job:500,slot,part}));s=command(s,{type:'test-build',job:500});s=rebaseCompany(s);
    s=command(s,{type:'ship',job:500,early:false});expect(s.trials).toHaveLength(0);expect(s.recipe.verification).toBe('verified');expect(s.jobs.closed['lead:500']).toBeUndefined();expect(s.log.at(-1)?.text).toContain('Luck 4 produced rework');expect(replayCompany(s)).toEqual(s);
  });

  it('preserves candidate.9 paid and partial work while rebasing scheduler history',()=>{
    let s=start();s.focus='operations';s=command(s,{type:'ops-deal'});s=command(s,{type:'ops-inspect',card:s.ops.id,cell:0});s=command(s,{type:'focus',work:'product'});s.leads=[{id:500,count:1,segment:0,fit:.9,expires:1000}];s=command(s,{type:'part',job:500,slot:0,part:1});
    const envelope=JSON.parse(encodeSave(s)),data=JSON.parse(envelope.data);data.version='founder-candidate.9';data.credits.product=.8;
    envelope.balanceVersion=data.version;envelope.data=JSON.stringify(data);envelope.checksum=checksum(envelope.data);
    const migrated=decodeSave(JSON.stringify(envelope));expect(migrated.version).toBe(P.version);expect(migrated.cash).toBe(s.cash);expect(migrated.recipe).toEqual(s.recipe);expect(migrated.ops).toEqual(s.ops);expect(migrated.operationsReturns).toEqual(s.operationsReturns);expect(migrated.jobs).toEqual(s.jobs);expect(migrated.credits.product).toBe(0);expect(replayCompany(migrated)).toEqual(migrated);
  });

  it('exposes deterministic slowdown, bill load and customer consequences with a recoverable configuration',()=>{
    const build=(over:boolean)=>{const s=start(1010);s.accounts=[account()];problem(s,900,200);for(const f of FUNCTIONS){s.ranks[f].automate=1;s.ranks[f].craft=4;if(over&&f!=='operations'&&f!=='retention')s.ranks[f].scale=4;}return rebaseCompany(s);};
    const calm=build(false),over=build(true),a=advance(calm,600),b=advance(over,600);
    expect(pressure(over).speed).toBeLessThan(pressure(calm).speed);expect(monthlyCost(over)).toBeGreaterThan(monthlyCost(calm));
    expect(b.strain).toBeGreaterThan(a.strain);expect(b.accounts[0].active).toBe(false);expect(a.accounts[0].active).toBe(true);expect(b.expenses).toBeGreaterThan(a.expenses);
    const rotted=structuredClone(calm);rotted.rot.product=1;expect(agentStatus(rotted,'product').speed).toBeCloseTo(agentStatus(calm,'product').speed/3);
    let recovered=structuredClone(b);for(const f of FUNCTIONS)recovered=command(recovered,{type:'automation',work:f});
    expect(FUNCTIONS.reduce((n,f)=>n+computeCost(recovered,f),0)).toBe(0);expect(pressure(recovered).load).toBeLessThan(pressure(b).load);
    for(let rank=1;rank<=4;rank++)recovered=command(recovered,{type:'buy',work:'operations',axis:'scale',rank});
    recovered=advance(recovered,600);expect(recovered.strain).toBeLessThan(b.strain);
    expect(b.cash).toBeLessThan(a.cash);expect(pressure(b).rot).toBeGreaterThan(pressure(a).rot);
    const summary=(s:Company)=>({tick:s.tick,compute:FUNCTIONS.reduce((n,f)=>n+computeCost(s,f),0),cost:monthlyCost(s),cash:s.cash,expenses:s.expenses,strain:s.strain,rot:s.rot,pressure:pressure(s),firstAccountActive:s.accounts[0].active,completed:s.completed});
    mkdirSync('artifacts/qa/founder-revamp/S10',{recursive:true});writeFileSync('artifacts/qa/founder-revamp/S10/pressure.json',JSON.stringify({profile:P.version,seed:1010,scenario:'Diagnostic matched starting ledgers, 600 ticks; not an earned run or balance certification',controlled:summary(a),overextended:summary(b),disabled:summary(recovered)},null,2)+'\n');
  });
});
