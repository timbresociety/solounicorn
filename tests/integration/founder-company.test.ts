import {bankHits,productBrief} from '../../src/game/founder/toys';
import { describe, expect, it } from 'vitest';
import { advance, agentCount, arr, command, createCompany, metrics, random, replayCompany, signal, validateCompany } from '../../src/game/founder/engine';
import { P } from '../../src/game/founder/profile';
import { decodeSave, encodeSave } from '../../src/game/founder/save';
import type { Company } from '../../src/game/founder/model';
function start(seed=77){return command(createCompany(seed),{type:'start'});}
function customer(s:Company):Company{
  s=command(s,{type:'channel',channel:2});
  for(let n=0;n<100&&!s.accounts.some(a=>a.active);n++){
    s=command(s,{type:'focus',work:'demand'});
    if(signal(s).quality==='noise')s=command(s,{type:'demand',pursue:false,signal:s.signal});
    s=command(s,{type:'demand',pursue:true,signal:s.signal});
    if(s.leads.length){const lead=s.leads[0];s=command(s,{type:'focus',work:'product'});productBrief(s,lead).parts.forEach((part,slot)=>{s=command(s,{type:'part',job:lead.id,part,slot});});s=command(s,{type:'test-build',job:lead.id});s=command(s,{type:'ship',job:lead.id,early:false});}
    if(s.trials.length){s=command(s,{type:'focus',work:'monetisation'});s=advance(s,(30-s.tick%60+60)%60);s=command(s,{type:'price',job:s.trials[0].id,plan:'fair'});}
    s=advance(s,60);
  }
  return s;
}
describe('founder company candidate',()=>{
  it('keeps agent count tied to Automate ranks, not Scale capacity or total skill ranks',()=>{
    let s=start();
    s=command(s,{type:'buy',work:'monetisation',axis:'automate',rank:1});
    s=command(s,{type:'buy',work:'monetisation',axis:'scale',rank:1});
    expect(agentCount(s,'monetisation')).toBe(1);
    expect(agentCount(s,'demand')).toBe(0);
    expect(P.units_by_scale_rank[s.ranks.monetisation.scale]).toBe(2);
  });

  it('makes real subscriptions from semantic work, bills in arrears, reconciles collections and saves',()=>{
    let s=customer(start());expect(arr(s)).toBeGreaterThan(0);expect(s.lifetimeCollected).toBe(0);expect(s.lifetimeEarned).toBeGreaterThan(0);validateCompany(s);
    s=advance(s,1200);expect(s.lifetimeCollected).toBeGreaterThan(0);validateCompany(s);expect(decodeSave(encodeSave(s))).toEqual(s);
    expect(()=>decodeSave(encodeSave(s).replace('founder-candidate','tampered'))).toThrow();
  });
  it('replays exactly and time rebatching does not reroll work',()=>{
    const one=customer(start(19)),two=customer(start(19));expect(one).toEqual(two);expect(replayCompany(one)).toEqual(one);
    expect(advance(one,300)).toEqual(Array.from({length:300}).reduce<Company>(s=>advance(s),two));
    const paused=command(one,{type:'pause'});expect(advance(paused,1000)).toBe(paused);expect(command(paused,{type:'demand',pursue:true,signal:paused.signal})).toBe(paused);
  });
  it('agents consume real queues, unlock after deployment, cost cash, and accumulate rot',()=>{
    let s=start();s=command(s,{type:'buy',work:'demand',axis:'automate',rank:1});s=command(s,{type:'buy',work:'product',axis:'automate',rank:1});
    s=command(s,{type:'focus',work:'skills'});const initial=s.cash;s=advance(s,49);expect(s.completed.demand).toBe(0);s=advance(s,500);expect(s.completed.demand).toBeGreaterThan(0);expect(s.completed.product).toBeGreaterThan(0);expect(s.rot.product).toBeGreaterThan(0);expect(s.cash).toBeLessThan(initial);validateCompany(s);
    const n=s.completed.product;s=command(s,{type:'automation',work:'product'});s=advance(s,100);expect(s.completed.product).toBe(n);
  });
  it('cannot create output with invalid/stale/duplicate toy commits',()=>{
    let s=start();const cash=s.cash;s=command(s,{type:'price',job:99,plan:'fair'});s=command(s,{type:'expand',account:1});s=command(s,{type:'repair',target:'rot'});expect(s.cash).toBe(cash);expect(arr(s)).toBe(0);
    s=customer(s);const customerCount=s.accounts.length;s=command(s,{type:'price',job:999,plan:'fair'});expect(s.accounts.length).toBe(customerCount);
  });
  it('closes quarters continuously, offers deterministic affordable build choices, never duplicates a draft',()=>{
    let s=advance(start(),1800);expect(s.quarter).toBe(2);expect(s.status).toBe('running');expect(s.paused).toBe(false);expect(s.reports).toHaveLength(1);const id=s.reports[0].choices[0];s=command(s,{type:'draft',quarter:1,id});const cash=s.cash;s=command(s,{type:'draft',quarter:1,id});expect(s.cash).toBe(cash);expect(s.upgrades).toEqual([id]);
  });
  it('fails on unpaid bills, and an accepted VC miss is terminal without creating ARR',()=>{
    const idle=advance(start(),10000);expect(idle.status).toBe('failed');expect(idle.failure).toContain('no liquid cash');
    const broke=start();broke.cash=1;expect(advance(broke,600).failure).toContain('operating bill');
    let s=customer(start(16));s.accounts[0].count=20; // isolated funding eligibility fixture
    const before=arr(s);s=command(s,{type:'raise'});expect(s.vc).not.toBeNull();expect(arr(s)).toBe(before);const original=s.cash;s=command(s,{type:'raise'});expect(s.cash).toBe(original);s.accounts.forEach(a=>a.caredUntil=100000);s=advance(s,1800);expect(s.status).toBe('failed');expect(s.failure).toContain('VC mandate missed');
  });
  it('missed customer threats destroy ARR; care preserves ARR and expansion has finite slots',()=>{
    let s=customer(start(6));const a=s.accounts.find(a=>a.active)!;a.threat=s.tick+10;const before=arr(s);s=advance(s,10);expect(arr(s)).toBeLessThan(before);
    s=customer(start(6));const saved=s.accounts.find(a=>a.active)!;saved.threat=s.tick+10;s=command(s,{type:'focus',work:'retention'});const initial=arr(s);for(let hit=0;hit<bankHits(s);hit++)s=command(s,{type:'hit-bank',account:saved.id,expected:hit});expect(arr(s)).toBe(initial);expect(s.accounts.find(a=>a.id===saved.id)?.threat).toBe(0);
  });
  it('Luck has a slightly negative raw EV and correlated shocks',()=>{
    let total=0;const ranks=4,n=10000;for(let i=0;i<n;i++){const shared=random(9,'shared',i)<.5?-1:1,local=random(9,'local',i)<.5?-1:1;total+=1+P.luck_mean_per_rank*ranks+P.luck_sd_per_rank*ranks*(Math.sqrt(.4)*shared+Math.sqrt(.6)*local);}expect(total/n).toBeGreaterThan(.93);expect(total/n).toBeLessThan(.99);
  });
  it('win checks run after obligations; earned founder advantages are explicit',()=>{
    const s=customer(start());s.accounts[0].count=100000;s.cash=1e12;s.accounts[0].caredUntil=1e9;const winner=advance(s,10);expect(metrics(winner).valuation).toBeGreaterThanOrEqual(P.win_valuation_cents);expect(winner.status).toBe('won');const resumed=command(winner,{type:'continue'});expect(advance(resumed,10).status).toBe('running');expect(createCompany(1,2).cash).toBe(P.starting_cash_cents+2*P.winCashBonus);
  });
});

