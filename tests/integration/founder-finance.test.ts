import { describe, expect, it } from 'vitest';
import { advance, arr, command, createCompany, random, rebaseCompany, replayCompany, validateCompany } from '../../src/game/founder/engine';
import { accrueMonthlyInterest } from '../../src/game/founder/finance';

describe('S11 finance accounting',()=>{
  it('collects a due invoice before bills but rejects a rescue that arrives after a failed obligation',()=>{
    let seed=1;while(random(seed,'collection',200,1)>=.95)seed++;
    const make=(delay:number)=>{
      const s=command(createCompany(seed),{type:'start'});s.tick=599;s.cash=100;s.serial=500;s.expenseAccrued=10_000;
      s.accounts=[{id:100,origin:100,segment:0,count:1,price:4000,basePrice:4000,fit:1,health:100,defects:0,born:0,caredUntil:100000,addons:0,threat:0,earned:0,remainder:0,active:true}];
      s.debt={id:1,principal:10_000,months:2,due:600,remainder:0,mode:'amortising',aprBps:1800,acceptedAt:0,lastPaymentAt:0,maturity:1200};s.invoices=[{id:200,account:100,cents:20_000,due:600+delay,attempts:0}];s.lifetimeEarned=20_000;
      return rebaseCompany(s);
    };
    const paid=advance(make(0));expect(paid.phase).toBe('active');expect(paid.lifetimeCollected).toBe(20_000);expect(paid.cash).toBeGreaterThan(0);expect(paid.debt?.months).toBe(1);validateCompany(paid);expect(replayCompany(paid)).toEqual(paid);
    const failed=advance(make(1),20);expect(failed.phase).toBe('failure');expect(failed.tick).toBe(600);expect(failed.lifetimeCollected).toBe(0);const cash=failed.cash,baseArr=arr(failed);
    for(const type of ['borrow','raise'] as const){const attempt=command(failed,{type});expect(attempt.cash).toBe(cash);expect(arr(attempt)).toBe(baseArr);expect(attempt.actionResults.at(-1)?.reason).toBe('phase-not-allowed');}
    expect(advance(failed,10)).toBe(failed);validateCompany(failed);
  });

  it('carries fractional cents instead of independently rounding each interest bill',()=>{
    let remainder=0,paid=0;
    for(let month=0;month<6;month++){
      const next=accrueMonthlyInterest(101,1800,remainder);paid+=next.interest;remainder=next.remainder;
    }
    expect(paid).toBe(9);expect(remainder).toBe(10800);
    expect(accrueMonthlyInterest(10_000,1800)).toEqual({interest:150,remainder:0});
  });
  it('preserves integer-cent precision across the supported money range',()=>{
    const principal=Number.MAX_SAFE_INTEGER,apr=1800,raw=BigInt(principal)*BigInt(apr);
    expect(accrueMonthlyInterest(principal,apr)).toEqual({interest:Number(raw/BigInt(120000)),remainder:Number(raw%BigInt(120000))});
    expect(()=>accrueMonthlyInterest(100,1800,120000)).toThrow();
    expect(()=>accrueMonthlyInterest(100.5,1800)).toThrow();
    expect(()=>accrueMonthlyInterest(-1,1800)).toThrow();
  });
});

import { capitalOffers, eligibleArr, forecast, metrics } from '../../src/game/founder/engine';
import { loanPayment, loanPayoff, loanSchedule, QUARTER_TICKS } from '../../src/game/founder/finance';
import { checksum, decodeSave, encodeSave } from '../../src/game/founder/save';
import { P } from '../../src/game/founder/profile';
import type { Company } from '../../src/game/founder/model';
import { mkdirSync, writeFileSync } from 'node:fs';

const financedFixture=(tick=100)=>{
  const s=command(createCompany(711),{type:'start'});s.tick=tick;s.quarter=Math.floor(tick/QUARTER_TICKS)+1;s.serial=500;s.cash=10_000_000;s.focus='finance';
  s.accounts=[{id:100,origin:100,segment:0,count:10,price:10_000,basePrice:10_000,fit:1,health:100,defects:0,born:0,caredUntil:100000,addons:0,threat:0,earned:0,remainder:0,active:true}];return rebaseCompany(s);
};
function advanceThroughDrafts(input:Company,target:number){
  let s=input;
  while(s.tick<target&&s.phase!=='failure'&&s.phase!=='unicorn'){
    if(s.phase==='quarter-draft')s=command(s,{type:'draft-skip',quarter:s.pendingDraftQuarter!});
    if(s.phase==='paused')s=command(s,{type:'continue'});
    s=advance(s,target-s.tick);
  }
  return s;
}

