import {describe,it,expect} from 'vitest';
import {advance,arr,command,createCompany,priceCursor,priceTarget,pricingQuote,replayCompany,validateCompany} from '../../src/game/founder/engine';
import {bankHits,initialBoard,mergeOrder,opsOutcomes,productBrief} from '../../src/game/founder/toys';
import {P,UPGRADES} from '../../src/game/founder/profile';
import {decodeSave,encodeSave} from '../../src/game/founder/save';
import type {Company} from '../../src/game/founder/model';
const start=(seed=77)=>command(createCompany(seed),{type:'start'});
function accountFixture(){const s=start();s.tick=1300;s.focus='expansion';s.accounts=[{id:800,origin:800,segment:0,count:1,price:4000,basePrice:4000,fit:.8,health:80,defects:0,born:0,caredUntil:0,addons:0,threat:0,earned:0,remainder:0,active:true}];return s;}
function combine(s:Company){for(let guard=0;guard<30;guard++){const board=s.package.board??initialBoard();let pair:number[]=[];for(let i=0;i<16;i++)for(let j=i+1;j<16;j++)if(board[i]&&board[j]&&board[i]!.family===board[j]!.family&&board[i]!.tier===board[j]!.tier&&board[i]!.tier<3+s.accounts[0].addons)pair=[i,j];if(!pair.length)break;s=command(s,{type:'merge',account:800,from:pair[0],to:pair[1],expectedTier:board[pair[0]]!.tier});}return s;}
describe('tactile founder state and accounting',()=>{
 it('restores an out-of-order recipe and ships only after the remaining slots are filled and tested',()=>{
  let s=start();s.focus='product';s.leads=[{id:4,segment:2,count:1,expires:600,fit:.9}];
  const parts=productBrief(s,s.leads[0]).parts,last=parts.length-1;
  s=command(s,{type:'part',job:4,slot:last,part:parts[last]});
  const cash=s.cash;
  s=decodeSave(encodeSave(s));
  expect(s.recipe.slots.slice(0,last)).toEqual(Array(last).fill(null));
  expect(s.recipe.slots[last]).toBe(parts[last]);expect(s.cash).toBe(cash);
  s=command(s,{type:'test-build',job:4});expect(s.recipe.tested).toBe(false);
  s=command(s,{type:'ship',job:4,early:false});expect(s.trials).toHaveLength(0);
  for(let slot=0;slot<last;slot++)s=command(s,{type:'part',job:4,slot,part:parts[slot]});
  s=command(s,{type:'test-build',job:4});expect(s.recipe.tested).toBe(true);
  s=command(s,{type:'ship',job:4,early:false});expect(s.trials).toHaveLength(1);expect(s.leads).toHaveLength(0);
 });
 it('scratches actual strain and every function rot, with no cash reward and no duplicate repairs',()=>{
  let s=command(start(),{type:'focus',work:'operations'});s.strain=4;for(const f of Object.keys(s.rot) as (keyof typeof s.rot)[])s.rot[f]=.4;
  s.actions=[];s.replayBase=JSON.stringify(s);
  const cash=s.cash;s=command(s,{type:'ops-deal'});const effects=opsOutcomes(s);
  s=command(s,{type:'ops-claim',card:s.ops.id,cell:0});expect(s.strain).toBe(4);
  for(let cell=0;cell<7;cell++){
   const e=effects[cell],before=e.target==='strain'?s.strain:s.rot[e.target];
   s=command(s,{type:'ops-inspect',card:s.ops.id,cell});expect(e.target==='strain'?s.strain:s.rot[e.target]).toBe(before);
   s=command(s,{type:'ops-claim',card:s.ops.id,cell});const after=e.target==='strain'?s.strain:s.rot[e.target];expect(after).toBeCloseTo(before-e.amount);
   s=command(s,{type:'ops-claim',card:s.ops.id,cell});expect(e.target==='strain'?s.strain:s.rot[e.target]).toBe(after);
  }
  expect(s.cash).toBe(cash);expect(s.operationsNet).toBe(0);expect(s.completed.operations).toBe(7);expect(replayCompany(s)).toEqual(s);expect(decodeSave(encodeSave(s))).toEqual(s);validateCompany(s);
  s=command(s,{type:'ops-discard',card:s.ops.id});const strain=s.strain;s=command(s,{type:'ops-claim',card:s.ops.id,cell:0});expect(s.strain).toBe(strain);
 });
 it('keeps repair available beyond quarterly gambling limits and bounds repair to actual damage',()=>{
  let s=command(start(),{type:'focus',work:'operations'});s.strain=20;s.rot.demand=.001;
  for(let n=0;n<5;n++){s=command(s,{type:'ops-deal'});expect(s.ops.active).toBe(true);s=command(s,{type:'ops-inspect',card:s.ops.id,cell:1});s=command(s,{type:'ops-claim',card:s.ops.id,cell:1});expect(s.rot.demand).toBe(0);s=command(s,{type:'ops-discard',card:s.ops.id});const id=s.ops.id;s=command(s,{type:'ops-deal'});expect(s.ops.id).toBe(id);s=advance(s,50);}
  expect(s.ops.id).toBe(5);
 });
 it('scales repair with Craft and the maintenance upgrade, and preserves old financial history on migration',()=>{
  const s=start();const base=opsOutcomes(s);s.ranks.operations.craft=2;s.upgrades=['maintenance'];expect(opsOutcomes(s)[0].amount).toBe(base[0].amount*P.craft_batch_by_rank[2]*1.5);
  s.version='founder-candidate.3';s.operationsNet=123;s.ops.active=true;s.ops.net=123;s.cash=98765;
  const next=decodeSave(encodeSave(s));expect(next.cash).toBe(98765);expect(next.operationsNet).toBe(123);expect(next.ops.active).toBe(false);expect(next.version).toBe(P.version);expect(replayCompany(next)).toEqual(next);
 });
 it('requires correct recipe tests, invalidates tests on changes, and never ships a stale job',()=>{let s=start();s.focus='product';s.leads=[{id:4,segment:2,count:1,expires:600,fit:.9}];const parts=productBrief(s,s.leads[0]).parts;s=command(s,{type:'part',job:4,slot:0,part:(parts[0]+1)%6});s=command(s,{type:'test-build',job:4});expect(s.recipe.tested).toBe(false);s=command(s,{type:'ship',job:4,early:false});expect(s.trials).toHaveLength(0);parts.forEach((part,slot)=>{s=command(s,{type:'part',job:4,slot,part});});s=command(s,{type:'test-build',job:4});expect(s.recipe.tested).toBe(true);s=command(s,{type:'part',job:4,slot:0,part:parts[0]});expect(s.recipe.tested).toBe(false);s=command(s,{type:'test-build',job:4});s=command(s,{type:'ship',job:4,early:false});expect(s.trials).toHaveLength(1);const count=s.trials.length;s=command(s,{type:'ship',job:4,early:false});expect(s.trials.length).toBe(count);});
 it('gives a fresh Product brief a two-minute assembly window',()=>{let s=start();s.channel=0;s.focus='demand';s=command(s,{type:'demand',pursue:true,signal:s.signal});const lead=s.leads[0];expect(lead).toBeDefined();expect(lead.expires-s.tick).toBe(P.starterTTL);expect(P.starterTTL).toBe(1200);});
 it('merges real matching tiers, moves to empty cells, preserves feature mass and fulfills only a complete order',()=>{let s=accountFixture();const before=arr(s);s=command(s,{type:'merge',account:800,from:0,to:1,expectedTier:1});expect(s.package.board??initialBoard()).toEqual(initialBoard());s=command(s,{type:'merge',account:800,from:0,to:10,expectedTier:1});expect(s.package.board![0]).toBeNull();expect(s.package.board![10]).toEqual({family:0,tier:1});s=command(s,{type:'expand',account:800});expect(arr(s)).toBe(before);s=combine(s);expect(s.package.board!.reduce((n,t)=>n+(t?2**(t.tier-1):0),0)).toBe(8);expect(mergeOrder(0).every(w=>s.package.board!.some(t=>t?.family===w.family&&t.tier===w.tier))).toBe(true);const saved=decodeSave(encodeSave(s));expect(saved.package).toEqual(s.package);s=command(s,{type:'expand',account:800});expect(arr(s)).toBeGreaterThan(before);expect(s.accounts[0].addons).toBe(1);const expanded=arr(s);s=command(s,{type:'expand',account:800});expect(arr(s)).toBe(expanded);});
 it('cannot strand the second order by generating excess of one feature family',()=>{let s=accountFixture();s.accounts[0].addons=1;s=combine(s);for(let n=0;n<10;n++)s=command(s,{type:'supply',account:800,family:0});expect(s.package.supplied).toBe(12);s=combine(s);for(let n=0;n<4;n++)s=command(s,{type:'supply',account:800,family:1});s=combine(s);expect(mergeOrder(1).every(w=>s.package.board!.some(t=>t?.family===w.family&&t.tier===w.tier))).toBe(true);});
 it('bank hits persist without duplicating damage or ARR; successful care cancels a threat',()=>{let s=accountFixture();s.focus='retention';s.accounts[0].threat=s.tick+100;const before=arr(s);s=command(s,{type:'hit-bank',account:800,expected:0});s=command(s,{type:'hit-bank',account:800,expected:0});expect(s.bankDamage[800]).toBe(1);s=decodeSave(encodeSave(s));for(let i=1;i<bankHits(s);i++)s=command(s,{type:'hit-bank',account:800,expected:i});expect(s.accounts[0].threat).toBe(0);expect(s.accounts[0].caredUntil).toBeGreaterThan(s.tick);expect(arr(s)).toBe(before);});
 it('judges the submitted visible customer-specific timing window and rejects malformed timing',()=>{let s=start();s.focus='monetisation';s.trials=[{id:99,segment:0,count:1,fit:1,expires:1000}];const target=priceTarget(s);expect(target.center).toBeGreaterThanOrEqual(target.width/2);expect(target.center).toBeLessThanOrEqual(1-target.width/2);const fair=pricingQuote(s,'fair',false,target.center),premium=pricingQuote(s,'premium',false,target.center),miss=pricingQuote(s,'fair',false,target.center<.5?1:0);expect(fair.chance).toBeGreaterThan(.7);expect(fair.chance).toBeGreaterThan(premium.chance);expect(miss.chance).toBeLessThan(fair.chance*.5);const before=s.cash;const invalid=command(s,{type:'price',job:99,plan:'fair',timing:2});expect(invalid.cash).toBe(before);expect(invalid.trials.length).toBe(1);s=command(s,{type:'price',job:99,plan:'fair',timing:target.center});expect(s.trials.length).toBe(0);expect(s.actions.at(-1)?.command).toMatchObject({type:'price',timing:target.center});});
 it('keeps manual room actions responsive while preserving semantic queue guards',()=>{let s=start();s.focus='demand';for(let i=0;i<3;i++)s=command(s,{type:'demand',pursue:true,signal:s.signal});expect(s.attempts.demand).toBe(3);expect(s.tick).toBe(0);const leads=s.leads.length;s=command(s,{type:'price',job:999,plan:'fair',timing:.5});expect(s.leads.length).toBe(leads);});
 it('gives different cohorts stable seeded Monetisation windows',()=>{const s=start(91);s.trials=[{id:10,segment:0,count:1,fit:.8,expires:1000}];const first=priceTarget(s);expect(priceTarget(s)).toEqual(first);s.trials[0]={...s.trials[0],id:11};expect(priceTarget(s).center).not.toBe(first.center);});
 it('keeps the pricing meter bounded and bouncing with no end-to-start jump',()=>{const s=start();let last=priceCursor(s);for(let t=1;t<=96;t++){s.tick=t;const next=priceCursor(s);expect(next).toBeGreaterThanOrEqual(0);expect(next).toBeLessThanOrEqual(1);expect(Math.abs(next-last)).toBeLessThan(.09);last=next;}});
 it('keeps quarter drafts available after the six strategy upgrades and installs ranks at their normal cost',()=>{let s=start();s.upgrades=UPGRADES.map(u=>u.id);s.quarter=7;s.tick=12599;s.cash=1000000;s=advance(s,1);const r=s.reports.at(-1)!;expect(r.choices).toHaveLength(3);expect(r.choices.every(id=>id.startsWith('capability:'))).toBe(true);const id=r.choices[0],before=s.cash;s=command(s,{type:'draft',quarter:7,id});expect(s.reports.at(-1)?.chosen).toBe(id);expect(s.cash).toBe(before-P.upgrade_base_cents);const installed=s.cash;s=command(s,{type:'draft',quarter:7,id});expect(s.cash).toBe(installed);validateCompany(s);});
 it('allows passing a quarter without cash cost, and rejects subsequently selecting it',()=>{let s=advance(start(),1800);const cash=s.cash;s=command(s,{type:'draft-skip',quarter:1});s=command(s,{type:'draft',quarter:1,id:s.reports[0].choices[0]});expect(s.cash).toBe(cash);expect(s.reports[0].chosen).toBe('passed');expect(s.upgrades).toHaveLength(0);expect(replayCompany(s)).toEqual(s);});
 it('migrates previous saves without resetting company finances and replays from the migration checkpoint',()=>{const old=advance(start(),50);old.version='founder-candidate.2';const migrated=decodeSave(encodeSave(old));expect(migrated.cash).toBe(old.cash);expect(migrated.tick).toBe(old.tick);expect(migrated.migratedActions).toEqual(old.actions);const next=advance(command(migrated,{type:'focus',work:'operations'}),20);expect(replayCompany(next)).toEqual(next);});
});