it('exports reproducible browser fixtures, with diagnostic fixtures explicitly separated',async()=>{
  const {mkdirSync,writeFileSync}=await import('node:fs');mkdirSync('artifacts/qa/founder',{recursive:true});
  const fresh=createCompany(77);const worked=customer(start());worked.paused=true;
  const retention=structuredClone(worked);retention.focus='retention';retention.accounts.filter(a=>a.active).forEach(a=>{a.threat=retention.tick+120;a.caredUntil=0;});
  const expansion=structuredClone(worked);expansion.focus='expansion';expansion.accounts.filter(a=>a.active).forEach(a=>{a.born=expansion.tick-1200;a.threat=0;a.health=80;});
  const operations=structuredClone(worked);operations.focus='operations';operations.rot.product=.35;operations.strain=5;
  const finance=advance(start(),1800);finance.focus='finance';finance.paused=true;
  const apex=structuredClone(expansion);apex.cash=500000000;for(const f of ['demand','product','monetisation','retention','expansion','operations'] as const){apex.ranks[f]={craft:4,scale:4,automate:4,luck:0};}apex.focus='operations';apex.rot.product=.35;apex.strain=5;
  writeFileSync('artifacts/qa/founder/browser-fixtures.json',JSON.stringify({fresh:encodeSave(fresh),worked:encodeSave(worked),retention:encodeSave(retention),expansion:encodeSave(expansion),operations:encodeSave(operations),finance:encodeSave(finance),apex:encodeSave(apex)}));
});

it('guards duplicate rank clicks, optional luck exposure, and finite repair output',()=>{
 let s=start();s=command(s,{type:'buy',work:'demand',axis:'luck',rank:1});const spent=s.cash;s=command(s,{type:'buy',work:'demand',axis:'luck',rank:1});expect(s.cash).toBe(spent);expect(s.ranks.demand.luck).toBe(1);expect(s.risky.demand).toBe(true);s=command(s,{type:'risk',work:'demand'});expect(s.risky.demand).toBe(false);
 s=command(s,{type:'focus',work:'operations'});s.rot.product=.03;s.strain=1;[0,1,2].forEach(cell=>{s=command(s,{type:'reveal',cell});});s=command(s,{type:'repair',target:'rot'});expect(s.strain).toBe(1);expect(s.rot.product).toBeGreaterThanOrEqual(.022);const rot=s.rot.product;s=command(s,{type:'repair',target:'rot'});expect(s.rot.product).toBe(rot);
});

it('keeps founder assembly reserved while agents work on other eligible requests',()=>{
 let s=start();s=command(s,{type:'buy',work:'product',axis:'automate',rank:1});s=command(s,{type:'focus',work:'demand'});
 while(!s.leads.length){s=command(s,{type:'demand',pursue:true,signal:s.signal});s=advance(s,20);}
 const lead=s.leads[0];s=command(s,{type:'focus',work:'product'});s=command(s,{type:'part',job:lead.id,slot:0,part:productBrief(s,lead).parts[0]});s=advance(s,200);expect(s.leads.some(j=>j.id===lead.id)).toBe(true);expect(s.recipe.id).toBe(lead.id);
});
