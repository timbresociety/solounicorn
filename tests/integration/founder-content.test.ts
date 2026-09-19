import { describe, expect, it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { advance, arr, command, computeCost, createCompany, demandStake, forecast, metrics, monthlyCost, operationsUpkeep, rebaseCompany, replayCompany, validateCompany } from '../../src/game/founder/engine';
import { BUILD_FAMILIES, REWARDS, REWARD_EFFECTS, consumableUse, draftOption, effectActive, rewardById, rewardPool, validateRewardCatalogue } from '../../src/game/founder/rewards';
import { productBrief, quarterChoices } from '../../src/game/founder/toys';
import { checksum, decodeSave, encodeSave, HISTORY_KEY } from '../../src/game/founder/save';
import { decodeFounderHistory, inheritedStartingCash, recordFounderWin, syncFounderHistory } from '../../src/game/founder/history';
import { FUNCTIONS, P } from '../../src/game/founder/profile';
import type { Account, Company } from '../../src/game/founder/model';

function company(tick=0){const s=command(createCompany(1212),{type:'start'});s.cash=10_000_000;s.tick=tick;s.quarter=Math.floor(tick/1800)+1;s.focus='finance';return rebaseCompany(s);}
function customer(s:Company,addons=0){const a:Account={id:100,origin:100,segment:0,count:2,price:4000,basePrice:4000,fit:.9,health:90,defects:0,born:0,caredUntil:100000,addons,threat:0,earned:0,remainder:0,active:true};s.accounts.push(a);s.serial=200;return a;}
function relic(s:Company,id:string){const next=structuredClone(s);next.inventory.relics.push(id);return rebaseCompany(next);}
function ship(s:Company){s=command(s,{type:'focus',work:'product'});const lead=s.leads[0];for(const [slot,part] of productBrief(s,lead).parts.entries())s=command(s,{type:'part',job:lead.id,slot,part});s=command(s,{type:'test-build',job:lead.id});return command(s,{type:'ship',job:lead.id,early:false});}
function richContext(){const s=company(1800);customer(s,1);s.completed.product=1;for(const f of FUNCTIONS)s.ranks[f].automate=1;return rebaseCompany(s);}

describe('S12 build catalogue and draft',()=>{
 it('has four complete families and validated effect, localization and tradeoff contracts',()=>{
  validateRewardCatalogue();expect(REWARDS).toHaveLength(12);
  for(const family of Object.keys(BUILD_FAMILIES)){expect(REWARDS.filter(r=>r.family===family&&r.kind==='relic')).toHaveLength(2);expect(REWARDS.filter(r=>r.family===family&&r.kind==='consumable')).toHaveLength(1);}
  expect(new Set(REWARDS.map(r=>r.effect)).size).toBe(Object.keys(REWARD_EFFECTS).length);
  mkdirSync('artifacts/qa/founder-revamp/S12',{recursive:true});writeFileSync('artifacts/qa/founder-revamp/S12/catalogue.json',JSON.stringify({version:P.version,status:'candidate, not balanced or locked',items:REWARDS,effects:REWARD_EFFECTS},null,2)+'\n');
 });
 it('offers only relevant effects, never owned/full rewards or same-effect alternatives; seeds persist',()=>{
  const fresh=company();expect(rewardPool(fresh).every(r=>r.family==='bootstrap'||r.id==='relic:signal-ledger')).toBe(true);
  let s=richContext();s.inventory.relics=['relic:care-calendar'];s.inventory.consumables['consumable:customer-firebreak']=3;s=rebaseCompany(s);
  for(let seed=1;seed<=120;seed++){
   s.seed=seed;const offered=quarterChoices(s);expect(offered.length).toBeLessThanOrEqual(3);expect(offered).toEqual(quarterChoices(s));
   expect(offered).not.toContain('relic:care-calendar');expect(offered).not.toContain('consumable:customer-firebreak');
   expect(new Set(offered.map(id=>rewardById(id)?.effect)).size).toBe(offered.length);
  }
  s=advance(company(),1800);const choices=[...s.reports[0].choices];s=decodeSave(encodeSave(s));expect(s.reports[0].choices).toEqual(choices);
  const invalid=command(s,{type:'draft',quarter:1,id:'relic:reserved-instances'});expect(invalid.phase).toBe('quarter-draft');expect(invalid.inventory.relics).toEqual([]);expect(invalid.actionResults.at(-1)?.reason).toBe('stale-job');
  const selected=command(s,{type:'draft',quarter:1,id:choices[0]});expect(selected.phase).toBe('paused');expect(advance(selected,999)).toBe(selected);expect(replayCompany(selected)).toEqual(selected);
 });
 it('handles exhausted pools without fabricated rewards or a stuck quarter',()=>{
  let s=richContext();s.inventory.relics=REWARDS.filter(r=>r.kind==='relic').map(r=>r.id);s.inventory.consumables=Object.fromEntries(REWARDS.filter(r=>r.kind==='consumable').map(r=>[r.id,3]));s.tick=3599;s=rebaseCompany(s);
  expect(quarterChoices(s)).toEqual([]);s=advance(s);expect(s.phase).toBe('quarter-draft');expect(s.reports.at(-1)?.choices).toEqual([]);
  s=command(s,{type:'draft-skip',quarter:s.pendingDraftQuarter!});expect(s.phase).toBe('paused');expect(command(s,{type:'continue'}).phase).toBe('active');
 });
 it('does not double-stack saved legacy upgrades and matching relics',()=>{
  const s=company();s.upgrades=['lean','community','quality','terms','care'];const cost=monthlyCost(s),stake=demandStake(s);
  for(const id of ['relic:ramen-budget','relic:signal-ledger','relic:regression-suite','relic:clean-terms','relic:care-calendar'])expect(draftOption(s,id,1)?.available).toBe(false);
  s.inventory.relics=['relic:ramen-budget','relic:signal-ledger'];expect(monthlyCost(s)).toBe(cost);expect(demandStake(s)).toBe(stake);
 });
});

describe('S12 every relic changes its actual function',()=>{
 it('bootstrap reduces only overhead and changes only future invoice dates',()=>{
  let s=company();customer(s);s.ranks.product.scale=1;s.ranks.product.automate=1;s=rebaseCompany(s);
  const lean=relic(s,'relic:ramen-budget');expect(monthlyCost(lean)).toBeLessThan(monthlyCost(s));expect(computeCost(lean,'product')).toBe(computeCost(s,'product'));expect(arr(lean)).toBe(arr(s));
  s.invoices=[{id:300,account:100,cents:100,due:900,attempts:0}];s.lifetimeEarned=100;s=rebaseCompany(s);
  const terms=relic(s,'relic:clean-terms'),old=forecast(s).events.find(e=>e.label==='Expected collections'),next=forecast(terms).events.find(e=>e.label==='Expected collections');expect(next!.at).toBeLessThan(old!.at);
  const after=advance(terms,600);expect(after.invoices.find(i=>i.id===300)?.due).toBe(900);expect(after.invoices.some(i=>i.id!==300&&i.due===630)).toBe(true);expect(after.lifetimeCollected).toBe(0);validateCompany(after);
 });
 it('growth lowers paid acquisition stakes and improves real shipped fit without booking ARR',()=>{
  let s=company();expect(demandStake(relic(s,'relic:signal-ledger'))).toBe(Math.round(demandStake(s)*P.rewardDemandFactor));
  s.leads=[{id:100,segment:0,count:1,expires:2000,fit:.8}];s.serial=100;s=rebaseCompany(s);
  const normal=ship(s),improved=ship(relic(s,'relic:regression-suite'));expect(improved.trials[0].fit-normal.trials[0].fit).toBeCloseTo(P.rewardProductFit);expect(arr(improved)).toBe(0);expect(improved.productResolution?.trialsCreated).toBe(1);expect(replayCompany(improved)).toEqual(improved);
 });
 it('durable care extends only resolved protection and discounts only addon service',()=>{
  let s=company(1300);const a=customer(s);a.threat=1400;a.caredUntil=0;a.problem={id:201,kind:'trust',label:'Missing export',detail:'An existing customer needs their data.',openedAt:1200,deadline:1400,severity:1,workRequired:1,workCompleted:0,exposedArr:a.price*a.count*12};s=rebaseCompany(s);
  const care=relic(s,'relic:care-calendar'),resolved=command(command(care,{type:'focus',work:'retention'}),{type:'squash-problem',account:100,problem:201,expected:0});expect(resolved.accounts[0].caredUntil).toBe(1300+1200);expect(arr(resolved)).toBe(arr(s));expect(replayCompany(resolved)).toEqual(resolved);
  expect(monthlyCost(relic(s,'relic:shared-infrastructure'))).toBe(monthlyCost(s));s.accounts[0].addons=1;
  const service=relic(s,'relic:shared-infrastructure');expect(monthlyCost(s)-monthlyCost(service)).toBe(Math.round(2*P.monthlyService[0]*P.addon_service_cost_fraction*(1-P.rewardAddonServiceFactor)));expect(arr(service)).toBe(arr(s));
 });
 it('automation reduces real compute invoices and routine rot while preserving effort and pressure',()=>{
  let s=company();s.ranks.demand.automate=1;s.credits.demand=.999;s=rebaseCompany(s);
  const compute=relic(s,'relic:reserved-instances');expect(computeCost(compute,'demand')).toBe(Math.round(computeCost(s,'demand')*P.rewardComputeFactor));expect(metrics(compute).load).toBe(metrics(s).load);expect(monthlyCost(compute)).toBeLessThan(monthlyCost(s));
  const base=advance(s),paper=advance(relic(s,'relic:context-checksum'));expect(base.rot.demand).toBeGreaterThan(0);expect(paper.rot.demand).toBeCloseTo(base.rot.demand*P.rewardRotFactor);expect(paper.completed.demand).toBe(base.completed.demand);expect(paper.attempts.demand).toBe(base.attempts.demand);expect(replayCompany(paper)).toEqual(paper);
  const ops=company();ops.ranks.operations.automate=1;ops.credits.operations=.999;const discounted=relic(ops,'relic:reserved-instances'),ticket=advance(discounted),normal=advance(rebaseCompany(ops));expect(ticket.operationsReturns.automated.upkeep).toBe(operationsUpkeep(discounted));expect(ticket.operationsReturns.automated.upkeep).toBeLessThan(normal.operationsReturns.automated.upkeep);expect(ticket.operationsReturns.automated.patchValue).toBe(normal.operationsReturns.automated.patchValue);expect(replayCompany(ticket)).toEqual(ticket);
 });
});

describe('S12 consumable lifecycle',()=>{
 it.each(['consumable:weekend-budget','consumable:launch-checklist'])('%s expires in active time, pauses, reloads and never stacks or overspends charges',id=>{
  let s=company(1201);s.inventory.consumables[id]=2;s=rebaseCompany(s);const before=s.cash,base=arr(s);s=command(s,{type:'consume',id});expect(s.inventory.consumables[id]).toBe(1);expect(s.inventory.active).toEqual([{id,until:1801}]);expect(s.cash).toBe(before);expect(arr(s)).toBe(base);
  const duplicate=command(s,{type:'consume',id});expect(duplicate.inventory.consumables[id]).toBe(1);expect(duplicate.actionResults.at(-1)?.reason).toBe('stale-job');
  s=advance(s,599);expect(s.phase).toBe('quarter-draft');expect(effectActive(s,rewardById(id)!.effect)).toBe(true);s=decodeSave(encodeSave(s));expect(advance(s,9999)).toBe(s);
  s=command(s,{type:'draft-skip',quarter:s.pendingDraftQuarter!});expect(advance(s,9999)).toBe(s);s=advance(command(s,{type:'continue'}));expect(s.inventory.active).toEqual([]);expect(effectActive(s,rewardById(id)!.effect)).toBe(false);
  s=command(s,{type:'consume',id});expect(s.inventory.consumables[id]).toBe(0);expect(command(s,{type:'consume',id}).inventory.consumables[id]).toBe(0);expect(replayCompany(s)).toEqual(s);
 });
 it('temporary discounts and shipment fit use the same economic resolvers as relics',()=>{
  const s=company();s.inventory.consumables={'consumable:weekend-budget':1,'consumable:launch-checklist':1};s.leads=[{id:100,segment:0,count:1,expires:2000,fit:.8}];s.serial=100;const base=rebaseCompany(s);
  expect(monthlyCost(command(base,{type:'consume',id:'consumable:weekend-budget'}))).toBe(monthlyCost(relic(base,'relic:ramen-budget')));
  expect(ship(command(base,{type:'consume',id:'consumable:launch-checklist'})).trials[0].fit).toBe(ship(relic(base,'relic:regression-suite')).trials[0].fit);
 });
 it('cash forecast stops applying a temporary discount at its actual expiry',()=>{
  const input=company(1);input.inventory.consumables['consumable:weekend-budget']=1;
  const s=command(rebaseCompany(input),{type:'consume',id:'consumable:weekend-budget'}),bills=forecast(s).events.filter(e=>e.label==='Operating bill');
  expect(bills[0].cents).toBe(-Math.round(P.base_company_overhead_cents_per_month*P.rewardOverheadFactor*599/600));
  expect(bills[1].cents).toBe(-P.base_company_overhead_cents_per_month);expect(bills[2].cents).toBe(-P.base_company_overhead_cents_per_month);
 });
 it('firebreak targets a specific live problem and cannot spend on stale or churned accounts',()=>{
  let s=company();const a=customer(s);a.threat=30;a.problem={id:201,kind:'trust',label:'Export blocked',detail:'Send the export.',openedAt:0,deadline:30,severity:1,workRequired:4,workCompleted:0,exposedArr:96000};s.inventory.consumables['consumable:customer-firebreak']=2;s=rebaseCompany(s);
  const stale=command(s,{type:'consume',id:'consumable:customer-firebreak',account:100,problem:202});expect(stale.inventory.consumables['consumable:customer-firebreak']).toBe(2);
  const used=command(s,{type:'consume',id:'consumable:customer-firebreak',account:100,problem:201});expect(used.accounts[0].problem).toBeUndefined();expect(used.accounts[0].threat).toBe(0);expect(used.inventory.consumables['consumable:customer-firebreak']).toBe(1);expect(arr(used)).toBe(arr(s));expect(used.cash).toBe(s.cash);expect(replayCompany(used)).toEqual(used);
  const duplicate=command(used,{type:'consume',id:'consumable:customer-firebreak',account:100,problem:201});expect(duplicate.inventory.consumables['consumable:customer-firebreak']).toBe(1);
 });
 it('context reset clears only the selected function and a second use does not waste a charge',()=>{
  let s=company();s.rot.product=.8;s.rot.demand=.3;s.strain=7;s.inventory.consumables['consumable:context-reset']=2;s=rebaseCompany(s);
  const used=command(s,{type:'consume',id:'consumable:context-reset',work:'product'});expect(used.rot.product).toBe(0);expect(used.rot.demand).toBe(.3);expect(used.strain).toBe(7);expect(used.cash).toBe(s.cash);expect(used.inventory.consumables['consumable:context-reset']).toBe(1);expect(consumableUse(used,{type:'consume',id:'consumable:context-reset',work:'product'}).available).toBe(false);expect(replayCompany(used)).toEqual(used);
 });
 it('rejects malformed inventory and preserves old offers, charges and financing during migration',()=>{
  const s=company(),data=JSON.parse(JSON.stringify(s));data.version='founder-candidate.11';data.contentVersion='founder-content.candidate.5';delete data.inventory.active;data.inventory.relics=['relic:signal-ledger'];data.inventory.consumables={'consumable:customer-firebreak':5};
  data.debt={id:300,principal:101,months:6,due:600,remainder:0,mode:'interest-only',aprBps:1800,acceptedAt:0,lastPaymentAt:0,maturity:3600};
  const raw=JSON.stringify(data),loaded=decodeSave(JSON.stringify({version:2,contractVersion:s.contractVersion,contentVersion:data.contentVersion,balanceVersion:data.version,data:raw,checksum:checksum(raw)}));expect(loaded.debt).toEqual(data.debt);expect(loaded.inventory).toEqual({...data.inventory,active:[]});expect(replayCompany(loaded)).toEqual(loaded);
  loaded.inventory.consumables['consumable:customer-firebreak']=-1;expect(()=>validateCompany(loaded)).toThrow('inventory');
 });
});

describe('S12 earned founder history',()=>{
 function winner(tick=0){const s=company(tick);s.cash=1_000_000_000_000;const a=customer(s);a.count=10_000_000;return advance(rebaseCompany(s),tick===1799?1:10);}
 it('records an engine-earned win once across reload, continue, later quarters and storage retries',()=>{
  let s=winner();expect(s.phase).toBe('unicorn');const wonAt=s.wonAt;let history=recordFounderWin(decodeFounderHistory(null),s);expect(history.wins).toHaveLength(1);
  expect(recordFounderWin(history,decodeSave(encodeSave(s)))).toBe(history);s=command(s,{type:'continue'});s=advance(s,1800-s.tick);expect(s.phase).toBe('quarter-draft');expect(s.wonAt).toBe(wonAt);history=recordFounderWin(history,s);expect(history.wins).toHaveLength(1);expect(inheritedStartingCash(history)).toBe(P.winCashBonus);
  let failWrite=true;const map=new Map<string,string>(),storage={getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>{if(failWrite){failWrite=false;throw new Error('storage full');}map.set(key,value);}};expect(()=>syncFounderHistory(storage,s)).toThrow('storage full');syncFounderHistory(storage,s);syncFounderHistory(storage,s);expect(decodeFounderHistory(map.get(HISTORY_KEY)!).wins).toHaveLength(1);
  const next=createCompany(900,history.wins.length);expect(next.cash).toBe(P.starting_cash_cents+P.winCashBonus);expect(next.inventory.relics).toEqual([]);expect(next.inventory.active).toEqual([]);expect(replayCompany(s)).toEqual(s);
 });
 it('keeps the winning quarter draft available on Continue and never overwrites the first win',()=>{
  let s=winner(1799);expect(s.wonAt).toBe(1800);expect(s.pendingDraftQuarter).toBe(1);s=command(s,{type:'continue'});expect(s.phase).toBe('quarter-draft');s=command(s,{type:'draft-skip',quarter:1});s=command(s,{type:'continue'});expect(s.phase).toBe('continuation');s=advance(s,1800);expect(s.wonAt).toBe(1800);expect(s.phase).toBe('quarter-draft');expect(replayCompany(s)).toEqual(s);
 });
 it('failed runs mint nothing; legacy wins deduplicate without capping earned advantage',()=>{
  let s=company();s.cash=0;s=rebaseCompany(s);s=advance(s,600);expect(s.phase).toBe('failure');const history=decodeFounderHistory(JSON.stringify({wins:['old:10','old:10',...Array.from({length:100},(_,i)=>`${i}:20`)]}));expect(history.wins).toHaveLength(101);expect(recordFounderWin(history,s)).toBe(history);expect(inheritedStartingCash(history)).toBe(101*P.winCashBonus);
  expect(()=>decodeFounderHistory('{broken')).toThrow();expect(()=>decodeFounderHistory('{"wins":5}')).toThrow();
 });
});