describe('S11 approved survival and financing',()=>{
  it('survives exact zero until an obligation is unpaid, including a zero-cash quarter close',()=>{
    let s=command(createCompany(710),{type:'start'});s.cash=0;s=rebaseCompany(s);s=advance(s,599);expect(s.phase).toBe('active');
    s=advance(s);expect(s.phase).toBe('failure');expect(s.failure).toContain('Monthly operating bill');
    const zero=command(createCompany(712),{type:'start'});zero.tick=1799;zero.cash=16;zero.expenseAccrued=0;zero.expenseRemainder=0;
    const closed=advance(rebaseCompany(zero));expect(closed.cash).toBe(0);expect(closed.phase).toBe('quarter-draft');expect(closed.reports).toHaveLength(1);validateCompany(closed);
  });

  it('funds only once, creates no ARR, charges interest monthly and principal only at maturity',()=>{
    let s=financedFixture();const before=arr(s),cash=s.cash,offer=capitalOffers(s).debt;
    s=command(s,{type:'borrow',quote:offer.key});expect(s.cash-cash).toBe(offer.principal);expect(arr(s)).toBe(before);
    expect(s.debt).toMatchObject({mode:'interest-only',months:6,aprBps:1800,acceptedAt:100,due:700,maturity:3700});
    const loan=structuredClone(s.debt!),payments=loanSchedule(loan);expect(payments).toHaveLength(6);expect(payments.slice(0,5).every(p=>p.principal===0)).toBe(true);expect(payments[5].principal).toBe(offer.principal);
    expect(payments.reduce((n,p)=>n+p.principal,0)).toBe(offer.principal);expect(payments.reduce((n,p)=>n+p.interest,0)).toBe(27000);
    const repeated=command(s,{type:'borrow'});expect(repeated.cash).toBe(s.cash);expect(repeated.actionResults.at(-1)?.reason).toBe('invalid-command');
    const projected=forecast(s).events.filter(e=>e.label.startsWith('Loan'));expect(projected[0]).toMatchObject({at:700,cents:-4500,estimated:false});
    s=advanceThroughDrafts(s,700);expect(s.debt?.principal).toBe(offer.principal);expect(s.debt?.months).toBe(5);expect(s.debt?.remainder).toBe(0);
    s=advanceThroughDrafts(s,3700);expect(s.debt).toBeNull();expect(s.phase).toBe('active');expect(replayCompany(s)).toEqual(s);validateCompany(s);
    mkdirSync('artifacts/qa/founder-revamp/S11',{recursive:true});writeFileSync('artifacts/qa/founder-revamp/S11/loan-schedule.json',JSON.stringify({profile:P.version,seed:711,scenario:'Synthetic eligible company; six dated interest-only payments, then principal; not balance certification',offer,loan,payments},null,2)+'\n');
  });

  it('repays early with prorated interest, charges principal outside expenses and rejects duplicates',()=>{
    let s=command(financedFixture(),{type:'borrow'});const id=s.debt!.id;s=advance(s,300);
    const payoff=loanPayoff(s.debt!,s.tick),cash=s.cash,expenses=s.expenses,arrBefore=arr(s);expect(payoff).toMatchObject({principal:300000,interest:2250,total:302250});
    const later=advance(s,2),stale=command(later,{type:'repay-debt',loanId:id,quote:payoff.key});expect(stale.actionResults.at(-1)?.reason).toBe('stale-job');expect(stale.cash).toBe(later.cash);expect(stale.debt).toEqual(later.debt);
    s=command(s,{type:'repay-debt',loanId:id,quote:payoff.key});expect(s.debt).toBeNull();expect(cash-s.cash).toBe(payoff.total);expect(s.expenses-expenses).toBe(payoff.interest);expect(arr(s)).toBe(arrBefore);
    expect(forecast(s).events.some(e=>e.label.startsWith('Loan'))).toBe(false);
    const again=command(s,{type:'repay-debt',loanId:id});expect(again.cash).toBe(s.cash);expect(again.actionResults.at(-1)?.reason).toBe('stale-job');expect(replayCompany(s)).toEqual(s);validateCompany(s);
  });

  it('does not kill a run for an unaffordable optional payoff and keeps exact carry across save/reload',()=>{
    let s=command(financedFixture(),{type:'borrow'});s.cash=1;s=rebaseCompany(s);
    const failedAttempt=command(s,{type:'repay-debt',loanId:s.debt!.id});expect(failedAttempt.phase).toBe('active');expect(failedAttempt.cash).toBe(1);expect(failedAttempt.actionResults.at(-1)?.reason).toBe('unaffordable');
    let tiny=financedFixture(0);tiny.accounts=[];tiny.debt={id:600,principal:101,months:6,due:600,remainder:0,mode:'interest-only',aprBps:1800,acceptedAt:0,lastPaymentAt:0,maturity:3600};tiny=rebaseCompany(tiny);
    tiny=advance(tiny,600);expect(tiny.debt?.remainder).toBe(61800);const loaded=decodeSave(encodeSave(tiny));expect(loaded.debt).toEqual(tiny.debt);
    const a=advanceThroughDrafts(tiny,3600),b=advanceThroughDrafts(loaded,3600);expect(a).toEqual(b);expect(a.debt).toBeNull();expect(replayCompany(a)).toEqual(a);
  });

  it('fails a missed interest bill or maturity payment, but an exact funded payment survives',()=>{
    const loan=command(financedFixture(0),{type:'borrow'}).debt!;
    const due=(maturity:boolean,cash:number)=>{
      const s=financedFixture(maturity?3599:599);s.accounts=[];s.cash=cash;s.debt={...loan,months:maturity?1:6,due:maturity?3600:600,lastPaymentAt:maturity?3000:0};s.expenseAccrued=0;s.expenseRemainder=0;return rebaseCompany(s);
    };
    const unpaidInterest=advance(due(false,4499));expect(unpaidInterest.failure).toContain('Loan interest');expect(unpaidInterest.debt?.principal).toBe(300000);
    const unpaidPrincipal=advance(due(true,304499));expect(unpaidPrincipal.failure).toContain('Loan principal and interest');expect(unpaidPrincipal.reports).toHaveLength(0);expect(unpaidPrincipal.debt?.months).toBe(1);
    const exact=advance(due(true,304516));expect(exact.debt).toBeNull();expect(exact.cash).toBe(0);expect(exact.phase).toBe('quarter-draft');validateCompany(exact);
  });

  it('warns before interest failure and never rescues a failed run with later funding',()=>{
    let s=command(financedFixture(),{type:'borrow'});s.cash=0;s.accounts=[];s.tick=599;s.expenseAccrued=0;s.expenseRemainder=0;s=rebaseCompany(s);
    // Suppress this diagnostic operating bill so the named loan deadline is the failure.
    s.cash=10000;s=rebaseCompany(s);s=advance(s);expect(s.log.some(l=>l.text.includes('Loan interest due in 10s'))).toBe(true);
    s.cash=0;s=rebaseCompany(s);s=advance(s,100);expect(s.failure).toContain('Loan interest');expect(s.tick).toBe(700);
    expect(command(s,{type:'raise'}).actionResults.at(-1)?.reason).toBe('phase-not-allowed');
  });

  it('captures VC baseline after the partial quarter and freezes all schedules during the draft',()=>{
    let s=financedFixture();const offer=capitalOffers(s).vc,cash=s.cash,base=arr(s);s=command(s,{type:'raise',quote:offer.key});
    expect(s.cash-cash).toBe(base);expect(arr(s)).toBe(base);expect(s.ownership).toBe(8000);expect(s.vc).toMatchObject({startsAt:1800,due:3600,baselineLocked:false,rule:'quarter-growth'});
    // Growth before the first full quarter becomes its baseline, not a free future pass.
    s.accounts[0].price+=100;s=rebaseCompany(s);s=advance(s,1700);expect(s.phase).toBe('quarter-draft');expect(s.vc?.baseline).toBe(1_212_000);expect(s.vc?.target).toBe(1_212_001);expect(s.vc?.baselineLocked).toBe(true);
    const saved=decodeSave(encodeSave(s));expect(advance(saved,5000)).toBe(saved);const dates=structuredClone(s.vc);
    s=command(saved,{type:'draft-skip',quarter:1});expect(advance(s,5000)).toBe(s);expect(s.vc).toEqual(dates);
    s=command(s,{type:'continue'});s=advance(s,1800);expect(s.phase).toBe('failure');expect(s.failure).toContain('Flat or falling ARR');expect(s.log.some(l=>l.text.includes('VC review in 10s'))).toBe(true);expect(s.reports).toHaveLength(1);expect(replayCompany(s)).toEqual(s);
  });

  it.each([0,-1,1])('assesses a full VC quarter for monthly price delta %i, without imposing bootstrap growth',delta=>{
    let s=command(financedFixture(),{type:'raise'});s.tick=3599;s.quarter=2;s.vc!.baselineLocked=true;s.vc!.baseline=1_200_000;s.vc!.target=1_200_001;s.accounts[0].price+=delta;s=rebaseCompany(s);
    const boot=structuredClone(s);boot.vc=null;const free=advance(rebaseCompany(boot));expect(free.phase).toBe('quarter-draft');
    const reviewed=advance(s);expect(reviewed.phase).toBe(delta>0?'quarter-draft':'failure');
    if(delta>0){expect(reviewed.vc).toMatchObject({baseline:1_200_120,target:1_200_121,startsAt:3600,due:5400});expect(reviewed.reports).toHaveLength(1);}
    else{expect(reviewed.reports).toHaveLength(0);expect(reviewed.pendingDraftQuarter).toBeNull();}
    expect(replayCompany(reviewed)).toEqual(reviewed);validateCompany(reviewed);
  });

  it('treats funding exactly at a quarter opening as a full assessed quarter and rejects changed offers',()=>{
    let s=financedFixture(1800);const offer=capitalOffers(s).vc;expect(offer).toMatchObject({startsAt:1800,due:3600,baselineLocked:true});s=command(s,{type:'raise',quote:offer.key});expect(s.vc?.baselineLocked).toBe(true);
    const before=s.cash;const duplicate=command(s,{type:'raise'});expect(duplicate.cash).toBe(before);expect(duplicate.actionResults.at(-1)?.reason).toBe('invalid-command');
    let changed=financedFixture();const old=capitalOffers(changed);changed.accounts[0].price+=100;changed=rebaseCompany(changed);const cash=changed.cash;
    for(const [type,quote] of [['borrow',old.debt.key],['raise',old.vc.key]] as const){const rejected=command(changed,{type,quote});expect(rejected.cash).toBe(cash);expect(rejected.actionResults.at(-1)?.reason).toBe('stale-job');}
    const under=command(createCompany(713),{type:'start'});expect(command(under,{type:'borrow'}).actionResults.at(-1)?.reason).toBe('invalid-command');expect(command(under,{type:'raise'}).actionResults.at(-1)?.reason).toBe('invalid-command');
  });

  it('uses eligible ARR and resolves a due VC failure before a possible unicorn award',()=>{
    let s=command(financedFixture(),{type:'raise'});s.tick=3599;s.quarter=2;s.vc!.baselineLocked=true;s.vc!.baseline=1_200_000;s.vc!.target=1_200_001;
    s.invoices=[{id:600,account:100,cents:100,due:s.tick-P.collection_grace_ticks-1,attempts:0}];s.lifetimeEarned=100;
    // A late contract is not eligible growth even when its contractual ARR exists.
    expect(eligibleArr(s)).toBe(0);expect(arr(s)).toBe(1_200_000);
    s.invoices=[];s.lifetimeEarned=0;s.accounts[0].count=1_000_000;s.vc!.baseline=arr(s);s.vc!.target=arr(s)+1;s.cash=1_000_000_000_000;s=rebaseCompany(s);
    const result=advance(s);expect(metrics(result).valuation).toBeGreaterThanOrEqual(P.win_valuation_cents);expect(result.phase).toBe('failure');expect(result.wonAt).toBeNull();expect(result.reports).toHaveLength(0);
  });

  it('normalizes old financed saves before rebuilding missing quarter score metadata',()=>{
    const s=financedFixture(1900),data=JSON.parse(JSON.stringify(s));data.version='founder-candidate.10';data.debt={principal:120001,months:4,due:2200,remainder:119000};
    data.reports=[{quarter:1,opening:0,closing:1200000,collected:0,expenses:10000,newArr:1200000,expansion:0,churn:0,cash:s.cash,choices:[],chosen:'passed'}];
    const raw=JSON.stringify(data);const migrated=decodeSave(JSON.stringify({version:2,contractVersion:s.contractVersion,contentVersion:s.contentVersion,balanceVersion:data.version,data:raw,checksum:checksum(raw)}));
    expect(migrated.reports[0].score).toBeDefined();expect(migrated.reports[0].openingCash).toBe(s.cash);expect(migrated.debt?.mode).toBe('amortising');expect(replayCompany(migrated)).toEqual(migrated);validateCompany(migrated);
  });

  it('migrates accepted legacy financing without repricing obligations or rerunning old actions',()=>{
    const s=financedFixture(1000),data=JSON.parse(JSON.stringify(s));data.version='founder-candidate.10';data.debt={principal:120001,months:4,due:1300,remainder:119000};data.vc={baseline:1200000,target:1800000,due:2300};
    const raw=JSON.stringify(data),migrated=decodeSave(JSON.stringify({version:2,contractVersion:s.contractVersion,contentVersion:s.contentVersion,balanceVersion:data.version,data:raw,checksum:checksum(raw)}));
    expect(migrated.version).toBe(P.version);expect(migrated.cash).toBe(s.cash);expect(migrated.debt).toMatchObject({...data.debt,mode:'amortising',aprBps:1800,maturity:3100,lastPaymentAt:700});
    expect(loanPayment(migrated.debt!).principal).toBe(30001);expect(migrated.vc).toMatchObject({...data.vc,rule:'legacy-target',baselineLocked:true});expect(replayCompany(migrated)).toEqual(migrated);validateCompany(migrated);
    const restored=decodeSave(encodeSave(migrated));expect(restored.debt).toEqual(migrated.debt);expect(restored.vc).toEqual(migrated.vc);
  });
});
