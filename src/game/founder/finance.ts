// Game accounting in integer cents and annual basis points. This helper does
// not choose a loan term or repayment policy; accepted loan terms do that.
export const MONTHLY_INTEREST_DENOMINATOR = 12 * 10_000;
export function accrueMonthlyInterest(principal:number,aprBps:number,remainder=0){
  for(const value of [principal,aprBps,remainder])if(!Number.isSafeInteger(value)||value<0)throw new Error('Invalid loan accounting input.');
  if(remainder>=MONTHLY_INTEREST_DENOMINATOR)throw new Error('Invalid fractional-cent interest carry.');
  const raw=BigInt(principal)*BigInt(aprBps)+BigInt(remainder);
  const interest=Number(raw/BigInt(MONTHLY_INTEREST_DENOMINATOR));
  if(!Number.isSafeInteger(interest))throw new Error('Loan interest exceeds the supported cents range.');
  return {interest,remainder:Number(raw%BigInt(MONTHLY_INTEREST_DENOMINATOR))};
}

import type { Company, Loan } from './model';
import { P } from './profile';

export const QUARTER_TICKS=P.ticks_per_month*P.months_per_quarter;
export function loanPayment(loan:Loan){
  const {interest,remainder}=accrueMonthlyInterest(loan.principal,loan.aprBps,loan.remainder);
  const principal=loan.mode==='amortising'?Math.ceil(loan.principal/loan.months):loan.months===1?loan.principal:0;
  return {principal,interest,total:principal+interest,remainder,at:loan.due};
}
export function loanPayoff(loan:Loan,tick:number){
  // Early repayment includes interest earned since the last interest date.
  // Fractional cents carry across regular bills; closing waives less than 1 cent.
  const elapsed=Math.max(0,Math.min(P.ticks_per_month,tick-loan.lastPaymentAt));
  const raw=BigInt(loan.principal)*BigInt(loan.aprBps)*BigInt(elapsed)+BigInt(loan.remainder)*BigInt(P.ticks_per_month);
  const interest=Number(raw/BigInt(MONTHLY_INTEREST_DENOMINATOR*P.ticks_per_month));
  const total=loan.principal+interest;
  return {principal:loan.principal,interest,total,key:`payoff:${loan.id}:${total}`};
}
export function loanSchedule(loan:Loan,end=loan.maturity){
  const copy={...loan},payments:ReturnType<typeof loanPayment>[]=[];
  for(;copy.months>0&&copy.due<=end;copy.months--,copy.due+=P.ticks_per_month){
    const payment=loanPayment(copy);payments.push(payment);copy.principal-=payment.principal;copy.remainder=payment.remainder;
  }
  return payments;
}
export function financeOffers(s:Company,eligibleArr:number){
  const principal=Math.floor(eligibleArr/12)*P.debt_capacity_mrr_multiple,aprBps=P.default_loan_apr_bps,months=P.default_loan_term_months;
  const startsAt=s.tick%QUARTER_TICKS===0?s.tick:s.tick-s.tick%QUARTER_TICKS+QUARTER_TICKS,due=startsAt+QUARTER_TICKS;
  const ownership=Math.floor(s.ownership*(10_000-P.vcOwnershipSoldBps)/10_000);
  const debt={kind:'debt' as const,available:!s.debt&&Math.floor(eligibleArr/12)>=P.debt_min_mrr_cents,principal,aprBps,months,interest:accrueMonthlyInterest(principal,aprBps).interest,key:`loan:${principal}:${aprBps}:${months}:interest-only`};
  const vc={kind:'vc' as const,available:!s.vc&&eligibleArr>=P.vc_min_arr_cents,cash:eligibleArr,ownership,startsAt,due,baseline:eligibleArr,baselineLocked:startsAt===s.tick,key:`vc:${eligibleArr}:${ownership}:${startsAt}:${due}:quarter-growth`};
  return {debt,vc};
}
export type CapitalOffer=ReturnType<typeof financeOffers>['debt'|'vc'];
