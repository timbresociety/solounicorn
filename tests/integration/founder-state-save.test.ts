import { describe, expect, it } from 'vitest';
import { CASH_DEATH_POLICY, FOUNDER_CONTRACT_VERSION, FOUNDER_CONTENT_VERSION } from '../../src/game/founder/contracts';
import { advance, arr, command, createCompany, dispatchCompany, evaluateCashDeath, leadJobId, replayCompany, signal, validateCompany } from '../../src/game/founder/engine';
import { checksum, decodeLastKnownGood, decodeSave, encodeSave } from '../../src/game/founder/save';
import { P } from '../../src/game/founder/profile';

const start=(seed=71)=>command(createCompany(seed),{type:'start'});

describe('founder authoritative state and save boundary',()=>{
  it('uses one explicit phase table and freezes draft and pause time without RNG work',()=>{
    let s=advance(start(),1800);
    expect(s.phase).toBe('quarter-draft');expect(s.pendingDraftQuarter).toBe(1);
    const frozenTick=s.tick,frozenAttempts=structuredClone(s.attempts);
    expect(advance(s,500)).toBe(s);expect(s.tick).toBe(frozenTick);expect(s.attempts).toEqual(frozenAttempts);
    s=command(s,{type:'focus',work:'product'});expect(s.actionResults.at(-1)?.reason).toBe('phase-not-allowed');expect(s.focus).toBe('demand');
    s=command(s,{type:'draft-skip',quarter:1});expect(s.phase).toBe('paused');expect(s.pendingDraftQuarter).toBeNull();expect(advance(s,500)).toBe(s);
    s=command(s,{type:'continue'});expect(s.phase).toBe('active');expect(advance(s,1).tick).toBe(frozenTick+1);
  });

  it('defines duplicate, stale, cancelled, expired, unaffordable and out-of-phase outcomes without double charge',()=>{
    let s=start();
    const fixed={id:'fixed-action',tick:s.tick,command:{type:'focus',work:'product'} as const};
    const once=dispatchCompany(s,fixed);expect(once.result.reason).toBe('committed');
    const duplicate=dispatchCompany(once.company,fixed);expect(duplicate.company).toBe(once.company);expect(duplicate.result.reason).toBe('duplicate-action');
    s=once.company;const cash=s.cash;
    s=command(s,{type:'price',job:404,plan:'fair'});expect(s.actionResults.at(-1)?.reason).toBe('stale-job');expect(s.cash).toBe(cash);
    s.cash=0;s=command(s,{type:'buy',work:'demand',axis:'craft',rank:1});expect(s.actionResults.at(-1)?.reason).toBe('unaffordable');expect(s.cash).toBe(0);
    s=command(s,{type:'pause'});s=command(s,{type:'channel',channel:1});expect(s.actionResults.at(-1)?.reason).toBe('phase-not-allowed');expect(s.channel).toBe(0);

    let cancelled=start(72);cancelled.leads.push({id:500,segment:0,count:1,expires:100,fit:.8});cancelled=command(cancelled,{type:'focus',work:'product'});cancelled=command(cancelled,{type:'part',job:500,slot:0,part:0});
    expect(cancelled.jobs.reservations.map(r=>r.jobId)).toContain(leadJobId(500));
    cancelled=command(cancelled,{type:'cancel-job',job:leadJobId(500)});const cancelledCash=cancelled.cash;
    cancelled=command(cancelled,{type:'ship',job:500,early:false});expect(cancelled.actionResults.at(-1)?.reason).toBe('cancelled-job');expect(cancelled.cash).toBe(cancelledCash);

    let expired=start(73);expired.leads.push({id:501,segment:0,count:1,expires:1,fit:.8});expired=advance(expired,1);const expiredCash=expired.cash;
    expired=command(expired,{type:'part',job:501,slot:0,part:0});expect(expired.actionResults.at(-1)?.reason).toBe('expired-job');expect(expired.cash).toBe(expiredCash);
  });

  it('persists partial ownership, versions, inventory, pending draft and exact replay identity',()=>{
    let s=start(74);s.leads.push({id:600,segment:1,count:1,expires:500,fit:.7});s=command(s,{type:'focus',work:'product'});s=command(s,{type:'part',job:600,slot:0,part:2});s=command(s,{type:'focus',work:'demand'});
    const restored=decodeSave(encodeSave(s));expect(restored).toEqual(s);expect(restored.jobs.reservations[0].jobId).toBe(leadJobId(600));expect(restored.recipe.slots[0]).toBe(2);
    expect(restored.contractVersion).toBe(FOUNDER_CONTRACT_VERSION);expect(restored.contentVersion).toBe(FOUNDER_CONTENT_VERSION);expect(restored.inventory).toEqual({relics:[],consumables:{},active:[]});validateCompany(restored);
    const replayable=command(command(createCompany(740),{type:'start'}),{type:'focus',work:'skills'});expect(replayCompany(replayable)).toEqual(replayable);
  });

  it('migrates candidate.5 explicitly and recovers from a corrupt primary with a last-known-good save',()=>{
    const current=start(75);const legacy=structuredClone(current) as unknown as Record<string,unknown>;
    for(const key of ['contractVersion','contentVersion','actionCursor','actionResults','phase','resumePhase','pendingDraftQuarter','inventory','jobs'])delete legacy[key];
    legacy.status='running';legacy.paused=false;legacy.actions=(current.actions.map(({tick,command})=>({tick,command})));
    const data=JSON.stringify(legacy),v1=JSON.stringify({version:1,data,checksum:checksum(data)});
    const migrated=decodeSave(v1);expect(migrated.phase).toBe('active');expect(migrated.actions).toEqual([]);expect(migrated.migratedActions?.length).toBeGreaterThan(0);expect(migrated.replayBase).toBeTruthy();validateCompany(migrated);
    const backup=encodeSave(current),recovered=decodeLastKnownGood('{broken',backup);expect(recovered.source).toBe('backup');expect(recovered.company).toEqual(current);
  });

  it('rebases a checksummed candidate.5 v2 save before replaying later rank and Retention rules',()=>{
    const legacy=structuredClone(start(751));legacy.version='founder-candidate.5';
    const data=JSON.stringify(legacy),raw=JSON.stringify({version:2,contractVersion:legacy.contractVersion,contentVersion:legacy.contentVersion,balanceVersion:'founder-candidate.5',data,checksum:checksum(data)});
    const migrated=decodeSave(raw);expect(migrated.version).toBe(P.version);expect(migrated.actions).toEqual([]);expect(migrated.migratedActions?.length).toBeGreaterThan(0);expect(replayCompany(migrated)).toEqual(migrated);
  });

  it('deliberately migrates candidate.6 Retention damage into finite customer-problem work',()=>{
    const legacy=structuredClone(start(752));legacy.version='founder-candidate.6';legacy.accounts=[{id:88,origin:88,segment:0,count:1,price:4000,basePrice:4000,fit:.8,health:55,defects:0,born:0,caredUntil:0,addons:0,threat:legacy.tick+90,earned:0,remainder:0,active:true}];legacy.bankDamage={88:2};
    const data=JSON.stringify(legacy),raw=JSON.stringify({version:2,contractVersion:legacy.contractVersion,contentVersion:legacy.contentVersion,balanceVersion:'founder-candidate.6',data,checksum:checksum(data)});
    const migrated=decodeSave(raw);expect(migrated.version).toBe(P.version);expect(migrated.bankDamage).toEqual({});expect(migrated.accounts[0].problem).toMatchObject({label:'Legacy customer follow-up',workCompleted:4,workRequired:8,exposedArr:48000});expect(arr(migrated)).toBe(48000);expect(replayCompany(migrated)).toEqual(migrated);
  });

  it('rebases candidate.8 repair-sheet saves onto paid ticket state without changing company money',()=>{
    const legacy=structuredClone(start(753));legacy.version='founder-candidate.8';legacy.cash=123456;legacy.operationsNet=4321;
    (legacy as unknown as Record<string,unknown>).ops={id:9,quarter:legacy.quarter,used:2,active:true,inspected:[0],claimed:[],net:0};
    legacy.jobs.reservations.push({jobId:'operations:9',owner:'founder',actionId:'legacy-ops',reservedAt:legacy.tick});
    const data=JSON.stringify(legacy),raw=JSON.stringify({version:2,contractVersion:legacy.contractVersion,contentVersion:legacy.contentVersion,balanceVersion:'founder-candidate.8',data,checksum:checksum(data)});
    const migrated=decodeSave(raw);expect(migrated.version).toBe(P.version);expect(migrated.cash).toBe(123456);expect(migrated.operationsNet).toBe(4321);
    expect(migrated.ops).toMatchObject({id:9,quarter:migrated.quarter,used:0,active:false,status:'offered',price:0,patches:[],inspected:[],claimed:[]});
    expect(migrated.operationsReturns).toEqual({manual:{tickets:0,patchValue:0,prices:0,upkeep:0,net:0},automated:{tickets:0,patchValue:0,prices:0,upkeep:0,net:0}});
    expect(migrated.incidents).toEqual([]);expect(migrated.jobs.reservations.some(r=>r.jobId.startsWith('operations:'))).toBe(false);expect(replayCompany(migrated)).toEqual(migrated);
  });

  it('keeps owner-approved cash death tied to mandatory obligations',()=>{
    const s=start(76);s.cash=0;expect(evaluateCashDeath(s)).toBe(CASH_DEATH_POLICY);expect(CASH_DEATH_POLICY.status).toBe('owner-approved');expect(s.phase).toBe('active');
  });

  it('commits the visible Demand profile deterministically and persists its cash-to-Product consequence',()=>{
    let qualified=start(90);for(let seed=90;signal(qualified).quality!=='qualified';seed++)qualified=start(seed);
    const beforeCash=qualified.cash,beforeQueue=qualified.leads.length,profile=signal(qualified),stake=100;
    qualified=command(qualified,{type:'demand',pursue:true,signal:qualified.signal});
    expect(qualified.cash).toBe(beforeCash-stake);expect(qualified.leads.length).toBeGreaterThan(beforeQueue);
    expect(qualified.actionResults.at(-1)?.demand).toMatchObject({profile,outcome:'qualified',acquisitionCost:stake,productJobs:1,productQueueAfter:qualified.leads.length});
    expect(replayCompany(qualified)).toEqual(qualified);expect(decodeSave(encodeSave(qualified))).toEqual(qualified);

    let passed=start(190);const passCash=passed.cash,passQueue=passed.leads.length;
    passed=command(passed,{type:'demand',pursue:false,signal:passed.signal});
    expect(passed.cash).toBe(passCash);expect(passed.leads).toHaveLength(passQueue);
    expect(passed.actionResults.at(-1)?.demand).toMatchObject({outcome:'passed',acquisitionCost:0,productJobs:0});
  });
});
