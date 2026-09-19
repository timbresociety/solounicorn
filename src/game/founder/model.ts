import type { Axis, Work } from './profile';
import type { ActionReason, EnginePhase } from './contracts';
export type Ranks = Record<Axis, number>;
export type Lead = {id:number; segment:number; count:number; expires:number; fit:number};
export type RetentionProblem = {id:number; kind:'handoff'|'reliability'|'adoption'|'trust'; label:string; detail:string; openedAt:number; deadline:number; severity:1|2|3; workRequired:number; workCompleted:number; exposedArr:number};
export type Account = {id:number; origin:number; segment:number; count:number; price:number; basePrice:number; fit:number; health:number; defects:number; born:number; caredUntil:number; addons:number; threat:number; problem?:RetentionProblem; earned:number; remainder:number; active:boolean};
export type Invoice = {id:number; account:number; cents:number; due:number; attempts:number};
export type Report = {quarter:number; opening:number; closing:number; openingCash:number; cash:number; collected:number; expenses:number; newArr:number; expansion:number; churn:number; score:{eligibleArr:number;multiple:number;stability:number;valuation:number}; choices:string[]; chosen?:string};
export type QuantitySnapshot = {tick:number; cash:number; arr:number; leads:number; trials:number; customers:number; strain:number; quarter:number};
export type PricingResolution = {actionId:string; trialId:number; timing:number; window:{start:number;end:number}; plan:'fair'|'premium'; basePrice:number; contractPrice:number; baseArr:number; arrDelta:number; customers:number; luckRank:number; luckDelta:number; collectionDue:number|null; outcome:'signed'|'missed'};
export type DemandResolution = {actionId:string; signal:number; channel:number; profile:{quality:'qualified'|'uncertain'|'noise';intent:string;fit:number}; outcome:'passed'|'qualified'|'declined'; acquisitionCost:number; productJobs:number; productQueueAfter:number};
export type ProductResolution = {actionId:string; leadId:number; trialId:number; trialsCreated:number; arrDelta:number; outcome:'shipped'};
export type RetentionResolution = {actionId:string; accountId:number; problemId:number; outcome:'progress'|'health-restored'|'concession'; workAdded:number; workCompleted:number; workRequired:number; protectedArr:number; healthDelta:number; concessionArrDelta:number; luckRank:number; luckDelta:number};
export type ExpansionResolution = {actionId:string; accountId:number; addonSlot:number; packageTargets:Array<{family:number;tier:number}>; baseArr:number; arrDelta:number; serviceCostDelta:number; luckRank:number; luckDelta:number; collectionDue:number|null; outcome:'served'};
export type OperationsPatchEffect =
 | {kind:'cash';cents:number}
 | {kind:'strain';direction:'repair'|'add';amount:number}
 | {kind:'rot';direction:'repair'|'add';target:Work;amount:number}
 | {kind:'incident';mode:'resolve'|'open';target:Work;severity:1|2|3;monthlyCostCents:number};
