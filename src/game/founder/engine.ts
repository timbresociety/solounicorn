import { consumableUse, effectActive, hasRewardEffect, rewardById } from './rewards';
import { financeOffers, loanPayment, loanPayoff, loanSchedule, QUARTER_TICKS } from './finance';
import { AXES, FUNCTIONS, NAMES, P, skillRank, type Axis, type Work } from './profile';
import { draftOption, quarterChoices, expansionBoardSlots, initialBoard, mergeOrder, operationsAutomationUpkeepPerTicket, operationsTicketPatches, operationsTicketPrice, operationsTicketSupply, packageComplete, packageMass, packageNeeds, productBrief, retentionProblemContent } from './toys';
import { CASH_DEATH_POLICY, FOUNDER_CONTENT_VERSION, FOUNDER_CONTRACT_VERSION, phaseAdvancesTime, phaseAllows, type ActionReason } from './contracts';
import type { Account, ActionRecord, ActionResult, Command, Company, Lead, OperationsPatch, OperationsReturnBucket, OperationsTicketState, PricingResolution, QuantitySnapshot, RetentionProblem, RetentionResolution } from './model';

// Event records are immutable after commit. Copy their arrays without deep-cloning
// every historic receipt on each 100ms tick. Economic mutable state is still isolated.
function cloneCompany(current:Company):Company {
 const {actions,actionResults,migratedActions,replayBase,jobs,reports,...live}=current;
 return {...structuredClone(live),jobs:{reservations:jobs.reservations.map(r=>({...r})),closed:{...jobs.closed}},reports:reports.map(r=>({...r})),actions,actionResults,...(migratedActions?{migratedActions}:{}),...(replayBase?{replayBase}:{})};
}
const clamp = (n:number, low=0, high=1) => Math.max(low, Math.min(high,n));
const empty = <T>(make:()=>T) => Object.fromEntries(FUNCTIONS.map(f=>[f,make()])) as Record<Work,T>;
const emptyOperationsReturn=():OperationsReturnBucket=>({tickets:0,patchValue:0,prices:0,upkeep:0,net:0});
export const offeredOperationsTicket=(id=0,quarter=1,used=0):OperationsTicketState=>({id,quarter,used,active:false,status:'offered',price:0,purchasedAt:null,purchasedBy:null,luckRank:0,patches:[],inspected:[],claimed:[],claimedBy:{},net:0});
export function random(seed:number, ...keys:(string|number)[]):number {
  let h=seed>>>0;
  for (const c of keys.join(':')) {h=Math.imul(h^c.charCodeAt(0),16777619); h^=h>>>13;}
  h=Math.imul(h^(h>>>16),2246822507); h=Math.imul(h^(h>>>13),3266489909);
  return ((h^(h>>>16))>>>0)/4294967296;
}
export function createCompany(seed:number, inheritedWins=0):Company {
  return {version:P.version,contractVersion:FOUNDER_CONTRACT_VERSION,contentVersion:FOUNDER_CONTENT_VERSION,seed:seed>>>0,tick:0,serial:0,actionCursor:0,actions:[],actionResults:[],phase:'setup',resumePhase:'active',focus:'demand',cash:P.starting_cash_cents+inheritedWins*P.winCashBonus,quarter:1,openingArr:0,openingCash:P.starting_cash_cents+inheritedWins*P.winCashBonus,collected:0,expenses:0,newArr:0,expansion:0,churn:0,
    ranks:empty(()=>({craft:0,scale:0,automate:0,luck:0})),rot:empty(()=>0),credits:empty(()=>0),attempts:empty(()=>0),lastManual:empty(()=>-1000),deployed:empty(()=>0),enabled:empty(()=>true),risky:empty(()=>false),completed:empty(()=>0),
    leads:[],trials:[],accounts:[],invoices:[],market:[...P.marketPerMonth],signal:0,channel:0,recipe:{id:0,slots:[]},package:{id:0,merged:[]},evidence:[],ops:offeredOperationsTicket(),operationsNet:0,operationsReturns:{manual:emptyOperationsReturn(),automated:emptyOperationsReturn()},incidents:[],bankDamage:{},strain:0,expenseRemainder:0,expenseAccrued:0,lifetimeEarned:0,lifetimeCollected:0,lifetimeCosts:0,badDebt:0,debt:null,vc:null,ownership:10000,reports:[],pendingDraftQuarter:null,upgrades:[],inventory:{relics:[],consumables:{},active:[]},history:[{tick:0,arr:0}],jobs:{reservations:[],closed:{}},log:[],failure:'',wonAt:null,inheritedWins};
}
const note=(s:Company,text:string,kind:'good'|'bad'|'info'='info')=>{s.log.push({id:++s.serial,tick:s.tick,text,kind});if(s.log.length>30)s.log.shift();};
const has=(s:Company,id:string)=>s.upgrades.includes(id);
export const units=(s:Company,f:Work)=>P.units_by_scale_rank[s.ranks[f].scale];
// Scale increases work lanes; Automate ranks are the installed agents.
export const agentCount=(s:Company,f:Work)=>s.ranks[f].automate;
export const batch=(s:Company,f:Work)=>P.craft_batch_by_rank[s.ranks[f].craft];
export const queueCap=(s:Company,f:Work)=>units(s,f)*P.queue_slots_per_unit*batch(s,f);
export const count=(jobs:Lead[])=>jobs.reduce((n,j)=>n+j.count,0);
export const arr=(s:Company)=>s.accounts.reduce((n,a)=>n+(a.active?a.price*a.count*12:0),0);
export const leadJobId=(id:number)=>`lead:${id}`;
export const trialJobId=(id:number)=>`trial:${id}`;
export const accountJobId=(kind:'retention'|'expansion',id:number)=>`${kind}:${id}`;
export const operationsJobId=(id:number)=>`operations:${id}`;
const reservation=(s:Company,jobId:string)=>s.jobs.reservations.find(r=>r.jobId===jobId);
const reserve=(s:Company,jobId:string,owner:'founder'|`agent:${Work}`,actionId:string)=>{
  if(s.jobs.closed[jobId]?.reason==='completed'&&jobId.startsWith('expansion:'))delete s.jobs.closed[jobId];
  const existing=reservation(s,jobId);if(existing)return existing.owner===owner;
  s.jobs.reservations.push({jobId,owner,actionId,reservedAt:s.tick});return true;
};
const release=(s:Company,jobId:string,reason:'completed'|'expired'|'cancelled')=>{
  s.jobs.reservations=s.jobs.reservations.filter(r=>r.jobId!==jobId);s.jobs.closed[jobId]={reason,tick:s.tick};
};
const handoff=(s:Company,jobId:string)=>{s.jobs.reservations=s.jobs.reservations.filter(r=>r.jobId!==jobId);};
const jobWork=(jobId:string)=>jobId.startsWith('lead:')?'product':jobId.startsWith('trial:')?'monetisation':jobId.split(':')[0] as Work;
function releaseOffscreenFounderJobs(s:Company,f:Work){
  if(s.focus===f||!s.enabled[f]||!s.ranks[f].automate)return;
  for(const held of [...s.jobs.reservations])if(held.owner==='founder'&&jobWork(held.jobId)===f)handoff(s,held.jobId);
}
const quantities=(s:Company):QuantitySnapshot=>({tick:s.tick,cash:s.cash,arr:arr(s),leads:count(s.leads),trials:count(s.trials),customers:s.accounts.filter(a=>a.active).reduce((n,a)=>n+a.count,0),strain:s.strain,quarter:s.quarter});
export function evaluateCashDeath(s:Company){void s;return CASH_DEATH_POLICY;}
export function eligibleArr(s:Company):number {
  const late=s.invoices.filter(i=>s.tick-i.due>P.collection_grace_ticks);
  const byId=late.length?new Map(s.accounts.map(a=>[a.id,a.origin])):null;
  const origins=new Set(late.map(i=>byId?.get(i.account)));
  return s.accounts.reduce((n,a)=>n+(a.active&&!origins.has(a.origin)?a.price*a.count*12:0),0);
}
export function pressure(s:Company) {
  const incidentLoad=s.incidents.filter(i=>i.active).reduce((n,i)=>n+i.severity*.35,0);
  const load=FUNCTIONS.reduce((n,f)=>{const u=units(s,f);return n+u*P.functions[f].unit_load*(1+.15*(s.enabled[f]?s.ranks[f].automate:0))+.04*u*(u-1);},incidentLoad);
  const capacity=P.coordination_base_capacity+P.coordination_capacity_per_ops_unit*units(s,'operations')*(1+.25*s.ranks.operations.craft);
  const overload=Math.max(0,load/capacity-1)+s.strain/capacity;
  return {load,capacity,overload,speed:1/(1+P.strain_speed_coefficient*overload*overload),rot:Math.max(...Object.values(s.rot))};
}
export function monthlyCost(s:Company) {
  let cost=P.base_company_overhead_cents_per_month*(effectActive(s,'overhead-reduction')?P.rewardOverheadFactor:1);
  for(const f of FUNCTIONS){cost+=(units(s,f)-1)*P.unit_upkeep_cents_per_month*(effectActive(s,'overhead-reduction')?P.rewardOverheadFactor:1);cost+=computeCost(s,f);}
  for(const a of s.accounts)if(a.active)cost+=a.count*P.monthlyService[a.segment]*(1+a.addons*P.addon_service_cost_fraction*(effectActive(s,'addon-service')?P.rewardAddonServiceFactor:1));
  cost+=s.incidents.filter(i=>i.active).reduce((n,i)=>n+i.monthlyCostCents,0);
  return Math.round(cost);
}
// Estimate future accrual across temporary-effect expiry boundaries. No buff
// may discount a later bill after its active-time window has ended.
function projectedOperatingCost(s:Company,from:number,to:number){
  if(!s.inventory.active.length)return monthlyCost(s)*(to-from)/P.ticks_per_month;
  let start=from+1,total=0;
  const boundaries=[...new Set([...s.inventory.active.map(b=>b.until).filter(t=>t>start&&t<=to),to+1])].sort((a,b)=>a-b);
  for(const end of boundaries){total+=monthlyCost({...s,tick:start})*(end-start)/P.ticks_per_month;start=end;}
  return total;
}
export const capitalOffers=(s:Company)=>financeOffers(s,eligibleArr(s));
export function forecast(s:Company){
  const end=s.tick+P.forecast_ticks;
  const items=new Map<string,{at:number;label:string;cents:number;estimated:boolean}>();
  const add=(at:number,label:string,cents:number,estimated=true)=>{if(at>s.tick&&at<=end){const key=`${at}:${label}`;const old=items.get(key);items.set(key,{at,label,cents:(old?.cents??0)+cents,estimated});}};
  const accountsById=new Map(s.accounts.map(a=>[a.id,a]));
  for(const i of s.invoices){const a=accountsById.get(i.account);add(i.due,'Expected collections',Math.floor(i.cents*P.forecast_collection_haircut*(a?P.collectionChance[a.segment]:0)));}
  const nextMonth=s.tick-s.tick%600+600;
  for(let at=nextMonth;at<=end;at+=600){
    add(at,'Operating bill',-Math.round((at===nextMonth?s.expenseAccrued:0)+projectedOperatingCost(s,at===nextMonth?s.tick:at-600,at)));
    for(const a of s.accounts)if(a.active){const earned=at===nextMonth?a.earned+a.price*a.count*(at-s.tick)/600:a.price*a.count;add(at+Math.round(P.collectionDelay[a.segment]*(effectActive(s,'faster-collections')?P.rewardCollectionFactor:1)),'Expected collections',Math.floor(earned*P.forecast_collection_haircut*P.collectionChance[a.segment]));}
  }
  if(s.debt)for(const payment of loanSchedule(s.debt,end)){add(payment.at,payment.principal?'Loan principal + interest':'Loan interest',-payment.total,false);}
  let cash=s.cash,minimum=cash,obligations=0;
  const events=[...items.values()].sort((a,b)=>a.at-b.at||b.cents-a.cents).map(e=>{cash+=e.cents;minimum=Math.min(minimum,cash);if(e.cents<0)obligations-=e.cents;return {...e,cash};});
  return {events,minimum,obligations,shortfall:clamp(-minimum/Math.max(1,obligations)),nextBill:Math.round(s.expenseAccrued+projectedOperatingCost(s,s.tick,nextMonth))};
}
export function metrics(s:Company) {
  const a=eligibleArr(s),opening=s.history.find(h=>h.tick>=s.tick-P.score_history_ticks)??s.history[0];
  const growth=(a-opening.arr)/Math.max(P.arr_floor_cents,opening.arr)*Math.min(1,(s.tick-opening.tick)/P.score_history_ticks);
  let multiple=P.growth_knots.at(-1)![1];
  for(let i=1;i<P.growth_knots.length;i++){const [x1,y1]=P.growth_knots[i-1],[x2,y2]=P.growth_knots[i];if(growth<=x2){multiple=y1+(y2-y1)*clamp((growth-x1)/(x2-x1));break;}}
  const mrr=arr(s)/12,cost=monthlyCost(s),p=pressure(s);
  const burn=Math.max(0,cost-mrr)/Math.max(P.revenue_floor_cents_per_month,mrr);
  const {shortfall,nextBill,minimum}=forecast(s);
  // Owner explicitly includes operating stability. Strain/rot also affect real throughput and churn.
  const operatingStability=1/(1+.15*p.overload+.5*p.rot);
  const stability=clamp(operatingStability/(1+P.burn_weight*burn+P.shortfall_weight*shortfall),.05,1);
  return {arr:a,contractualArr:arr(s),mrr,cost,nextBill,forecastMinimum:minimum,growth,multiple,stability,valuation:Math.floor(a*multiple*stability),receivables:s.invoices.reduce((n,i)=>n+i.cents,0),unbilled:s.accounts.reduce((n,a)=>n+a.earned,0),...p};
}
export function tier(s:Company){const ranks=FUNCTIONS.reduce((n,f)=>n+AXES.reduce((m,a)=>m+s.ranks[f][a],0),0);return ranks>=48?4:ranks>=24?3:ranks>=10?2:ranks>=3?1:0;}
export const STAGES=['Garage / 01','Assisted / 02','Swarm / 03','Executive / 04','Ethereal / 05'];
export const skillCost=(s:Company,f:Work,a:Axis)=>Math.round(P.upgrade_base_cents*P.upgrade_cost_ratio**s.ranks[f][a]);
export function canBuyRank(s:Company,f:Work,a:Axis,rank:number){
  return FUNCTIONS.includes(f)&&AXES.includes(a)&&rank===s.ranks[f][a]+1&&rank<=4&&(!skillRank(f,a,rank)||rank===1||s.ranks[f][a]===rank-1);
}
export type LuckDistribution={rank:number;raw:{mean:number;variance:number};capped:{mean:number;variance:number};cap:number};
// This deliberately enumerates the independent/shared +/- stream used below,
// so the skill board and tests report the same candidate distribution rather
// than a presentation-only estimate.
export function luckDistribution(rank:number,base:number,cap:number):LuckDistribution {
  const values:[number,number][]=[];
  for(const shared of [-1,1])for(const local of [-1,1]){
    const multiplier=Math.max(0,1+P.luck_mean_per_rank*rank+P.luck_sd_per_rank*rank*(Math.sqrt(.4)*shared+Math.sqrt(.6)*local));
    values.push([base*multiplier,.25]);
  }
  const stats=(transform:(n:number)=>number)=>{const mean=values.reduce((sum,[n,p])=>sum+transform(n)*p,0);return {mean,variance:values.reduce((sum,[n,p])=>sum+(transform(n)-mean)**2*p,0)};};
  return {rank,raw:stats(n=>n),capped:stats(n=>Math.min(cap,n)),cap};
}
export function signal(s:Company){const roll=random(s.seed,'signal',s.signal,s.channel);return {quality:roll>.3?'qualified':roll>.1?'uncertain':'noise',intent:roll>.3?'Buying now':roll>.1?'Exploring':'Just browsing',fit:roll>.3?.85:roll>.1?.57:.3} as const;}
export const priceCursor=(s:Company)=>1-Math.abs(1-(s.tick%P.pricePeriodTicks)/(P.pricePeriodTicks/2));
export function priceTarget(s:Company,trial=s.trials[0]){
  if(!trial)return {start:.36,end:.64,center:.5,width:.28};
  // Every activated cohort owns a stable, seeded closing window. Segment and
  // fit change its width; opening a room or resizing can never reroll it.
  const width=clamp(.18+trial.fit*.1-trial.segment*.025,.14,.28);
  const center=width/2+(1-width)*random(s.seed,'price-target',trial.id,trial.segment);
  return {start:center-width/2,end:center+width/2,center,width};
}
export function pricingQuote(s:Company,plan:'fair'|'premium',auto=false,position=priceCursor(s)){
  const trial=s.trials[0];if(!trial)return {price:0,chance:0,fit:0};
  const target=priceTarget(s,trial),distance=Math.abs(position-target.center),half=target.width/2;
  const timing=auto||distance<=half;
  const price=Math.round(P.monthlyPrices[trial.segment]*(plan==='premium'?1.3:.8));
  return {price,chance:timing?1:0,fit:trial.fit,valid:timing,baseArr:price*Math.min(trial.count,batch(s,'monetisation'))*12,target};
}
export const expansionAccount=(s:Company)=>s.package.id?expansionAccounts(s).find(a=>a.id===s.package.id):expansionAccounts(s)[0];
const expansionAccounts=(s:Company,includeFounderReserved=false)=>s.accounts.filter(a=>a.active&&a.addons<P.addon_slots_per_customer&&a.health>=P.expansion_min_health&&s.tick-a.born>=P.expansion_maturity_months*P.ticks_per_month&&!a.threat&&(!s.jobs.closed[accountJobId('expansion',a.id)]||s.jobs.closed[accountJobId('expansion',a.id)].reason==='completed')&&(!includeFounderReserved||reservation(s,accountJobId('expansion',a.id))?.owner!=='founder')).sort((a,b)=>a.addons-b.addons||b.basePrice-a.basePrice||a.id-b.id);
export function ready(s:Company,f:Work){return s.tick-s.lastManual[f]>=P.functions[f].manual_seconds*10;}
export function unlocked(s:Company,f:Work){return f==='demand'||f==='operations'||f==='product'&&(s.leads.length>0||s.completed.product>0)||f==='monetisation'&&(s.trials.length>0||s.completed.monetisation>0)||['retention','expansion'].includes(f)&&s.accounts.length>0;}
function spend(s:Company,cents:number){if(s.cash<cents){note(s,'Not enough liquid cash. Preserve runway or inspect Finance.','bad');return false;}s.cash-=cents;return true;}
export const demandStake=(s:Company)=>Math.round(P.acquisitionCents[s.channel]*(effectActive(s,'demand-stake-reduction')?P.rewardDemandFactor:1));
function workCost(s:Company,f:Work){const cents=f==='demand'?demandStake(s):P.functions[f].attempt_cost_cents;if(!spend(s,cents))return false;s.expenses+=cents;s.lifetimeCosts+=cents;return true;}
const refreshOperationsReturn=(bucket:OperationsReturnBucket)=>{bucket.net=bucket.patchValue-bucket.prices-bucket.upkeep;};
const remainingOperationsPatches=(s:Company)=>s.ops.patches.filter(p=>!s.ops.claimed.includes(p.id));
function purchaseOperationsTicket(s:Company,actor:'manual'|'automated',actionId:string){
  if(s.ops.active)return false;
  const used=s.ops.quarter===s.quarter?s.ops.used:0,limit=operationsTicketSupply(s.ranks.operations.scale),price=operationsTicketPrice(s.ranks.operations.scale);
  if(used>=limit){if(actor==='manual')note(s,`Quarter ${s.quarter} ticket book exhausted. ${limit} of ${limit} paid tickets used.`);return false;}
  if(!spend(s,price))return false;
  const id=s.ops.id+1,luckRank=s.risky.operations?s.ranks.operations.luck:0,patches=operationsTicketPatches(s.seed,id,s.ranks.operations.scale,luckRank,s.ranks.operations.craft);
  s.expenses+=price;s.lifetimeCosts+=price;s.operationsNet-=price;
  const bucket=s.operationsReturns[actor];bucket.tickets++;bucket.prices+=price;refreshOperationsReturn(bucket);
  s.ops={id,quarter:s.quarter,used:used+1,active:true,status:'bought',price,purchasedAt:s.tick,purchasedBy:actor,luckRank,patches,inspected:[],claimed:[],claimedBy:{},net:-price};
  reserve(s,operationsJobId(id),actor==='manual'?'founder':'agent:operations',actionId);
  if(actor==='manual')s.lastManual.operations=s.tick;
  s.operationsResolution={actionId,ticketId:id,actor,operation:'purchased',patchIds:[],price,valueDelta:-price,cashDelta:-price,strainDelta:0,rotDeltas:{},incidentsOpened:[],incidentsResolved:[],status:'bought'};
  note(s,`Operations ticket ${id} bought for $${(price/100).toFixed(2)}. Outcomes are sampled once; inspection never settles them.`,'info');return true;
}
function settleOperationsPatches(s:Company,patches:OperationsPatch[],actor:'manual'|'automated',actionId:string,operation:'claimed'|'auto-resolved'){
  const fresh=patches.filter(p=>!s.ops.claimed.includes(p.id));if(!fresh.length)return false;
  const beforeCash=s.cash,beforeStrain=s.strain,beforeRot={...s.rot},incidentsOpened:string[]=[],incidentsResolved:string[]=[];let cashOutcome=0;
  for(const patch of fresh){
    const effect=patch.effect;
    if(effect.kind==='cash')cashOutcome+=effect.cents;
    else if(effect.kind==='strain')s.strain=Math.max(0,s.strain+(effect.direction==='add'?effect.amount:-effect.amount));
    else if(effect.kind==='rot')s.rot[effect.target]=clamp(s.rot[effect.target]+(effect.direction==='add'?effect.amount:-effect.amount));
    else if(effect.mode==='open'){
      const id=`operations-incident:${s.ops.id}:${patch.id}`;
      if(!s.incidents.some(i=>i.id===id)){s.incidents.push({id,ticketId:s.ops.id,patchId:patch.id,target:effect.target,label:`${NAMES[effect.target]} incident from ticket ${s.ops.id}`,severity:effect.severity,openedAt:s.tick,monthlyCostCents:effect.monthlyCostCents,active:true});incidentsOpened.push(id);}
    }else{
      const incident=s.incidents.find(i=>i.active&&i.target===effect.target)??s.incidents.find(i=>i.active);
      if(incident){incident.active=false;incident.resolvedAt=s.tick;incidentsResolved.push(incident.id);}
    }
    if(!s.ops.inspected.includes(patch.id))s.ops.inspected.push(patch.id);
    s.ops.claimed.push(patch.id);s.ops.claimedBy[patch.id]=actor;
  }
  if(cashOutcome>=0)s.cash+=cashOutcome;
  else if(settle(s,-cashOutcome,'Operations ticket settlement')){s.expenses-=cashOutcome;s.lifetimeCosts-=cashOutcome;}
  s.completed.operations+=fresh.length;
  const valueDelta=fresh.reduce((n,p)=>n+p.valueCents,0),bucket=s.operationsReturns[actor];bucket.patchValue+=valueDelta;s.ops.net+=valueDelta;s.operationsNet+=valueDelta;
  let closed=false;if(s.ops.claimed.length===s.ops.patches.length){closed=true;s.ops.active=false;s.ops.status='closed';s.ops.closedReason='resolved';s.ops.resolvedAt=s.tick;release(s,operationsJobId(s.ops.id),'completed');if(actor==='automated')bucket.upkeep+=operationsUpkeep(s);}
  refreshOperationsReturn(bucket);
  const rotDeltas=Object.fromEntries(FUNCTIONS.map(f=>[f,s.rot[f]-beforeRot[f]]).filter(([,delta])=>delta!==0)) as Partial<Record<Work,number>>;
  const failure=s.failure||undefined;
  s.operationsResolution={actionId,ticketId:s.ops.id,actor,operation,patchIds:fresh.map(p=>p.id),price:0,valueDelta,cashDelta:s.cash-beforeCash,strainDelta:s.strain-beforeStrain,rotDeltas,incidentsOpened,incidentsResolved,status:s.ops.status,...(failure?{failure}:{})};
  const positive=fresh.filter(p=>p.sentiment==='positive').length,negative=fresh.length-positive;
  note(s,`${actor==='automated'?'Agent settled':'Founder finished'} ${fresh.length} patch${fresh.length===1?'':'es'}: ${positive} positive, ${negative} negative · modeled value ${valueDelta>=0?'+':'−'}$${(Math.abs(valueDelta)/100).toFixed(2)}${closed?' · ticket closed':''}.`,valueDelta>=0?'good':'bad');return true;
}
function abandonOperationsTicket(s:Company,actionId:string){
  if(!s.ops.active)return false;
  const remaining=remainingOperationsPatches(s).map(p=>p.id);
  s.ops.active=false;s.ops.status='closed';s.ops.closedReason='abandoned';s.ops.resolvedAt=s.tick;release(s,operationsJobId(s.ops.id),'cancelled');
  s.operationsResolution={actionId,ticketId:s.ops.id,actor:'manual',operation:'abandoned',patchIds:remaining,price:0,valueDelta:0,cashDelta:0,strainDelta:0,rotDeltas:{},incidentsOpened:[],incidentsResolved:[],status:'closed'};
  note(s,`Ticket ${s.ops.id} abandoned. ${remaining.length} unfinished patch${remaining.length===1?'':'es'} expired; the $${(s.ops.price/100).toFixed(2)} purchase price stays spent.`,'bad');return true;
}
function automateOperations(s:Company,attempt:number){
  const actionId=`agent:operations:${s.tick}:${attempt}`;
  if(s.focus==='operations'&&!s.ops.active)return false;
  if(!s.ops.active&&!purchaseOperationsTicket(s,'automated',actionId))return false;
  const job=operationsJobId(s.ops.id),held=reservation(s,job);
  if(held?.owner==='founder'){if(s.focus==='operations')return false;handoff(s,job);}
  if(!reserve(s,job,'agent:operations',actionId))return false;
  return settleOperationsPatches(s,remainingOperationsPatches(s),'automated',actionId,'auto-resolved');
}
function drawBatch(s:Company,f:Work){
  const attempt=++s.attempts[f],r=s.risky[f]?s.ranks[f].luck:0,p=pressure(s);
  // D05/S06: rank-zero work never takes an invisible output/error lottery.
  // Operations has its separately documented ticket exception and does not use
  // this resolver for scratch-card outcomes.
  if(!r){
    return batch(s,f);
  }
  const shared=random(s.seed,'shared',Math.floor(s.tick/P.luck_epoch_ticks))<.5?-1:1;
  const local=random(s.seed,f,attempt,'luck')<.5?-1:1;
  const luck=1+P.luck_mean_per_rank*r+P.luck_sd_per_rank*r*(Math.sqrt(.4)*shared+Math.sqrt(.6)*local);
  const raw=batch(s,f)*Math.max(0,luck),quantity=Math.floor(raw)+(random(s.seed,f,attempt,'round')<raw%1?1:0);
  const error=clamp(P.functions[f].base_error+.08*p.overload**2+.45*s.rot[f]**2,0,.95);
  if(random(s.seed,f,attempt,'error')<error){s.strain+=.1;return 0;}return quantity;
}
function take(s:Company,jobs:Lead[],amount:number,index=0):Lead|undefined {const job=jobs[index];if(!job)return;const n=Math.min(job.count,amount);if(n<=0)return;const out={...job,count:n};job.count-=n;if(!job.count)jobs.splice(index,1);else job.id=++s.serial;return out;}
function billAccount(s:Company,a:Account){if(a.earned>0){s.invoices.push({id:++s.serial,account:a.id,cents:a.earned,due:s.tick+Math.round(P.collectionDelay[a.segment]*(effectActive(s,'faster-collections')?P.rewardCollectionFactor:1)),attempts:0});a.earned=0;}}
const retentionProblem=(a:Account)=>a.problem&&a.active&&a.threat===a.problem.deadline?a.problem:undefined;
const activeRetentionAccounts=(s:Company, includeFounderReserved=false)=>s.accounts.filter(a=>{
  const problem=retentionProblem(a);
  return !!problem&&!s.jobs.closed[accountJobId('retention',a.id)]&&(!includeFounderReserved||reservation(s,accountJobId('retention',a.id))?.owner!=='founder');
}).sort((a,b)=>a.problem!.deadline-b.problem!.deadline||b.problem!.exposedArr-a.problem!.exposedArr||a.id-b.id);
const retentionCapacity=(s:Company)=>units(s,'retention');
function openRetentionProblem(s:Company,a:Account){
  if(a.problem||activeRetentionAccounts(s,true).length>=retentionCapacity(s))return;
  const severity=(a.health<35?3:a.health<60?2:1) as 1|2|3;
  const content=retentionProblemContent(s.seed,a.id);
  const deadline=s.tick+P.churn_threat_ttl_ticks;
  const workRequired=severity*4;
  const problem:RetentionProblem={id:++s.serial,kind:content.kind,label:content.label,detail:content.detail,openedAt:s.tick,deadline,severity,workRequired,workCompleted:0,exposedArr:a.price*a.count*12};
  delete s.jobs.closed[accountJobId('retention',a.id)];a.problem=problem;a.threat=deadline;
  note(s,`${a.count} customer${a.count===1?'':'s'}: ${problem.label}. ${Math.ceil((deadline-s.tick)/10)} seconds to protect $${Math.floor(problem.exposedArr/100).toLocaleString()} existing ARR.`,'bad');
}
function resolveRetentionProblem(s:Company,a:Account,actionId:string):RetentionResolution|undefined {
  const problem=retentionProblem(a);if(!problem)return;
  const workAdded=Math.min(batch(s,'retention'),Math.max(0,problem.workRequired-problem.workCompleted));
  if(!workAdded)return;
  problem.workCompleted+=workAdded;s.attempts.retention++;
  if(problem.workCompleted<problem.workRequired){
    const progress:RetentionResolution={actionId,accountId:a.id,problemId:problem.id,outcome:'progress',workAdded,workCompleted:problem.workCompleted,workRequired:problem.workRequired,protectedArr:0,healthDelta:0,concessionArrDelta:0,luckRank:0,luckDelta:0};
    s.retentionResolution=progress;return progress;
  }
  const luckRank=s.risky.retention?s.ranks.retention.luck:0;
  // Rank zero performs no response RNG. Purchased Luck is an explicit named
  // recovery stream, after the fixed finite intervention has landed.
  const luckDelta=luckRank?(random(s.seed,'retention','response-luck',problem.id,s.attempts.retention)<.3?-1:random(s.seed,'retention','response-luck',problem.id,s.attempts.retention)>.65?1:0):0;
  const baseHealth=12+5*s.ranks.retention.craft+problem.severity*4;
  const healthDelta=Math.max(0,baseHealth+luckDelta*3*luckRank);
  const mustConcede=problem.severity===3&&a.health+healthDelta<70;
  const concessionBps=mustConcede?Math.max(250,750-luckDelta*75*luckRank):0;
  const oldArr=a.price*a.count*12;
  if(concessionBps){a.price=Math.max(1,Math.round(a.price*(10000-concessionBps)/10000));}
  const concessionArrDelta=Math.max(0,oldArr-a.price*a.count*12);
  if(concessionArrDelta)s.churn+=concessionArrDelta;
  a.health=clamp(a.health+healthDelta,0,100);a.threat=0;delete a.problem;a.caredUntil=s.tick+P.ticks_per_month*(effectActive(s,'care-window')?P.rewardCareMonths:1);s.completed.retention+=a.count;
  const outcome:RetentionResolution={actionId,accountId:a.id,problemId:problem.id,outcome:concessionArrDelta?'concession':'health-restored',workAdded,workCompleted:problem.workCompleted,workRequired:problem.workRequired,protectedArr:oldArr-concessionArrDelta,healthDelta,concessionArrDelta,luckRank,luckDelta};
  s.retentionResolution=outcome;
  note(s,concessionArrDelta?`${problem.label} contained with an explicit ${Math.round(concessionBps/100)}% concession. $${Math.floor(outcome.protectedArr/100).toLocaleString()} existing ARR remains; no ARR was booked.`:`${problem.label} contained. $${Math.floor(oldArr/100).toLocaleString()} existing ARR protected; health +${healthDelta}. No ARR was booked.`,concessionArrDelta?'info':'good');
  return outcome;
}
function resolvePricing(s:Company,plan:'fair'|'premium',timing:number,actionId:string,auto=false){
  const trial=s.trials[0];if(!trial||s.deployed.monetisation>s.tick)return false;
  const quote=pricingQuote(s,plan,auto,timing),target=priceTarget(s,trial);
  const luckRank=s.risky.monetisation?s.ranks.monetisation.luck:0;
  // Luck is an explicit pricing-only stream. Rank zero consumes no pricing RNG.
  const luckRoll=luckRank?random(s.seed,'monetisation','pricing-luck',s.attempts.monetisation+1):.5;
  const luckDelta=luckRank?(luckRoll<.30?-luckRank:luckRoll>.65?luckRank:0):0;
  const contractPrice=Math.round(quote.price*(1+luckDelta*.04));
  const committed=take(s,s.trials,Math.min(trial.count,batch(s,'monetisation')));if(!committed)return false;
  const sold=quote.valid?committed.count:0,arrDelta=sold*contractPrice*12;
  s.attempts.monetisation++;if(!auto)s.lastManual.monetisation=s.tick;release(s,trialJobId(committed.id),'completed');
  let collectionDue:number|null=null;
  if(sold){
    const id=++s.serial;const a:Account={id,origin:id,segment:committed.segment,count:sold,price:contractPrice,basePrice:contractPrice,fit:committed.fit,health:70,defects:Math.max(0,.7-committed.fit),born:s.tick,caredUntil:0,addons:0,threat:0,earned:0,remainder:0,active:true};
    s.accounts.push(a);s.newArr+=arrDelta;s.completed.monetisation+=sold;
    collectionDue=s.tick+(600-s.tick%600)+Math.round((P.collectionDelay[committed.segment]??0)*(effectActive(s,'faster-collections')?P.rewardCollectionFactor:1));
    note(s,`Signed ${sold} customer${sold===1?'':'s'} · +$${Math.floor(arrDelta/100).toLocaleString()} ARR${luckDelta?` · Luck ${luckDelta>0?'+':'−'}${Math.abs(luckDelta)*4}%`:''}. Cash collects after billing.`,'good');
  }else note(s,'No contract: the marker missed this customer’s visible range. No ARR and no collection were booked.','bad');
  const resolution:PricingResolution={actionId,trialId:committed.id,timing,window:{start:target.start,end:target.end},plan,basePrice:quote.price,contractPrice,baseArr:quote.baseArr??0,arrDelta,customers:sold,luckRank,luckDelta,collectionDue,outcome:sold?'signed':'missed'};
  s.pricingResolution=resolution;return true;
}
function work(s:Company,f:Work,auto=false,option:Record<string,number|string|boolean>={}) {
  // A manual station owns its current object; other functions continue running.
  if(auto&&s.focus===f&&f!=='retention')return false;
  if(s.deployed[f]>s.tick){if(!auto)note(s,`${NAMES[f]} is installing. Online in ${Math.ceil((s.deployed[f]-s.tick)/10)} seconds.`);return false;}
  // Scratching is finite maintenance output; it cannot be replayed instantly.
  // Other room gestures already embody the founder work and stay responsive.
  if(!auto&&f==='operations'&&!ready(s,f))return false;
  const target=f==='retention'?s.accounts.find(a=>a.active&&a.id===Number(option.account)&&retentionProblem(a))??activeRetentionAccounts(s,auto)[0]:f==='expansion'?s.accounts.find(a=>a.id===Number(option.account)&&expansionAccounts(s,auto).includes(a))??expansionAccounts(s,auto)[0]:undefined;
  const blocked=f==='demand'&&s.market[s.channel]<=0?'This monthly market pool is exhausted. Try another segment or wait for the next month.':f==='demand'&&count(s.leads)>=queueCap(s,'product')?'Product buffer is full. Ship waiting work or increase Product capacity.':f==='product'&&!s.leads.length?'No qualified demand is waiting.':f==='product'&&count(s.trials)>=queueCap(s,'monetisation')?'Monetisation buffer is full. Price the waiting trials before shipping more.':f==='monetisation'&&!s.trials.length?'No activated trials are waiting.':f==='retention'&&!target?'Every current account is covered.':f==='expansion'&&!target?'Expansion needs a healthy, mature account with a free addon slot.':'';
  if(blocked){if(!auto)note(s,blocked);return false;}
  const productIndex=f==='product'&&auto?s.leads.findIndex(j=>reservation(s,leadJobId(j.id))?.owner!=='founder'):0;
  if(f==='product'&&!s.leads[productIndex])return false;
  if(!workCost(s,f))return false;
  // Demand resolves against its visible profile; Product resolves against its
  // verified recipe. Neither rank-zero manual action can take a hidden roll.
  const deterministicManual=!auto&&!s.risky[f]&&(f==='demand'||f==='product');
  // Retention Luck belongs to the disclosed recovery/concession receipt, not
  // an invisible chance for a valid squash to do no customer work.
  const amount=f==='retention'||f==='expansion'?batch(s,f):deterministicManual?(s.attempts[f]++,batch(s,f)):drawBatch(s,f);if(!auto)s.lastManual[f]=s.tick;
  if(!amount){note(s,`${NAMES[f]} Luck ${s.ranks[f].luck} produced rework. Costs paid; no output. Pressure ${Math.round(pressure(s).overload*100)}% · context rot ${Math.round(s.rot[f]*100)}%.`,'bad');return true;}
  if(f==='demand'){
    const candidate=signal(s),signalId=s.signal;
    // Rank-zero triage is a decision against the already-visible profile. It
    // never rerolls qualification or applies the generic work-error stream.
    const n=Math.min(amount,s.market[s.channel],queueCap(s,'product')-count(s.leads));s.market[s.channel]-=n;s.signal++;
    if(candidate.quality==='qualified'){
      s.leads.push({id:++s.serial,segment:s.channel,count:n,expires:s.tick+(s.quarter===1?P.starterTTL:P.opportunity_ttl_ticks),fit:candidate.fit});s.completed[f]+=n;
      if(!auto)note(s,`${n} qualified opportunity${n===1?'':'ies'} → Product. Acquisition cash paid.`,'good');
    } else if(!auto)note(s,`${candidate.quality==='uncertain'?'Exploratory':'Poor-fit'} profile declined. The acquisition stake was spent, but no Product job was created.`,'bad');
    const actionId=String(option.actionId??`${s.seed}:${s.actionCursor+1}`);
    s.demandResolution={actionId,signal:signalId,channel:s.channel,profile:candidate,outcome:candidate.quality==='qualified'?'qualified':'declined',acquisitionCost:demandStake(s),productJobs:candidate.quality==='qualified'?n:0,productQueueAfter:count(s.leads)};
  }else if(f==='product'){
    const lead=take(s,s.leads,Math.min(amount,queueCap(s,'monetisation')-count(s.trials)),productIndex);if(!lead)return false;
    const fit=clamp(lead.fit*.8+.02*s.ranks.product.craft+(effectActive(s,'product-fit')?P.rewardProductFit:0)-(option.early?.18:0),.15,1);
    s.trials.push({...lead,id:++s.serial,fit,expires:s.tick+P.starterTTL});s.completed[f]+=lead.count;
    if(!s.leads.length||s.recipe.id!==s.leads[0].id)s.recipe={id:0,slots:[]};
    s.productResolution={actionId:String(option.actionId??`${s.seed}:${s.actionCursor+1}`),leadId:lead.id,trialId:s.trials.at(-1)!.id,trialsCreated:lead.count,arrDelta:0,outcome:'shipped'};
    release(s,leadJobId(lead.id),'completed');
    if(!auto)note(s,`${lead.count} verified trial${lead.count===1?'':'s'} → Monetisation. No ARR until somebody pays.`,'good');
  }else if(f==='retention'&&target){
    // The manual squash and agent both commit the same finite problem work.
    // `amount` above is intentionally unused: Retention batch is resolved in
    // the shared resolver so the receipt remains exact.
    void amount;const actionId=String(option.actionId??`work:${f}:${s.tick}`);
    if(auto)reserve(s,accountJobId('retention',target.id),'agent:retention',actionId);
    resolveRetentionProblem(s,target,actionId);
    if(!target.problem)release(s,accountJobId('retention',target.id),'completed');
  }else if(f==='expansion'&&target){
    const board=s.package.id===target.id?s.package.board:undefined;
    if(!board||!packageComplete(s,target,board))return false;
    s.attempts.expansion++;
    const luckRank=s.risky.expansion?s.ranks.expansion.luck:0;
    const luckRoll=luckRank?random(s.seed,'expansion','package-luck',target.id,target.addons):.5;
    const luckDelta=luckRank?(luckRoll<.30?-luckRank:luckRoll>.65?luckRank:0):0;
    const baseAdded=Math.round(target.basePrice*P.addon_price_fraction*batch(s,'expansion'));
    const added=Math.max(1,Math.round(baseAdded*(1+luckDelta*.04)));
    const baseArr=baseAdded*target.count*12,arrDelta=added*target.count*12;
    const serviceCostDelta=Math.round(target.count*P.monthlyService[target.segment]*P.addon_service_cost_fraction);
    target.price+=added;target.addons++;s.expansion+=arrDelta;s.completed[f]+=target.count;s.strain+=.05*target.count;
    const collectionDue=s.tick+(600-s.tick%600)+Math.round((P.collectionDelay[target.segment]??0)*(effectActive(s,'faster-collections')?P.rewardCollectionFactor:1));
    s.expansionResolution={actionId:String(option.actionId??`work:${f}:${s.tick}`),accountId:target.id,addonSlot:target.addons,packageTargets:mergeOrder(target.addons-1),baseArr,arrDelta,serviceCostDelta,luckRank,luckDelta,collectionDue,outcome:'served'};
    s.package={id:0,merged:[]};
    note(s,`Account ${target.id} served: +$${Math.floor(arrDelta/100).toLocaleString()} addon ARR · +$${(serviceCostDelta/100).toLocaleString()}/mo service. Billing and collection stay delayed${luckDelta?` · Luck ${luckDelta>0?'+':'−'}${Math.abs(luckDelta)*4}%`:''}.`,'good');
  }
  return true;
}
function installRank(s:Company,f:Work,a:Axis){
 s.ranks[f][a]++;if(a==='automate')releaseOffscreenFounderJobs(s,f);if(a==='luck')s.risky[f]=true;s.deployed[f]=s.tick+P.upgrade_deploy_ticks;if(a==='automate')s.rot[f]=clamp(s.rot[f]+P.rot_per_configuration_change);
 note(s,`${NAMES[f]} ${a} ${s.ranks[f][a]} installing. Online in 5 seconds.`,'good');
}
function resolve(current:Company,c:Command,actionId:string):Company {
  const s=cloneCompany(current);
  if(c.type==='start'){s.phase='active';note(s,`One founder. $${(s.cash/100).toLocaleString('en-US')} starting cash. Find a real customer need.`);return s;}
  if(c.type==='continue'){if(current.phase==='unicorn'){s.phase=s.pendingDraftQuarter===null?'continuation':'quarter-draft';s.resumePhase='continuation';}else s.phase=s.resumePhase;return s;}
  if(c.type==='pause'){s.resumePhase=current.phase==='continuation'?'continuation':'active';s.phase='paused';return s;}
  if(c.type==='focus'){
    for(const held of [...s.jobs.reservations]){
      const workName=jobWork(held.jobId);
      if(workName===c.work&&held.owner!=='founder'){handoff(s,held.jobId);reserve(s,held.jobId,'founder',actionId);}
      else if(workName===s.focus&&c.work!==s.focus&&held.owner==='founder'&&s.enabled[workName as Work]&&s.ranks[workName as Work].automate>0)handoff(s,held.jobId);
    }
    if(FUNCTIONS.includes(c.work as Work))s.credits[c.work as Work]=0;
    s.focus=c.work;return s;
  }
  switch(c.type){
    case 'cancel-job':{
      const owned=reservation(s,c.job);if(!owned||owned.owner!=='founder')break;
      if(c.job===leadJobId(s.recipe.id)){s.leads=s.leads.filter(j=>j.id!==s.recipe.id);s.recipe={id:0,slots:[]};}
      if(c.job===accountJobId('expansion',s.package.id))s.package={id:0,merged:[]};
      if(c.job.startsWith('retention:')){const account=s.accounts.find(a=>a.id===Number(c.job.split(':')[1]));if(account?.problem)account.problem.workCompleted=0;}
      if(c.job===operationsJobId(s.ops.id)){abandonOperationsTicket(s,actionId);break;}
      release(s,c.job,'cancelled');break;
    }
    case 'channel':if(Number.isInteger(c.channel)&&c.channel>=0&&c.channel<3){s.channel=c.channel;s.signal++;}break;
    case 'demand':if(s.focus==='demand'&&c.signal===s.signal){if(c.pursue)work(s,'demand');else{const profile=signal(s);s.demandResolution={actionId,signal:s.signal,channel:s.channel,profile,outcome:'passed',acquisitionCost:0,productJobs:0,productQueueAfter:count(s.leads)};s.signal++;note(s,'Passed. Protect your attention and acquisition cash.');}}break;
    case 'part':{const lead=s.leads[0];if(s.focus!=='product'||!lead||lead.id!==c.job||!Number.isInteger(c.slot)||c.slot<0||c.slot>=productBrief(s,lead).parts.length||!Number.isInteger(c.part)||c.part<0||c.part>5)break;if(!reserve(s,leadJobId(lead.id),'founder',actionId))break;if(s.recipe.id!==lead.id)s.recipe={id:lead.id,slots:[]};s.recipe.slots[c.slot]=c.part;s.recipe.tested=false;s.recipe.verification='incomplete';break;}
    case 'test-build':{const lead=s.leads[0];if(s.focus!=='product'||lead?.id!==c.job||s.recipe.id!==c.job)break;verifyRecipe(s,lead);note(s,s.recipe.tested?'Tests green. The demo can finally survive a customer.':'Tests found a mismatch. Follow the failed step back to its ingredient.',s.recipe.tested?'good':'bad');break;}
    case 'ship':if(s.focus==='product'&&s.leads[0]?.id===c.job&&s.recipe.id===c.job&&s.recipe.tested&&s.recipe.verification==='verified'&&productBrief(s,s.leads[0]).parts.every((p,i)=>s.recipe.slots[i]===p))work(s,'product',false,{early:c.early,actionId});break;
    case 'price':if(s.focus==='monetisation'&&s.trials[0]?.id===c.job&&(c.timing===undefined||Number.isFinite(c.timing)&&c.timing>=0&&c.timing<=1))resolvePricing(s,c.plan,c.timing??priceCursor(s),actionId);break;
    case 'squash-problem':{const a=s.accounts.find(a=>a.id===c.account&&a.active&&a.problem?.id===c.problem);const problem=a&&retentionProblem(a);if(s.focus!=='retention'||!a||!problem||c.expected!==problem.workCompleted||!reserve(s,accountJobId('retention',a.id),'founder',actionId))break;const result=work(s,'retention',false,{account:a.id,actionId});if(result&&a.problem===undefined)release(s,accountJobId('retention',a.id),'completed');break;}
    // Candidate.6 UI commands are deliberately not replayed into the new
    // problem model. Saves are rebased during migration; this remains a safe
    // no-op for stale external callers rather than reviving piggy-bank work.
    case 'hit-bank':case 'save':break;
    case 'supply':{const a=expansionAccount(s);if(s.focus!=='expansion'||a?.id!==c.account||![0,1].includes(c.family)||!reserve(s,accountJobId('expansion',a.id),'founder',actionId))break;if(s.package.id!==a.id)s.package={id:a.id,merged:[],board:initialBoard(),supplied:8};const board=s.package.board??initialBoard(),slots=expansionBoardSlots(s),i=board.slice(0,slots).indexOf(null),need=packageNeeds(a.addons).find(n=>n.family===c.family)?.mass??0;if(i<0||packageMass(board,c.family)>=need)break;board[i]={family:c.family,tier:1};s.package.board=board;s.package.supplied=(s.package.supplied??8)+1;break;}
    case 'merge':{const a=expansionAccount(s),slots=expansionBoardSlots(s);if(s.focus!=='expansion'||a?.id!==c.account||c.from===undefined||c.to===undefined||!Number.isInteger(c.from)||!Number.isInteger(c.to)||c.from<0||c.from>=slots||c.to<0||c.to>=slots||c.from===c.to||!reserve(s,accountJobId('expansion',a.id),'founder',actionId))break;if(s.package.id!==a.id)s.package={id:a.id,merged:[],board:initialBoard(),supplied:8};const board=s.package.board??initialBoard(),from=board[c.from],to=board[c.to];if(!from||from.tier!==c.expectedTier)break;if(!to){board[c.to]=from;board[c.from]=null;}else if(from.family===to.family&&from.tier===to.tier&&to.tier<mergeOrder(a.addons)[from.family].tier){board[c.to]={family:to.family,tier:to.tier+1};board[c.from]=null;}else break;s.package.board=board;break;}
    case 'recover-package':{const a=expansionAccount(s);if(s.focus==='expansion'&&a?.id===c.account&&s.package.id===a.id&&!s.package.recovered&&reserve(s,accountJobId('expansion',a.id),'founder',actionId)){s.package={id:a.id,merged:[],board:initialBoard(),supplied:8,recovered:true};note(s,'Package board recovered to the original finite starter modules. No new supply, cash, slot, or ARR was created.');}break;}
    case 'expand':{const a=expansionAccount(s);if(s.focus==='expansion'&&a?.id===c.account&&s.package.id===a.id&&s.package.board&&packageComplete(s,a,s.package.board)){if(work(s,'expansion',false,{account:a.id,actionId}))release(s,accountJobId('expansion',a.id),'completed');}break;}
    case 'ops-deal':{
      if(s.focus!=='operations'||s.ops.active||!ready(s,'operations')||s.deployed.operations>s.tick)break;
      purchaseOperationsTicket(s,'manual',actionId);break;
    }
    case 'ops-inspect':if(s.focus==='operations'&&s.ops.active&&c.card===s.ops.id&&s.ops.patches.some(p=>p.id===c.cell)&&!s.ops.inspected.includes(c.cell)){s.ops.inspected.push(c.cell);const patch=s.ops.patches.find(p=>p.id===c.cell)!;s.operationsResolution={actionId,ticketId:s.ops.id,actor:'manual',operation:'inspected',patchIds:[c.cell],price:0,valueDelta:0,cashDelta:0,strainDelta:0,rotDeltas:{},incidentsOpened:[],incidentsResolved:[],status:s.ops.status};note(s,`Patch ${c.cell+1} inspected: ${patch.sentiment==='positive'?'positive':'negative'} ${patch.label}. Nothing applied yet.`,patch.sentiment==='positive'?'good':'bad');}break;
    case 'ops-claim':{
      if(s.focus!=='operations'||!s.ops.active||c.card!==s.ops.id||!s.ops.inspected.includes(c.cell)||s.ops.claimed.includes(c.cell))break;
      const patch=s.ops.patches.find(p=>p.id===c.cell);if(patch)settleOperationsPatches(s,[patch],'manual',actionId,'claimed');break;
    }
    case 'ops-discard':if(s.focus==='operations'&&s.ops.active&&c.card===s.ops.id)abandonOperationsTicket(s,actionId);break;
    // Retired pre-S09 maintenance commands stay harmless for stale callers.
    case 'reveal':case 'repair':break;
    case 'buy':{
      if(!canBuyRank(s,c.work,c.axis,c.rank))break;
      const cost=skillCost(s,c.work,c.axis);if(!spend(s,cost))break;
      installRank(s,c.work,c.axis);break;
    }
    case 'automation':if(FUNCTIONS.includes(c.work)){s.enabled[c.work]=!s.enabled[c.work];s.credits[c.work]=0;releaseOffscreenFounderJobs(s,c.work);if(!s.enabled[c.work])for(const held of s.jobs.reservations.filter(r=>r.owner===`agent:${c.work}`))handoff(s,held.jobId);}break;
    case 'risk':if(FUNCTIONS.includes(c.work)&&s.ranks[c.work].luck>0)s.risky[c.work]=!s.risky[c.work];break;
    case 'draft-skip':{const report=s.reports.find(r=>r.quarter===c.quarter);if(report&&!report.chosen){report.chosen='passed';s.pendingDraftQuarter=null;s.phase='paused';note(s,'Quarter choice passed. The next quarter waits for Continue.');}break;}
    case 'draft':{
      const report=s.reports.find(r=>r.quarter===c.quarter);if(!report||report.chosen||!report.choices.includes(c.id)||has(s,c.id))break;
      const option=draftOption(s,c.id,c.quarter);if(!option?.available)break;
      if(option.kind==='relic')s.inventory.relics.push(option.id);else s.inventory.consumables[option.id]=(s.inventory.consumables[option.id]??0)+1;
      report.chosen=c.id;s.pendingDraftQuarter=null;s.phase='paused';note(s,`${option.name} added to this run. Continue when ready.`,'good');break;
    }
    case 'consume':{
      if(!consumableUse(s,c).available)break;
      const item=rewardById(c.id)!;
      if(item.duration==='month')s.inventory.active.push({id:item.id,until:s.tick+P.ticks_per_month});
      else if(item.effect==='protect-threat'){
        const account=s.accounts.find(a=>a.id===c.account)!;
        account.threat=0;delete account.problem;release(s,accountJobId('retention',account.id),'completed');account.caredUntil=s.tick+P.ticks_per_month;
      }else if(item.effect==='reset-context'&&c.work)s.rot[c.work]=0;
      s.inventory.consumables[c.id]--;note(s,`${item.name} used. ${item.cue}${item.duration==='month'?' Expires after one active month.':''}`,'good');break;
    }
    case 'borrow':{
      const terms=capitalOffers(s).debt;if(!terms.available)break;
      s.cash+=terms.principal;
      s.debt={id:++s.serial,principal:terms.principal,months:terms.months,due:s.tick+P.ticks_per_month,remainder:0,mode:'interest-only',aprBps:terms.aprBps,acceptedAt:s.tick,lastPaymentAt:s.tick,maturity:s.tick+terms.months*P.ticks_per_month};
      note(s,`Loan funded: $${(terms.principal/100).toFixed(2)}. Monthly interest $${(terms.interest/100).toFixed(2)}; principal due in ${terms.months} months. Repay early from Finance. No growth mandate.`,'good');break;
    }
    case 'repay-debt':{
      if(!s.debt||s.debt.id!==c.loanId)break;
      const payoff=loanPayoff(s.debt,s.tick);if(!spend(s,payoff.total))break;
      s.expenses+=payoff.interest;s.lifetimeCosts+=payoff.interest;s.debt=null;
      note(s,`Loan closed: $${(payoff.principal/100).toFixed(2)} principal + $${(payoff.interest/100).toFixed(2)} accrued interest. Future loan bills cancelled.`,'good');break;
    }
    case 'raise':{
      const terms=capitalOffers(s).vc;if(!terms.available)break;
      s.cash+=terms.cash;s.ownership=terms.ownership;
      s.vc={baseline:terms.baseline,target:terms.baseline+1,due:terms.due,acceptedAt:s.tick,startsAt:terms.startsAt,baselineLocked:terms.baselineLocked,rule:'quarter-growth',growthBps:0};
      note(s,`VC funded: $${(terms.cash/100).toFixed(2)}. First review at Q${terms.due/QUARTER_TICKS} close. Eligible ARR must grow during that full quarter; flat or down ends the run.`,'good');break;
    }
  }
  return s;
}
function commandJobId(c:Command):string|undefined {
  if(c.type==='part'||c.type==='test-build'||c.type==='ship')return leadJobId(c.job);
  if(c.type==='price')return trialJobId(c.job);
  if(c.type==='squash-problem'||c.type==='hit-bank'||c.type==='save')return accountJobId('retention',c.account);
  if(c.type==='supply'||c.type==='merge'||c.type==='recover-package'||c.type==='expand')return accountJobId('expansion',c.account);
  if(c.type==='ops-inspect'||c.type==='ops-claim'||c.type==='ops-discard')return operationsJobId(c.card);
  if(c.type==='cancel-job')return c.job;
}
function preflight(s:Company,c:Command):ActionReason {
  if(!phaseAllows(s.phase,c.type))return 'phase-not-allowed';
  if(c.type==='borrow'||c.type==='raise'){
    const offer=c.type==='borrow'?capitalOffers(s).debt:capitalOffers(s).vc;
    if(!offer.available)return 'invalid-command';
    if(c.quote!==undefined&&c.quote!==offer.key)return 'stale-job';
  }
  if(c.type==='repay-debt'){
    if(!s.debt||s.debt.id!==c.loanId)return 'stale-job';
    const payoff=loanPayoff(s.debt,s.tick);
    if(c.quote!==undefined&&c.quote!==payoff.key)return 'stale-job';
    if(s.cash<payoff.total)return 'unaffordable';
  }
  const workName=c.type==='ship'?'product':c.type==='price'?'monetisation':c.type==='squash-problem'?'retention':c.type==='expand'?'expansion':undefined;
  if(workName&&s.deployed[workName]>s.tick)return 'invalid-command';
  const jobId=commandJobId(c),closed=jobId?s.jobs.closed[jobId]:undefined;
  if(closed&&!(closed.reason==='completed'&&(c.type==='supply'||c.type==='merge')))return closed.reason==='expired'?'expired-job':closed.reason==='cancelled'?'cancelled-job':'stale-job';
  const held=jobId?reservation(s,jobId):undefined;
  if(held&&held.owner!=='founder')return 'job-reserved';
  if(c.type==='cancel-job')return held?.owner==='founder'?'committed':'stale-job';
  if((c.type==='part'||c.type==='test-build'||c.type==='ship')&&!s.leads.some(j=>j.id===c.job))return 'stale-job';
  if(c.type==='price'&&!s.trials.some(j=>j.id===c.job))return 'stale-job';
  if((c.type==='squash-problem'||c.type==='hit-bank'||c.type==='save')&&!s.accounts.some(a=>a.id===c.account&&a.active))return 'stale-job';
  if(c.type==='squash-problem'){
    const problem=s.accounts.find(a=>a.id===c.account)?.problem;
    if(!problem||problem.id!==c.problem||problem.workCompleted!==c.expected)return 'stale-job';
  }
  if((c.type==='supply'||c.type==='merge'||c.type==='recover-package'||c.type==='expand')&&!s.accounts.some(a=>a.id===c.account&&a.active))return 'stale-job';
  if((c.type==='supply'||c.type==='merge'||c.type==='recover-package'||c.type==='expand')&&!expansionAccounts(s).some(a=>a.id===c.account))return 'stale-job';
  if((c.type==='ops-inspect'||c.type==='ops-claim'||c.type==='ops-discard')&&(!s.ops.active||c.card!==s.ops.id))return 'stale-job';
  if(c.type==='ops-deal'){
    const used=s.ops.quarter===s.quarter?s.ops.used:0;
    if(s.focus!=='operations'||s.ops.active||!ready(s,'operations')||s.deployed.operations>s.tick||used>=operationsTicketSupply(s.ranks.operations.scale))return 'invalid-command';
    if(s.cash<operationsTicketPrice(s.ranks.operations.scale))return 'unaffordable';
  }
  if(c.type==='ops-inspect'&&(!s.ops.patches.some(p=>p.id===c.cell)||s.ops.inspected.includes(c.cell)))return 'stale-job';
  if(c.type==='ops-claim'&&(!s.ops.inspected.includes(c.cell)||s.ops.claimed.includes(c.cell)||!s.ops.patches.some(p=>p.id===c.cell)))return 'stale-job';
  if(c.type==='buy'){
    if(!canBuyRank(s,c.work,c.axis,c.rank))return 'invalid-command';
    if(s.cash<skillCost(s,c.work,c.axis))return 'unaffordable';
  }
  if(c.type==='draft-skip'&&(s.pendingDraftQuarter!==c.quarter||!s.reports.some(r=>r.quarter===c.quarter&&!r.chosen)))return 'stale-job';
  if(c.type==='draft'){
    const report=s.reports.find(r=>r.quarter===c.quarter);
    if(!report||report.chosen||s.pendingDraftQuarter!==c.quarter||!report.choices.includes(c.id)||!draftOption(s,c.id,c.quarter)?.available)return 'stale-job';
  }
  if(c.type==='consume'&&!consumableUse(s,c).available)return 'stale-job';
  if(c.type==='demand'&&c.pursue&&s.cash<demandStake(s))return 'unaffordable';
  if(['ship','squash-problem','expand'].includes(c.type)){
    const workName=c.type==='ship'?'product':c.type==='squash-problem'?'retention':'expansion';
    if(s.cash<P.functions[workName as Work].attempt_cost_cents)return 'unaffordable';
  }
  return 'committed';
}
export function dispatchCompany(current:Company,entry:ActionRecord):{company:Company;result:ActionResult} {
  const duplicate=current.actions.find(a=>a.id===entry.id);
  if(duplicate){const snapshot=quantities(current);return {company:current,result:{id:current.actionResults.length+1,actionId:entry.id,tick:current.tick,type:'ACTION_REJECTED',command:entry.command.type,reason:'duplicate-action',before:snapshot,after:snapshot}};}
  const before=quantities(current),reason=preflight(current,entry.command);
  const next=reason==='committed'?resolve(current,entry.command,entry.id):cloneCompany(current);
  next.actionCursor++;
  next.actions=[...current.actions,{id:entry.id,tick:entry.tick,command:structuredClone(entry.command)}];
  const pricing=next.pricingResolution?.actionId===entry.id?structuredClone(next.pricingResolution):undefined;
  const demand=next.demandResolution?.actionId===entry.id?structuredClone(next.demandResolution):undefined;
  const product=next.productResolution?.actionId===entry.id?structuredClone(next.productResolution):undefined;
  const retention=next.retentionResolution?.actionId===entry.id?structuredClone(next.retentionResolution):undefined;
  const expansion=next.expansionResolution?.actionId===entry.id?structuredClone(next.expansionResolution):undefined;
  const operations=next.operationsResolution?.actionId===entry.id?structuredClone(next.operationsResolution):undefined;
  const result:ActionResult={id:next.actionResults.length+1,actionId:entry.id,tick:current.tick,type:reason==='committed'?'ACTION_COMMITTED':'ACTION_REJECTED',command:entry.command.type,reason,jobId:commandJobId(entry.command),before,after:quantities(next),...(pricing?{pricing}:{}),...(demand?{demand}:{}),...(product?{product}:{}),...(retention?{retention}:{}),...(expansion?{expansion}:{}),...(operations?{operations}:{})};
  next.actionResults=[...current.actionResults,result];
  return {company:next,result};
}
export function command(current:Company,c:Command):Company {
  return dispatchCompany(current,{id:`${current.seed}:${current.actionCursor+1}`,tick:current.tick,command:c}).company;
}
export function rebaseCompany(current:Company):Company {
  const state=structuredClone(current),archived=[...(state.migratedActions??[]),...state.actions];
  state.migratedActions=archived;state.actions=[];state.actionResults=[];state.actionCursor=0;delete state.replayBase;
  state.replayBase=JSON.stringify(state);return state;
}
export function replayCompany(record:Company):Company {
  let state=record.replayBase?JSON.parse(record.replayBase) as Company:createCompany(record.seed,record.inheritedWins);
  if(record.replayBase){state.replayBase=record.replayBase;validateCompany(state);}
  for(const entry of record.actions){
    if(entry.tick<state.tick)throw new Error('Replay commands are out of order.');
    if(entry.tick>state.tick){state=advance(state,entry.tick-state.tick);if(state.tick!==entry.tick)throw new Error('Replay clock cannot reach command.');}
    state=dispatchCompany(state,entry).company;
  }
  return advance(state,record.tick-state.tick);
}
function fail(s:Company,why:string){s.failure=why;s.phase='failure';note(s,why,'bad');}
function settle(s:Company,cents:number,label:string){if(s.cash<cents){fail(s,`${label} required $${(cents/100).toFixed(2)}; only $${(s.cash/100).toFixed(2)} was liquid. Keep a reserve or raise capital before the due date.`);return false;}s.cash-=cents;return true;}
function verifyRecipe(s:Company,lead:Lead){
  s.recipe.tested=productBrief(s,lead).parts.every((part,i)=>s.recipe.slots[i]===part);
  s.recipe.verification=s.recipe.tested?'verified':'incorrect';
}
function automateProduct(s:Company,actionId:string){
  const lead=s.leads[0];if(!lead||!reserve(s,leadJobId(lead.id),'agent:product',actionId))return false;
  if(s.recipe.id!==lead.id)s.recipe={id:lead.id,slots:[]};
  const parts=productBrief(s,lead).parts,slot=parts.findIndex((part,i)=>s.recipe.slots[i]!==part);
  if(slot>=0){s.recipe.slots[slot]=parts[slot];s.recipe.tested=false;s.recipe.verification='incomplete';return true;}
  if(!s.recipe.tested){verifyRecipe(s,lead);return true;}
  return work(s,'product',true,{actionId});
}
export const computeFactor=(s:Company)=>effectActive(s,'compute-reduction')?P.rewardComputeFactor:1;
export const operationsUpkeep=(s:Company)=>operationsAutomationUpkeepPerTicket(s.ranks.operations.automate,computeFactor(s));
export const computeCost=(s:Company,f:Work)=>s.enabled[f]?Math.round(units(s,f)*P.auto_upkeep_cents_per_unit_month[s.ranks[f].automate]*computeFactor(s)):0;
export function agentStatus(s:Company,f:Work){
  const p=pressure(s),speed=p.speed/(1+P.automationRotSlowdown*s.rot[f]);
  let state='running',label='Working';
  if(!s.ranks[f].automate){state='manual';label='Manual';}
  else if(!phaseAdvancesTime(s.phase)){state='paused';label='Time paused';}
  else if(!s.enabled[f]){state='disabled';label='Switched off';}
  else if(s.deployed[f]>s.tick){state='installing';label='Installing';}
  else if(s.focus===f&&f!=='retention'){state='founder';label='Founder control';}
  else if(f==='product'&&s.leads[0]&&reservation(s,leadJobId(s.leads[0].id))?.owner==='founder'||f==='expansion'&&s.package.id&&reservation(s,accountJobId('expansion',s.package.id))?.owner==='founder'||f==='monetisation'&&s.trials[0]&&reservation(s,trialJobId(s.trials[0].id))?.owner==='founder'||f==='operations'&&s.ops.active&&reservation(s,operationsJobId(s.ops.id))?.owner==='founder'){state='held';label='Founder holds job';}
  else if(f==='demand'&&count(s.leads)>=queueCap(s,'product')||f==='product'&&count(s.trials)>=queueCap(s,'monetisation')){state='backpressure';label='Next queue full';}
  else if(f==='demand'&&s.market[s.channel]<=0){state='supply';label='Market exhausted';}
  else if(f==='product'&&(!s.leads.length||s.jobs.closed[leadJobId(s.leads[0].id)])||f==='monetisation'&&!s.trials.length||f==='retention'&&!activeRetentionAccounts(s,true).length||f==='expansion'&&(!expansionAccounts(s,true).length||s.package.id!==0&&!expansionAccounts(s,true).some(a=>a.id===s.package.id))){state='waiting';label='Waiting for work';}
  else if(f==='operations'&&!s.ops.active&&(s.ops.quarter===s.quarter?s.ops.used:0)>=operationsTicketSupply(s.ranks.operations.scale)){state='supply';label='Ticket book spent';}
  else {
    const cost=f==='monetisation'?0:f==='operations'?(s.ops.active?0:operationsTicketPrice(s.ranks.operations.scale)):f==='demand'?demandStake(s):P.functions[f].attempt_cost_cents;
    if(s.cash<cost){state='cash';label='Needs cash';}
    else if(f==='product'&&s.leads[0])label=s.recipe.id!==s.leads[0].id?'Preparing recipe':s.recipe.tested?'Shipping':productBrief(s,s.leads[0]).parts.every((v,i)=>s.recipe.slots[i]===v)?'Testing':'Assembling';
    else if(f==='expansion')label='Building package';
    else if(f==='retention')label='Resolving problem';
    else if(f==='operations')label=s.ops.active?'Resolving ticket':'Buying ticket';
  }
  return {state,label,speed,progress:state==='running'?s.credits[f]:0,installed:agentCount(s,f),lanes:units(s,f),activeCapacity:state==='running'?units(s,f):0,compute:computeCost(s,f)};
}
function automateExpansion(s:Company,attempt:number){
  const account=expansionAccounts(s,true).find(a=>a.id===s.package.id)??(!s.package.id?expansionAccounts(s,true)[0]:undefined);if(!account)return false;
  const job=accountJobId('expansion',account.id);
  if(!reserve(s,job,'agent:expansion',`agent:expansion:${s.tick}:${attempt}`))return false;
  if(s.package.id!==account.id)s.package={id:account.id,merged:[],board:initialBoard(),supplied:8};
  const board=s.package.board??initialBoard(),slots=expansionBoardSlots(s);
  const pair=board.slice(0,slots).flatMap((tile,i)=>tile?[i]:[]).flatMap(from=>board.slice(from+1,slots).map((tile,offset)=>[from,from+offset+1] as const)).find(([from,to])=>{const a=board[from],b=board[to];return a&&b&&a.family===b.family&&a.tier===b.tier&&a.tier<mergeOrder(account.addons)[a.family].tier;});
  if(pair){const [from,to]=pair,a=board[from]!;board[to]={family:a.family,tier:a.tier+1};board[from]=null;s.package.board=board;return true;}
  if(packageComplete(s,account,board)){
    const done=work(s,'expansion',true,{account:account.id,actionId:`agent:expansion:${s.tick}:${attempt}`});
    if(done)release(s,job,'completed');return done;
  }
  const vacancy=board.slice(0,slots).indexOf(null);
  if(vacancy<0)return false;
  const family=packageNeeds(account.addons).find(need=>packageMass(board,need.family)<need.mass)?.family;
  if(family===undefined)return false;
  board[vacancy]={family,tier:1};s.package.board=board;s.package.supplied=(s.package.supplied??8)+1;return true;
}
export function advance(current:Company,ticks=1):Company {
  if(!phaseAdvancesTime(current.phase))return current;
  const s=cloneCompany(current);
  for(let t=0;t<ticks&&phaseAdvancesTime(s.phase);t++){
    s.tick++;
    for(const buff of s.inventory.active)if(buff.until<=s.tick)note(s,`${rewardById(buff.id)?.name??'Consumable'} expired. Its temporary effect has ended.`);
    s.inventory.active=s.inventory.active.filter(buff=>buff.until>s.tick);
    // Due customer receipts precede operating bills at the same timestamp.
    for(const i of [...s.invoices])if(i.due<=s.tick){
      const a=s.accounts.find(a=>a.id===i.account);i.attempts++;
      if(a&&random(s.seed,'collection',i.id,i.attempts)<P.collectionChance[a.segment]){s.cash+=i.cents;s.collected+=i.cents;s.lifetimeCollected+=i.cents;s.invoices=s.invoices.filter(x=>x.id!==i.id);note(s,`Invoice collected: $${(i.cents/100).toFixed(2)} liquid cash.`,'good');}
      else if(i.attempts>=P.collection_attempt_limit){s.badDebt+=i.cents;s.expenses+=i.cents;s.invoices=s.invoices.filter(x=>x.id!==i.id);if(a&&a.active){billAccount(s,a);s.churn+=a.price*a.count*12;a.active=false;}note(s,'Invoice written off after three attempts. Contract cancelled.','bad');}else i.due=s.tick+P.collection_retry_ticks;
    }
    if(s.debt&&s.tick>=s.debt.due){
      const d=s.debt,payment=loanPayment(d),label=payment.principal?'Loan principal and interest':'Loan interest';
      if(!settle(s,payment.total,label))break;
      d.remainder=payment.remainder;s.expenses+=payment.interest;s.lifetimeCosts+=payment.interest;
      d.principal-=payment.principal;d.months--;d.lastPaymentAt=s.tick;d.due+=P.ticks_per_month;
      note(s,`${label} paid: $${(payment.total/100).toFixed(2)}. $${(d.principal/100).toFixed(2)} principal remains.`);
      if(!d.principal)s.debt=null;
    }
    if(s.debt&&s.debt.due-s.tick===P.financeWarningTicks){const payment=loanPayment(s.debt);note(s,`Loan ${payment.principal?'principal + interest':'interest'} due in ${P.financeWarningTicks/10}s: $${(payment.total/100).toFixed(2)}; cash $${(s.cash/100).toFixed(2)}.`,s.cash<payment.total?'bad':'info');}
    if(s.vc&&s.vc.baselineLocked&&s.vc.due-s.tick===P.financeWarningTicks)note(s,`VC review in ${P.financeWarningTicks/10}s: $${(eligibleArr(s)/100).toFixed(2)} eligible ARR against ${s.vc.rule==='quarter-growth'?'opening':'target'} $${((s.vc.rule==='quarter-growth'?s.vc.baseline:s.vc.target)/100).toFixed(2)}.`,eligibleArr(s)<s.vc.target?'bad':'info');
    const p=pressure(s);s.strain=Math.max(0,s.strain+(p.load-p.capacity)/600);
    const rawCost=monthlyCost(s)+s.expenseRemainder,accrued=Math.floor(rawCost/600);s.expenseRemainder=rawCost%600;s.expenseAccrued+=accrued;s.expenses+=accrued;s.lifetimeCosts+=accrued;
    for(const a of s.accounts)if(a.active){
      const raw=a.price*a.count+a.remainder,earned=Math.floor(raw/600);a.remainder=raw%600;a.earned+=earned;s.lifetimeEarned+=earned;
      if(a.threat&&s.tick>=a.threat){const problem=retentionProblem(a);billAccount(s,a);a.active=false;s.churn+=a.price*a.count*12;release(s,accountJobId('retention',a.id),'expired');note(s,`${a.count} customer${a.count===1?'':'s'} churned after ${problem?.label??'an unanswered customer problem'}. $${Math.floor((problem?.exposedArr??a.price*a.count*12)/100).toLocaleString()} ARR lost.`,'bad');continue;}
      if(s.tick%10===0){a.health=clamp(a.health+(12*(a.fit-.6)-15*a.defects+(a.caredUntil>s.tick?8:0)-5*p.rot)/60,0,100);const monthly=clamp(.01+.12*(1-a.health/100)+.05*a.defects+.02*.1,.005,.35);if(!a.threat&&a.caredUntil<=s.tick&&random(s.seed,'threat',a.id,s.tick)<1-(1-monthly)**(1/60))openRetentionProblem(s,a);}
    }
    const expiredLeads=s.leads.filter(j=>j.expires<=s.tick),expiredTrials=s.trials.filter(j=>j.expires<=s.tick);
    s.leads=s.leads.filter(j=>j.expires>s.tick);s.trials=s.trials.filter(j=>j.expires>s.tick);
    for(const job of expiredLeads)release(s,leadJobId(job.id),'expired');
    for(const job of expiredTrials)release(s,trialJobId(job.id),'expired');
    if(expiredLeads.some(j=>j.id===s.recipe.id))s.recipe={id:0,slots:[]};
    if(s.package.id&&!s.accounts.some(a=>a.id===s.package.id&&a.active&&a.addons<P.addon_slots_per_customer)){
      release(s,accountJobId('expansion',s.package.id),'expired');s.package={id:0,merged:[]};
    }
    for(const held of [...s.jobs.reservations])if(held.jobId.startsWith('retention:')&&!s.accounts.some(a=>a.active&&a.problem&&accountJobId('retention',a.id)===held.jobId))release(s,held.jobId,'expired');
    const pipeline={leads:new Set(s.leads.map(j=>j.id)),trials:new Set(s.trials.map(j=>j.id))};
    for(const f of FUNCTIONS){
      if(f==='product'&&!pipeline.leads.has(s.leads[0]?.id)||f==='monetisation'&&!pipeline.trials.has(s.trials[0]?.id)){s.credits[f]=0;continue;}
      if(agentStatus(s,f).state!=='running'){s.credits[f]=0;continue;}
      const steps=f==='product'?productBrief(s,s.leads[0]).parts.length+2:1;
      const speed=agentStatus(s,f).speed;
      // Credit is at most one tick of effort. Blocked/disabled rooms cannot bank bursts.
      s.credits[f]+=units(s,f)*P.auto_speed_by_rank[s.ranks[f].automate]*speed*steps/(P.functions[f].manual_seconds*10);
      const attempts=Math.floor(s.credits[f]);s.credits[f]-=attempts;
      for(let i=0;i<attempts;i++){
        if(agentStatus(s,f).state!=='running') {s.credits[f]=0;break;}
        if(f==='product'&&!pipeline.leads.has(s.leads[0]?.id)||f==='monetisation'&&!pipeline.trials.has(s.trials[0]?.id)){s.credits[f]=0;break;}
        const id=`agent:${f}:${s.tick}:${i}`;
        const completed=f==='product'?automateProduct(s,id)
          :f==='monetisation'?resolvePricing(s,'fair',priceTarget(s).center,id,true)
          :f==='expansion'?automateExpansion(s,i):f==='operations'?automateOperations(s,i):work(s,f,true,{actionId:id});
        if(!completed){s.credits[f]=0;break;}
        s.rot[f]=clamp(s.rot[f]+(P.rot_per_auto_attempt_base+P.rot_per_auto_attempt_rank*s.ranks[f].automate)*(1+.5*pressure(s).overload)/steps*(hasRewardEffect(s,'context-decay')?P.rewardRotFactor:1));
        if(!phaseAdvancesTime(s.phase))break;
      }
      if(!phaseAdvancesTime(s.phase))break;
    }
    if(!phaseAdvancesTime(s.phase))break;
    if(s.tick%600===0){
      for(const a of s.accounts)billAccount(s,a);
      if(!settle(s,s.expenseAccrued,'Monthly operating bill'))break;s.expenseAccrued=0;s.market=[...P.marketPerMonth];
      note(s,'Month settled. Earned service invoiced; operating costs paid.');
    }
    if(s.vc&&!s.vc.baselineLocked&&s.tick>=s.vc.startsAt){
      s.vc.baseline=eligibleArr(s);s.vc.target=s.vc.baseline+1;s.vc.baselineLocked=true;
      note(s,`VC quarter opened at $${(s.vc.baseline/100).toFixed(2)} eligible ARR. Finish above this baseline to survive.`);
    }
    if(s.vc&&s.tick>=s.vc.due){
      const mandate=s.vc,a=eligibleArr(s);
      if(a<mandate.target){fail(s,`VC mandate missed: $${(a/100).toFixed(2)} eligible ARR versus ${mandate.rule==='quarter-growth'?'quarter opening':'accepted target'} $${((mandate.rule==='quarter-growth'?mandate.baseline:mandate.target)/100).toFixed(2)}. ${mandate.rule==='quarter-growth'?'Flat or falling ARR ends a VC-backed run.':'The saved legacy growth promise was not met.'}`);break;}
      mandate.baseline=a;mandate.target=mandate.rule==='quarter-growth'?a+1:Math.ceil(a*(10000+mandate.growthBps)/10000);mandate.startsAt=s.tick;mandate.due+=QUARTER_TICKS;
      note(s,'VC growth promise met. The next full-quarter assessment begins.','good');
    }
    if(s.tick%1800===0){
      s.resumePhase=s.phase==='continuation'?'continuation':'active';s.phase='settlement';
      evaluateCashDeath(s);
      // Every due receipt, loan, operating bill and mandate above has resolved
      // before this immutable close record, then before either reward or win.
      const score=metrics(s);s.peakValuation=Math.max(s.peakValuation??0,score.valuation);const closedQuarter=s.quarter,closing=arr(s);
      s.reports.push({quarter:closedQuarter,opening:s.openingArr,closing,openingCash:s.openingCash,collected:s.collected,expenses:s.expenses,newArr:s.newArr,expansion:s.expansion,churn:s.churn,cash:s.cash,score:{eligibleArr:score.arr,multiple:score.multiple,stability:score.stability,valuation:score.valuation},choices:quarterChoices(s)});
      s.openingArr=closing;s.openingCash=s.cash;s.quarter++;s.collected=0;s.expenses=0;s.newArr=0;s.expansion=0;s.churn=0;
      s.pendingDraftQuarter=closedQuarter;
      if(s.wonAt===null&&score.valuation>=P.win_valuation_cents){s.wonAt=s.tick;s.phase='unicorn';note(s,'One person. One billion. Your founder history remembers.','good');break;}
      s.phase='quarter-draft';note(s,'Quarter closed. Time is frozen while you choose what changes.','good');
    }
    if(s.tick%10===0){s.history.push({tick:s.tick,arr:eligibleArr(s)});s.history=s.history.filter(h=>h.tick>=s.tick-1810);}
    if(s.tick%10===0){const valuation=metrics(s).valuation;s.peakValuation=Math.max(s.peakValuation??0,valuation);if(s.wonAt===null&&valuation>=P.win_valuation_cents){s.wonAt=s.tick;s.phase='unicorn';note(s,'One person. One billion. Your founder history remembers.','good');}}
  }
  return s;
}
export function validateCompany(s:Company){
  if(s.peakValuation!==undefined&&(!Number.isSafeInteger(s.peakValuation)||s.peakValuation<0))throw new Error('Invalid environment milestone.');
  if(s.contractVersion!==FOUNDER_CONTRACT_VERSION||s.contentVersion!==FOUNDER_CONTENT_VERSION)throw new Error('Checkpoint contract or content version is incompatible.');
  if(!Array.isArray(s.actions)||!Array.isArray(s.actionResults)||!Number.isSafeInteger(s.actionCursor)||s.actionCursor<s.actions.length||!s.risky||!s.accounts.every(a=>Number.isSafeInteger(a.origin)))throw new Error('Checkpoint is missing required provenance.');
  if(!s.jobs||!Array.isArray(s.jobs.reservations)||new Set(s.jobs.reservations.map(r=>r.jobId)).size!==s.jobs.reservations.length)throw new Error('Invalid job ownership ledger.');
  if(!s.inventory||!Array.isArray(s.inventory.relics)||!s.inventory.consumables||!Number.isSafeInteger(s.openingCash)||!['setup','active','settlement','quarter-draft','paused','failure','unicorn','continuation'].includes(s.phase))throw new Error('Missing phase or inventory state.');
  if(new Set(s.inventory.relics).size!==s.inventory.relics.length||s.inventory.relics.some(id=>rewardById(id)?.kind!=='relic')||Object.entries(s.inventory.consumables).some(([id,n])=>rewardById(id)?.kind!=='consumable'||!Number.isSafeInteger(n)||n<0)||!Array.isArray(s.inventory.active)||new Set(s.inventory.active.map(b=>b.id)).size!==s.inventory.active.length||s.inventory.active.some(b=>rewardById(b.id)?.duration!=='month'||!Number.isSafeInteger(b.until)||b.until<=s.tick))throw new Error('Invalid reward inventory or expiry.');
  if(s.phase==='quarter-draft'&&s.pendingDraftQuarter===null)throw new Error('Quarter draft phase has no pending draft.');
  if(s.reports.some(r=>!Number.isSafeInteger(r.openingCash)||!r.score||!Number.isFinite(r.score.multiple)||!Number.isFinite(r.score.stability)||!Number.isSafeInteger(r.score.valuation)||r.choices.length!==new Set(r.choices).size))throw new Error('Invalid quarter report or offer ledger.');
  if(s.actions.some((a,i)=>!a.id||a.tick<0||(i>0&&a.tick<s.actions[i-1].tick))||new Set(s.actions.map(a=>a.id)).size!==s.actions.length)throw new Error('Invalid action identity or ordering.');
  if(s.actionResults.length!==s.actions.length||s.actionResults.some((r,i)=>r.actionId!==s.actions[i].id))throw new Error('Action results do not match the action log.');
  if(!s.ops||!s.bankDamage||!Number.isSafeInteger(s.operationsNet)||!s.operationsReturns||!Array.isArray(s.incidents))throw new Error('Missing toy state.');
  if(s.recipe.verification!==undefined&&!['incomplete','incorrect','verified'].includes(s.recipe.verification))throw new Error('Invalid recipe verification state.');
  if(s.recipe.verification==='verified'&&!s.recipe.tested)throw new Error('Verified recipe is missing its test result.');
  const patchIds=s.ops.patches.map(p=>p.id);
  if(!['offered','bought','closed'].includes(s.ops.status)||s.ops.active!==(s.ops.status==='bought')||new Set(patchIds).size!==patchIds.length||s.ops.inspected.some(i=>!patchIds.includes(i))||new Set(s.ops.inspected).size!==s.ops.inspected.length||new Set(s.ops.claimed).size!==s.ops.claimed.length||s.ops.claimed.some(i=>!s.ops.inspected.includes(i))||Object.keys(s.ops.claimedBy).some(id=>!s.ops.claimed.includes(Number(id)))||s.ops.patches.some(p=>!Number.isSafeInteger(p.valueCents)||p.sentiment!==(p.valueCents>=0?'positive':'negative')))throw new Error('Invalid scratch ledger.');
  for(const bucket of Object.values(s.operationsReturns))if(!Number.isSafeInteger(bucket.tickets)||!Number.isSafeInteger(bucket.patchValue)||!Number.isSafeInteger(bucket.prices)||!Number.isSafeInteger(bucket.upkeep)||bucket.net!==bucket.patchValue-bucket.prices-bucket.upkeep)throw new Error('Invalid Operations return ledger.');
  if(new Set(s.incidents.map(i=>i.id)).size!==s.incidents.length||s.incidents.some(i=>!FUNCTIONS.includes(i.target)||i.severity<1||i.severity>3||i.monthlyCostCents<0))throw new Error('Invalid Operations incident ledger.');
  if(s.package.board&&(s.package.board.length!==16||s.package.board.some(t=>t&&(![0,1].includes(t.family)||!Number.isInteger(t.tier)||t.tier<1||t.tier>4))))throw new Error('Invalid merge board.');
  if(s.version!==P.version)throw new Error('This checkpoint belongs to another engine version.');
  if(!Number.isSafeInteger(s.cash)||s.cash<0||!Number.isInteger(s.tick)||s.tick<0)throw new Error('Invalid cash or clock.');
  if(!Number.isSafeInteger(s.inheritedWins)||s.inheritedWins<0||s.wonAt!==null&&(!Number.isSafeInteger(s.wonAt)||s.wonAt<=0||s.wonAt>s.tick)||s.phase==='unicorn'&&s.wonAt===null)throw new Error('Invalid founder history marker.');
  if(s.debt){
    const d=s.debt;
    if(![d.id,d.principal,d.months,d.due,d.remainder,d.aprBps,d.acceptedAt,d.lastPaymentAt,d.maturity].every(Number.isSafeInteger)||d.principal<=0||d.months<1||d.months>P.default_loan_term_months||d.remainder<0||d.remainder>=120000||d.aprBps<0||d.acceptedAt<0||d.lastPaymentAt<d.acceptedAt||d.lastPaymentAt>s.tick||d.due!==d.lastPaymentAt+P.ticks_per_month||d.maturity!==d.due+(d.months-1)*P.ticks_per_month||!['interest-only','amortising'].includes(d.mode))throw new Error('Invalid accepted loan terms or schedule.');
  }
  if(s.vc){
    const v=s.vc;
    if(![v.baseline,v.target,v.due,v.acceptedAt,v.startsAt,v.growthBps].every(Number.isSafeInteger)||v.baseline<0||v.target<0||v.acceptedAt<0||v.startsAt<v.acceptedAt||v.due!==v.startsAt+QUARTER_TICKS||typeof v.baselineLocked!=='boolean'||!['quarter-growth','legacy-target'].includes(v.rule)||v.rule==='quarter-growth'&&(v.target!==v.baseline+1||v.startsAt%QUARTER_TICKS!==0||v.growthBps!==0))throw new Error('Invalid accepted VC terms or assessment schedule.');
  }
  for(const f of FUNCTIONS){for(const a of AXES)if(!Number.isInteger(s.ranks[f][a])||s.ranks[f][a]<0||s.ranks[f][a]>4)throw new Error('Invalid rank.');if(!Number.isFinite(s.credits[f])||s.credits[f]<0||s.credits[f]>=1)throw new Error('Invalid automation credit.');if(!Number.isFinite(s.rot[f])||s.rot[f]<0||s.rot[f]>1)throw new Error('Invalid rot.');}
  for(const a of s.accounts)if(!Number.isInteger(a.count)||a.count<1||!Number.isSafeInteger(a.price)||a.price<0)throw new Error('Invalid customer ledger.');
  const residual=s.invoices.reduce((n,i)=>n+i.cents,0)+s.accounts.reduce((n,a)=>n+a.earned,0);
  if(s.lifetimeEarned!==s.lifetimeCollected+s.badDebt+residual)throw new Error('Revenue ledger does not reconcile.');
}