export type OperationsPatch = {id:number;label:string;sentiment:'positive'|'negative';valueCents:number;effect:OperationsPatchEffect};
export type OperationsIncident = {id:string;ticketId:number;patchId:number;target:Work;label:string;severity:1|2|3;openedAt:number;monthlyCostCents:number;active:boolean;resolvedAt?:number};
export type OperationsTicketState = {
  id:number;quarter:number;used:number;active:boolean;status:'offered'|'bought'|'closed';price:number;purchasedAt:number|null;purchasedBy:'manual'|'automated'|null;
  luckRank:number;patches:OperationsPatch[];inspected:number[];claimed:number[];claimedBy:Record<number,'manual'|'automated'>;net:number;closedReason?:'resolved'|'abandoned';resolvedAt?:number;
};
export type OperationsReturnBucket = {tickets:number;patchValue:number;prices:number;upkeep:number;net:number};
export type OperationsResolution = {
  actionId:string;ticketId:number;actor:'manual'|'automated';operation:'purchased'|'inspected'|'claimed'|'abandoned'|'auto-resolved';patchIds:number[];
  price:number;valueDelta:number;cashDelta:number;strainDelta:number;rotDeltas:Partial<Record<Work,number>>;incidentsOpened:string[];incidentsResolved:string[];status:OperationsTicketState['status'];failure?:string;
};
export type ActionRecord = {id:string; tick:number; command:Command};
export type ActionResult = {id:number; actionId:string; tick:number; type:'ACTION_COMMITTED'|'ACTION_REJECTED'; command:Command['type']; reason:ActionReason; jobId?:string; before:QuantitySnapshot; after:QuantitySnapshot; pricing?:PricingResolution; demand?:DemandResolution; product?:ProductResolution; retention?:RetentionResolution; expansion?:ExpansionResolution; operations?:OperationsResolution};
export type JobReservation = {jobId:string; owner:'founder'|`agent:${Work}`; actionId:string; reservedAt:number};
export type ClosedJob = {reason:'completed'|'expired'|'cancelled'; tick:number};
export type Loan = {
  id:number; principal:number; months:number; due:number; remainder:number;
  mode:'interest-only'|'amortising'; aprBps:number; acceptedAt:number; lastPaymentAt:number; maturity:number;
};
export type VentureMandate = {
  baseline:number; target:number; due:number; acceptedAt:number; startsAt:number; baselineLocked:boolean;
  rule:'quarter-growth'|'legacy-target'; growthBps:number;
};
export type Company = {
  version:string; contractVersion:string; contentVersion:string; replayBase?:string; migratedActions?:Array<{tick:number;command:Command}|ActionRecord>; seed:number; tick:number; serial:number; actionCursor:number; actions:ActionRecord[]; actionResults:ActionResult[]; phase:EnginePhase; resumePhase:'active'|'continuation'; focus:Work|'finance'|'skills';
  peakValuation?:number; cash:number; quarter:number; openingArr:number; openingCash:number; collected:number; expenses:number; newArr:number; expansion:number; churn:number;
  ranks:Record<Work,Ranks>; rot:Record<Work,number>; credits:Record<Work,number>; attempts:Record<Work,number>; lastManual:Record<Work,number>; deployed:Record<Work,number>; enabled:Record<Work,boolean>; risky:Record<Work,boolean>; completed:Record<Work,number>;
  leads:Lead[]; trials:Lead[]; accounts:Account[]; invoices:Invoice[]; market:number[]; signal:number; channel:number;
  recipe:{id:number; slots:Array<number|null>; tested?:boolean; verification?:'incomplete'|'incorrect'|'verified'}; package:{id:number; merged:number[]; board?:Array<{family:number;tier:number}|null>; supplied?:number; recovered?:boolean}; evidence:number[];
  ops:OperationsTicketState; operationsNet:number; operationsReturns:{manual:OperationsReturnBucket;automated:OperationsReturnBucket}; incidents:OperationsIncident[]; bankDamage:Record<number,number>;
  strain:number; expenseRemainder:number; expenseAccrued:number; lifetimeEarned:number; lifetimeCollected:number; lifetimeCosts:number; badDebt:number;
  debt:Loan|null;
  vc:VentureMandate|null; ownership:number;
  reports:Report[]; pendingDraftQuarter:number|null; upgrades:string[]; inventory:{relics:string[];consumables:Record<string,number>;active:{id:string;until:number}[]}; history:{tick:number;arr:number}[];
  jobs:{reservations:JobReservation[];closed:Record<string,ClosedJob>};
  pricingResolution?:PricingResolution; demandResolution?:DemandResolution; productResolution?:ProductResolution; retentionResolution?:RetentionResolution; expansionResolution?:ExpansionResolution; operationsResolution?:OperationsResolution; log:{id:number;tick:number;text:string;kind:'good'|'bad'|'info'}[]; failure:string; wonAt:number|null; inheritedWins:number;
};
export type Command =
 | {type:'start'} | {type:'pause'} | {type:'focus';work:Company['focus']}
 | {type:'cancel-job';job:string}
 | {type:'channel';channel:number} | {type:'demand';pursue:boolean;signal:number}
 | {type:'part';job:number;slot:number;part:number} | {type:'ship';job:number;early:boolean}
 | {type:'test-build';job:number}
 | {type:'price';job:number;plan:'fair'|'premium';timing?:number} | {type:'save';account:number}
 | {type:'squash-problem';account:number;problem:number;expected:number} | {type:'hit-bank';account:number;expected:number} | {type:'supply';account:number;family:number}
 | {type:'merge';account:number;pair?:number;from?:number;to?:number;expectedTier?:number} | {type:'recover-package';account:number} | {type:'expand';account:number}
 | {type:'ops-deal'} | {type:'ops-inspect';card:number;cell:number} | {type:'ops-claim';card:number;cell:number} | {type:'ops-discard';card:number}
 | {type:'reveal';cell:number} | {type:'repair';target:'rot'|'strain'}
 | {type:'buy';work:Work;axis:Axis;rank:number} | {type:'automation';work:Work} | {type:'risk';work:Work}
 | {type:'draft-skip';quarter:number} | {type:'draft';quarter:number;id:string} | {type:'consume';id:string;account?:number;problem?:number;work?:Work} | {type:'borrow';quote?:string} | {type:'raise';quote?:string} | {type:'repay-debt';loanId:number;quote?:string} | {type:'continue'};
