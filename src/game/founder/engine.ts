import { AXES, FUNCTIONS, NAMES, P, type Axis, type Work } from './profile';
import { bankHits, draftOption, quarterChoices, initialBoard, mergeOrder, opsOutcomes, productBrief } from './toys';
import type { Account, Command, Company, Lead } from './model';

const clamp = (n:number, low=0, high=1) => Math.max(low, Math.min(high,n));
const empty = <T>(make:()=>T) => Object.fromEntries(FUNCTIONS.map(f=>[f,make()])) as Record<Work,T>;
export function random(seed:number, ...keys:(string|number)[]):number {
  let h=seed>>>0;
  for (const c of keys.join(':')) {h=Math.imul(h^c.charCodeAt(0),16777619); h^=h>>>13;}
  h=Math.imul(h^(h>>>16),2246822507); h=Math.imul(h^(h>>>13),3266489909);
  return ((h^(h>>>16))>>>0)/4294967296;
}
export function createCompany(seed:number, inheritedWins=0):Company {
  return {version:P.version, seed:seed>>>0,tick:0,serial:0,actions:[],status:'setup',paused:false,focus:'demand',cash:P.starting_cash_cents+inheritedWins*P.winCashBonus,quarter:1,openingArr:0,collected:0,expenses:0,newArr:0,expansion:0,churn:0,
    ranks:empty(()=>({craft:0,scale:0,automate:0,luck:0})),rot:empty(()=>0),credits:empty(()=>0),attempts:empty(()=>0),lastManual:empty(()=>-1000),deployed:empty(()=>0),enabled:empty(()=>true),risky:empty(()=>false),completed:empty(()=>0),
    leads:[],trials:[],accounts:[],invoices:[],market:[...P.marketPerMonth],signal:0,channel:0,recipe:{id:0,slots:[]},package:{id:0,merged:[]},evidence:[],ops:{id:0,quarter:1,used:0,active:false,inspected:[],claimed:[],net:0},operationsNet:0,bankDamage:{},strain:0,expenseRemainder:0,expenseAccrued:0,lifetimeEarned:0,lifetimeCollected:0,lifetimeCosts:0,badDebt:0,debt:null,vc:null,ownership:10000,reports:[],upgrades:[],history:[{tick:0,arr:0}],log:[],failure:'',wonAt:null,inheritedWins};
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
export function eligibleArr(s:Company):number {
  const late=s.invoices.filter(i=>s.tick-i.due>P.collection_grace_ticks);
  const origins=new Set(late.map(i=>s.accounts.find(a=>a.id===i.account)?.origin));
  return s.accounts.reduce((n,a)=>n+(a.active&&!origins.has(a.origin)?a.price*a.count*12:0),0);
}
export function pressure(s:Company) {
  const load=FUNCTIONS.reduce((n,f)=>{const u=units(s,f);return n+u*P.functions[f].unit_load*(1+.15*(s.enabled[f]?s.ranks[f].automate:0))+.04*u*(u-1);},0);
  const capacity=P.coordination_base_capacity+P.coordination_capacity_per_ops_unit*units(s,'operations')*(1+.25*s.ranks.operations.craft);
  const overload=Math.max(0,load/capacity-1)+s.strain/capacity;
  return {load,capacity,overload,speed:1/(1+P.strain_speed_coefficient*overload*overload),rot:Math.max(...Object.values(s.rot))};
}
export function monthlyCost(s:Company) {
  let cost=P.base_company_overhead_cents_per_month*(has(s,'lean')?.75:1);
  for(const f of FUNCTIONS){cost+=(units(s,f)-1)*P.unit_upkeep_cents_per_month*(has(s,'lean')?.75:1);if(s.enabled[f])cost+=units(s,f)*P.auto_upkeep_cents_per_unit_month[s.ranks[f].automate];}
  for(const a of s.accounts)if(a.active)cost+=a.count*P.monthlyService[a.segment]*(1+a.addons*P.addon_service_cost_fraction);
  return Math.round(cost);
}
export function forecast(s:Company){
  const end=s.tick+P.forecast_ticks;
  const items=new Map<string,{at:number;label:string;cents:number;estimated:boolean}>();
  const add=(at:number,label:string,cents:number,estimated=true)=>{if(at>s.tick&&at<=end){const key=`${at}:${label}`;const old=items.get(key);items.set(key,{at,label,cents:(old?.cents??0)+cents,estimated});}};
  for(const i of s.invoices){const a=s.accounts.find(a=>a.id===i.account);add(i.due,'Expected collections',Math.floor(i.cents*P.forecast_collection_haircut*(a?P.collectionChance[a.segment]:0)));}
  const nextMonth=s.tick-s.tick%600+600,cost=monthlyCost(s);
  for(let at=nextMonth;at<=end;at+=600){
    add(at,'Operating bill',-Math.round(at===nextMonth?s.expenseAccrued+cost*(at-s.tick)/600:cost));
    for(const a of s.accounts)if(a.active){const earned=at===nextMonth?a.earned+a.price*a.count*(at-s.tick)/600:a.price*a.count;add(at+Math.round(P.collectionDelay[a.segment]*(has(s,'terms')?.5:1)),'Expected collections',Math.floor(earned*P.forecast_collection_haircut*P.collectionChance[a.segment]));}
  }
  if(s.debt){let principal=s.debt.principal,months=s.debt.months,remainder=s.debt.remainder;for(let at=s.debt.due;at<=end&&months>0;at+=600){const raw=principal*P.default_loan_apr_bps+remainder,repay=Math.ceil(principal/months),interest=Math.floor(raw/120000);remainder=raw%120000;add(at,'Loan payment',-repay-interest,false);principal-=repay;months--;}}
  let cash=s.cash,minimum=cash,obligations=0;
  const events=[...items.values()].sort((a,b)=>a.at-b.at||b.cents-a.cents).map(e=>{cash+=e.cents;minimum=Math.min(minimum,cash);if(e.cents<0)obligations-=e.cents;return {...e,cash};});
  return {events,minimum,obligations,shortfall:clamp(-minimum/Math.max(1,obligations)),nextBill:Math.round(s.expenseAccrued+cost*(nextMonth-s.tick)/600)};
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
export function signal(s:Company){const roll=random(s.seed,'signal',s.signal,s.channel);return {quality:roll>.35?'qualified':roll>.13?'uncertain':'noise',intent:roll>.35?'Buying now':roll>.13?'Exploring':'Just browsing',fit:roll>.35?.85:roll>.13?.57:.3};}
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
  const timing=auto?.86:distance<=half?P.pricingTimingInside:distance<=half+.16?P.pricingTimingNearMiss:P.pricingTimingMiss;
  const price=Math.round(P.monthlyPrices[trial.segment]*(plan==='premium'?1.3:.8));
  const wtp=P.monthlyPrices[trial.segment]*(.4+.6*trial.fit)*(1-P.pricingQuarterPressure*Math.min(.85,.1+.025*(s.quarter-1)));
  const fitChance=P.pricingBaseChance+P.pricingFitChance*trial.fit;
  const priceFriction=1+P.pricingFriction*(price/wtp)**P.pricingFrictionPower;
  return {price,chance:clamp(fitChance/priceFriction*timing),fit:trial.fit};
}
export const expansionAccount=(s:Company)=>s.accounts.find(a=>a.active&&a.addons<2&&a.health>=60&&s.tick-a.born>=P.expansion_maturity_months*P.ticks_per_month&&!a.threat);
export function ready(s:Company,f:Work){return s.tick-s.lastManual[f]>=P.functions[f].manual_seconds*10;}
export function unlocked(s:Company,f:Work){return f==='demand'||f==='operations'||f==='product'&&(s.leads.length>0||s.completed.product>0)||f==='monetisation'&&(s.trials.length>0||s.completed.monetisation>0)||['retention','expansion'].includes(f)&&s.accounts.length>0;}
function spend(s:Company,cents:number){if(s.cash<cents){note(s,'Not enough liquid cash. Preserve runway or inspect Finance.','bad');return false;}s.cash-=cents;return true;}
function workCost(s:Company,f:Work){const cents=f==='demand'?Math.round(P.acquisitionCents[s.channel]*(has(s,'community')?.65:1)):P.functions[f].attempt_cost_cents;if(!spend(s,cents))return false;s.expenses+=cents;s.lifetimeCosts+=cents;return true;}
function drawBatch(s:Company,f:Work,auto:boolean){
  const attempt=++s.attempts[f],r=s.risky[f]?s.ranks[f].luck:0,p=pressure(s);
  const shared=random(s.seed,'shared',Math.floor(s.tick/P.luck_epoch_ticks))<.5?-1:1;
  const local=random(s.seed,f,attempt,'luck')<.5?-1:1;
  const luck=1+P.luck_mean_per_rank*r+P.luck_sd_per_rank*r*(Math.sqrt(.4)*shared+Math.sqrt(.6)*local);
  const raw=batch(s,f)*Math.max(0,luck),quantity=Math.floor(raw)+(random(s.seed,f,attempt,'round')<raw%1?1:0);
  const error=clamp(P.functions[f].base_error+.08*p.overload**2+.45*s.rot[f]**2,0,.95);
  if(auto)s.rot[f]=clamp(s.rot[f]+(P.rot_per_auto_attempt_base+P.rot_per_auto_attempt_rank*s.ranks[f].automate)*(1+.5*p.overload));
  if(random(s.seed,f,attempt,'error')<error){s.strain+=.1;return 0;}return quantity;
}
function take(jobs:Lead[],amount:number,index=0):Lead|undefined {const job=jobs[index];if(!job)return;const n=Math.min(job.count,amount);if(n<=0)return;const out={...job,count:n};job.count-=n;if(!job.count)jobs.splice(index,1);return out;}
function billAccount(s:Company,a:Account){if(a.earned>0){s.invoices.push({id:++s.serial,account:a.id,cents:a.earned,due:s.tick+Math.round(P.collectionDelay[a.segment]*(has(s,'terms')?.5:1)),attempts:0});a.earned=0;}}
function repair(s:Company,n:number,target:'rot'|'strain'){
  const amount=n*(has(s,'maintenance')?1.5:1);
  if(target==='strain')s.strain=Math.max(0,s.strain-P.strain_repair_load_per_maintenance_point*amount);
  else{let remaining=amount*P.rot_recovery_per_maintenance_point;for(const f of [...FUNCTIONS].sort((a,b)=>s.rot[b]-s.rot[a])){const used=Math.min(s.rot[f],remaining);s.rot[f]-=used;remaining-=used;}}
}
function work(s:Company,f:Work,auto=false,option:Record<string,number|string|boolean>={}) {
  // A manual station owns its current object; other functions continue running.
  if(auto&&s.focus===f&&(f==='demand'||f==='monetisation'||f==='operations'&&s.ops.active||f==='expansion'&&s.package.id!==0||f==='retention'&&Object.keys(s.bankDamage).length>0))return false;
  if(s.deployed[f]>s.tick){if(!auto)note(s,`${NAMES[f]} is installing. Online in ${Math.ceil((s.deployed[f]-s.tick)/10)} seconds.`);return false;}
  // Scratching is finite maintenance output; it cannot be replayed instantly.
  // Other room gestures already embody the founder work and stay responsive.
  if(!auto&&f==='operations'&&!ready(s,f))return false;
  const target=f==='retention'?s.accounts.find(a=>a.active&&a.id===Number(option.account))??s.accounts.filter(a=>a.active&&(a.threat||a.caredUntil<=s.tick)).sort((a,b)=>(a.threat||Infinity)-(b.threat||Infinity))[0]:f==='expansion'?expansionAccount(s):undefined;
  const blocked=f==='demand'&&s.market[s.channel]<=0?'This monthly market pool is exhausted. Try another segment or wait for the next month.':f==='demand'&&count(s.leads)>=queueCap(s,'product')?'Product buffer is full. Ship waiting work or increase Product capacity.':f==='product'&&!s.leads.length?'No qualified demand is waiting.':f==='product'&&count(s.trials)>=queueCap(s,'monetisation')?'Monetisation buffer is full. Price the waiting trials before shipping more.':f==='monetisation'&&!s.trials.length?'No activated trials are waiting.':f==='retention'&&!target?'Every current account is covered.':f==='expansion'&&!target?'Expansion needs a healthy, mature account with a free addon slot.':f==='operations'&&s.strain<=0&&!FUNCTIONS.some(x=>s.rot[x]>0)?'No accumulated strain or rot needs repair.':'';
  if(blocked){if(!auto)note(s,blocked);return false;}
  const productIndex=f==='product'&&auto&&s.recipe.id===s.leads[0]?.id&&s.recipe.slots.some(p=>p!=null)?1:0;
  if(f==='product'&&!s.leads[productIndex])return false;
  if(!workCost(s,f))return false;
  const amount=drawBatch(s,f,auto);if(!auto)s.lastManual[f]=s.tick;
  if(!amount){if(!auto)note(s,`${NAMES[f]} produced rework. Costs were paid; no output was booked.`,'bad');return true;}
  if(f==='demand'){
    const candidate=signal(s);s.signal++;
    const n=Math.min(amount,s.market[s.channel],queueCap(s,'product')-count(s.leads));s.market[s.channel]-=n;
    if(random(s.seed,'qualified',s.signal)<candidate.fit){s.leads.push({id:++s.serial,segment:s.channel,count:n,expires:s.tick+(s.quarter===1?P.starterTTL:P.opportunity_ttl_ticks),fit:candidate.fit});s.completed[f]+=n;if(!auto)note(s,`${n} qualified opportunity${n===1?'':'ies'} → Product. Acquisition cash paid.`,'good');}
    else if(!auto)note(s,'Attention did not become buying intent. Acquisition spend is gone.','bad');
  }else if(f==='product'){
    const lead=take(s.leads,Math.min(amount,queueCap(s,'monetisation')-count(s.trials)),productIndex);if(!lead)return false;
    const fit=clamp(lead.fit*.8+.02*s.ranks.product.craft+(has(s,'quality')?.12:0)-(option.early?.18:0),.15,1);
    s.trials.push({...lead,id:++s.serial,fit,expires:s.tick+P.starterTTL});s.completed[f]+=lead.count;
    if(!s.leads.length||s.recipe.id!==s.leads[0].id)s.recipe={id:0,slots:[]};
    if(!auto)note(s,`${lead.count} verified trial${lead.count===1?'':'s'} → Monetisation. No ARR until somebody pays.`,'good');
  }else if(f==='monetisation'){
    const {price,chance}=pricingQuote(s,option.plan==='premium'?'premium':'fair',auto,typeof option.timing==='number'?option.timing:priceCursor(s));
    const trial=take(s.trials,amount);if(!trial)return false;
    let sold=0;for(let i=0;i<trial.count;i++)if(random(s.seed,'sale',s.attempts[f],i)<chance)sold++;
    const target=priceTarget(s,trial),landed=Math.abs(Number(option.timing??priceCursor(s))-target.center)<=target.width/2;
    if(sold){const id=++s.serial;const a:Account={id,origin:id,segment:trial.segment,count:sold,price,basePrice:price,fit:trial.fit,health:70,defects:Math.max(0,.7-trial.fit),born:s.tick,caredUntil:0,addons:0,threat:0,earned:0,remainder:0,active:true};s.accounts.push(a);s.newArr+=sold*price*12;s.completed[f]+=sold;note(s,`${!auto&&landed?'Sweet spot. ':''}${sold} subscription${sold===1?'':'s'} signed. Service accrues now; cash arrives after billing.`,'good');}
    else if(!auto)note(s,landed?'Sweet spot, tough room. They passed. Better product fit or a fairer price can help.':'The offer missed its window. Read this customer’s range, then time the moving marker.','bad');
  }else if(f==='retention'&&target){
    const n=Math.min(amount,target.count);let serviced=target;
    if(n<target.count){serviced={...target,id:++s.serial,count:n,earned:0,remainder:0};target.count-=n;s.accounts.push(serviced);}
    serviced.threat=0;serviced.health=clamp(serviced.health+15+5*s.ranks.retention.craft,0,100);serviced.caredUntil=s.tick+P.ticks_per_month*(has(s,'care')?2:1);s.completed[f]+=n;
    if(!auto)note(s,`${n} account${n===1?'':'s'} protected. Existing ARR preserved, never booked twice.`,'good');
  }else if(f==='expansion'&&target){
    const n=Math.min(amount,target.count);let a=target;
    if(n<target.count){a={...target,id:++s.serial,count:n,earned:0,remainder:0};target.count-=n;s.accounts.push(a);}
    const added=Math.round(a.basePrice*P.addon_price_fraction);a.price+=added;a.addons++;s.expansion+=added*n*12;s.completed[f]+=n;s.package={id:0,merged:[]};s.strain+=.05*n;
    if(!auto)note(s,`${n} account${n===1?'':'s'} expanded. One finite addon slot used; service costs increase.`,'good');
  }else if(f==='operations'){
    repair(s,amount,(option.target as 'rot'|'strain')??(s.strain>1?'strain':'rot'));s.evidence=[];s.completed[f]+=amount;
    if(!auto)note(s,`Maintenance completed. ${option.target==='strain'?'Strain backlog':'Worst context rot'} repaired.`,'good');
  }
  return true;
}
function installRank(s:Company,f:Work,a:Axis){
 s.ranks[f][a]++;if(a==='luck')s.risky[f]=true;s.deployed[f]=s.tick+P.upgrade_deploy_ticks;if(a==='automate')s.rot[f]=clamp(s.rot[f]+P.rot_per_configuration_change);
 note(s,`${NAMES[f]} ${a} ${s.ranks[f][a]} installing. Online in 5 seconds.`,'good');
}
function resolve(current:Company,c:Command):Company {
  const s=structuredClone(current);
  if(c.type==='start'){if(s.status==='setup'){s.status='running';note(s,'One founder. $1,500. Find a real customer need.');}return s;}
  if(c.type==='continue'){if(s.status==='won'){s.status='running';s.paused=false;}return s;}
  if(s.status!=='running')return current;
  if(c.type==='pause'){s.paused=!s.paused;return s;}
  if(c.type==='focus'){s.focus=c.work;return s;}
  if(s.paused)return current;
  switch(c.type){
    case 'channel':if(Number.isInteger(c.channel)&&c.channel>=0&&c.channel<3){s.channel=c.channel;s.signal++;}break;
    case 'demand':if(s.focus==='demand'&&c.signal===s.signal){if(c.pursue)work(s,'demand');else{s.signal++;note(s,'Passed. Protect your attention and acquisition cash.');}}break;
    case 'part':{const lead=s.leads[0];if(s.focus!=='product'||!lead||lead.id!==c.job||!Number.isInteger(c.slot)||c.slot<0||c.slot>=productBrief(s,lead).parts.length||!Number.isInteger(c.part)||c.part<0||c.part>5)break;if(s.recipe.id!==lead.id)s.recipe={id:lead.id,slots:[]};s.recipe.slots[c.slot]=c.part;s.recipe.tested=false;break;}
    case 'test-build':{const lead=s.leads[0];if(s.focus!=='product'||lead?.id!==c.job||s.recipe.id!==c.job)break;const brief=productBrief(s,lead);s.recipe.tested=brief.parts.every((p,i)=>s.recipe.slots[i]===p);note(s,s.recipe.tested?'Tests green. The demo can finally survive a customer.':'Tests found a mismatch. Follow the failed step back to its ingredient.',s.recipe.tested?'good':'bad');break;}
    case 'ship':if(s.focus==='product'&&s.leads[0]?.id===c.job&&s.recipe.id===c.job&&s.recipe.tested&&productBrief(s,s.leads[0]).parts.every((p,i)=>s.recipe.slots[i]===p))work(s,'product',false,{early:c.early});break;
    case 'price':if(s.focus==='monetisation'&&s.trials[0]?.id===c.job&&(c.timing===undefined||Number.isFinite(c.timing)&&c.timing>=0&&c.timing<=1))work(s,'monetisation',false,{plan:c.plan,...(c.timing===undefined?{}:{timing:c.timing})});break;
    case 'hit-bank':{const a=s.accounts.find(a=>a.id===c.account&&a.active&&(a.threat||a.caredUntil<=s.tick));if(s.focus!=='retention'||!a||c.expected!==(s.bankDamage[a.id]??0))break;s.bankDamage[a.id]=Math.min(bankHits(s),(s.bankDamage[a.id]??0)+1);if(s.bankDamage[a.id]>=bankHits(s)&&work(s,'retention',false,{account:a.id}))delete s.bankDamage[a.id];break;}
    case 'save':if(s.focus==='retention'&&(s.bankDamage[c.account]??0)>=bankHits(s)&&s.accounts.some(a=>a.id===c.account&&a.active&&(a.threat||a.caredUntil<=s.tick))){if(work(s,'retention',false,{account:c.account}))delete s.bankDamage[c.account];}break;
    case 'supply':{const a=expansionAccount(s);if(s.focus!=='expansion'||a?.id!==c.account||![0,1].includes(c.family))break;if(s.package.id!==a.id)s.package={id:a.id,merged:[],board:initialBoard(),supplied:8};const board=s.package.board??initialBoard(),i=board.indexOf(null);if(i<0||(s.package.supplied??8)>=16||board.reduce((sum,t)=>sum+(t?.family===c.family?2**(t.tier-1):0),0)>=8)break;board[i]={family:c.family,tier:1};s.package.board=board;s.package.supplied=(s.package.supplied??8)+1;break;}
    case 'merge':{const a=expansionAccount(s);if(s.focus!=='expansion'||a?.id!==c.account||c.from===undefined||c.to===undefined||!Number.isInteger(c.from)||!Number.isInteger(c.to)||c.from<0||c.from>15||c.to<0||c.to>15||c.from===c.to)break;if(s.package.id!==a.id)s.package={id:a.id,merged:[],board:initialBoard(),supplied:8};const board=s.package.board??initialBoard(),from=board[c.from],to=board[c.to];if(!from||from.tier!==c.expectedTier)break;if(!to){board[c.to]=from;board[c.from]=null;}else if(from.family===to.family&&from.tier===to.tier&&to.tier<3+a.addons){board[c.to]={family:to.family,tier:to.tier+1};board[c.from]=null;}else break;s.package.board=board;break;}
    case 'expand':{const a=expansionAccount(s);if(s.focus==='expansion'&&a?.id===c.account&&s.package.id===a.id&&mergeOrder(a.addons).every(w=>s.package.board?.some(t=>t?.family===w.family&&t.tier===w.tier)))work(s,'expansion');break;}
    case 'ops-deal':{
      if(s.focus!=='operations'||s.ops.active||!ready(s,'operations')||s.deployed.operations>s.tick)break;
      if(s.strain<=0&&!FUNCTIONS.some(f=>s.rot[f]>0)){note(s,'No accumulated strain or context rot to clear.');break;}
      s.lastManual.operations=s.tick;
      s.ops={id:s.ops.id+1,quarter:s.quarter,used:0,active:true,inspected:[],claimed:[],net:0};break;
    }
    case 'ops-inspect':if(s.focus==='operations'&&s.ops.active&&c.card===s.ops.id&&Number.isInteger(c.cell)&&c.cell>=0&&c.cell<7&&!s.ops.inspected.includes(c.cell))s.ops.inspected.push(c.cell);break;
    case 'ops-claim':{
      if(s.focus!=='operations'||!s.ops.active||c.card!==s.ops.id||!s.ops.inspected.includes(c.cell)||s.ops.claimed.includes(c.cell))break;
      const effect=opsOutcomes(s)[c.cell];if(!effect)break;
      const before=effect.target==='strain'?s.strain:s.rot[effect.target];
      const after=Math.max(0,before-effect.amount);
      if(effect.target==='strain')s.strain=after;else s.rot[effect.target]=after;
      s.ops.claimed.push(c.cell);if(before>after)s.completed.operations++;
      note(s,effect.target==='strain'?`Handoffs cleared: strain ${before.toFixed(2)} → ${after.toFixed(2)}. ${pressure(s).load>pressure(s).capacity?'Load still exceeds capacity; strain will rebuild.':'Coordination backlog reduced.'}`:`${NAMES[effect.target]} context refreshed: ${(before*100).toFixed(1)}% → ${(after*100).toFixed(1)}% rot.`,before>after?'good':'info');break;
    }
    case 'ops-discard':if(s.focus==='operations'&&s.ops.active&&c.card===s.ops.id){s.ops.active=false;note(s,'Maintenance sheet filed. Unscratched repairs were not applied.');}break;
    case 'reveal':if(s.focus==='operations'&&[0,1,2].includes(c.cell)&&!s.evidence.includes(c.cell))s.evidence.push(c.cell);break;
    case 'repair':if(s.focus==='operations'&&(c.target==='strain'||c.target==='rot'))work(s,'operations',false,{target:c.target});break;
    case 'buy':{
      if(!FUNCTIONS.includes(c.work)||!AXES.includes(c.axis)||s.ranks[c.work][c.axis]>=4||c.rank!==s.ranks[c.work][c.axis]+1)break;
      const cost=skillCost(s,c.work,c.axis);if(!spend(s,cost))break;
      installRank(s,c.work,c.axis);break;
    }
    case 'automation':if(FUNCTIONS.includes(c.work))s.enabled[c.work]=!s.enabled[c.work];break;
    case 'risk':if(FUNCTIONS.includes(c.work)&&s.ranks[c.work].luck>0)s.risky[c.work]=!s.risky[c.work];break;
    case 'draft-skip':{const report=s.reports.find(r=>r.quarter===c.quarter);if(report&&!report.chosen){report.chosen='passed';note(s,'Quarter choice passed. Sometimes the upgrade is keeping your cash.');}break;}
    case 'draft':{
      const report=s.reports.find(r=>r.quarter===c.quarter);if(!report||report.chosen||!report.choices.includes(c.id)||has(s,c.id))break;
      const option=draftOption(s,c.id,c.quarter);if(!option?.available||!spend(s,option.cost))break;
      if(option.work&&option.axis)installRank(s,option.work,option.axis);
      report.chosen=c.id;s.upgrades.push(c.id);note(s,`${option.name} became part of this company's build.`,'good');break;
    }
    case 'borrow':{const mrr=Math.floor(eligibleArr(s)/12);if(s.debt||mrr<P.debt_min_mrr_cents){note(s,'Debt needs at least $100 eligible MRR and no active loan.');break;}const principal=mrr*P.debt_capacity_mrr_multiple;s.cash+=principal;s.debt={principal,months:6,due:s.tick+600,remainder:0};note(s,'Loan funded. Six monthly payments at 18% APR. No growth mandate.');break;}
    case 'raise':{const a=eligibleArr(s);if(s.vc||a<P.vc_min_arr_cents){note(s,'VC needs $12,000 eligible ARR and is available once per run.');break;}s.cash+=a;s.ownership=Math.floor(s.ownership*.8);s.vc={baseline:a,target:Math.ceil(a*1.5),due:s.tick+1800};note(s,'Round funded. Deliver 50% ARR growth in three months or the run ends.');break;}
  }
  return s;
}
export function command(current:Company,c:Command):Company {
  const next=resolve(current,c);
  if(next!==current)next.actions.push({tick:current.tick,command:structuredClone(c)});
  return next;
}
export function replayCompany(record:Company):Company {
  let state=record.replayBase?JSON.parse(record.replayBase) as Company:createCompany(record.seed,record.inheritedWins);
  if(record.replayBase){state.replayBase=record.replayBase;validateCompany(state);}
  for(const entry of record.actions){
    if(entry.tick<state.tick)throw new Error('Replay commands are out of order.');
    if(entry.tick>state.tick){state=advance(state,entry.tick-state.tick);if(state.tick!==entry.tick)throw new Error('Replay clock cannot reach command.');}
    state=command(state,entry.command);
  }
  return advance(state,record.tick-state.tick);
}
function fail(s:Company,why:string){s.failure=why;s.status='failed';s.paused=true;note(s,why,'bad');}
function settle(s:Company,cents:number,label:string){if(s.cash<cents){fail(s,`${label} required $${(cents/100).toFixed(2)}; only $${(s.cash/100).toFixed(2)} was liquid. Keep a reserve or raise capital before the due date.`);return false;}s.cash-=cents;return true;}
export function advance(current:Company,ticks=1):Company {
  if(current.status!=='running'||current.paused)return current;
  const s=structuredClone(current);
  for(let t=0;t<ticks&&s.status==='running';t++){
    s.tick++;
    // Due customer receipts precede operating bills at the same timestamp.
    for(const i of [...s.invoices])if(i.due<=s.tick){
      const a=s.accounts.find(a=>a.id===i.account);i.attempts++;
      if(a&&random(s.seed,'collection',i.id,i.attempts)<P.collectionChance[a.segment]){s.cash+=i.cents;s.collected+=i.cents;s.lifetimeCollected+=i.cents;s.invoices=s.invoices.filter(x=>x.id!==i.id);note(s,`Invoice collected: $${(i.cents/100).toFixed(2)} liquid cash.`,'good');}
      else if(i.attempts>=P.collection_attempt_limit){s.badDebt+=i.cents;s.expenses+=i.cents;s.invoices=s.invoices.filter(x=>x.id!==i.id);if(a&&a.active){billAccount(s,a);s.churn+=a.price*a.count*12;a.active=false;}note(s,'Invoice written off after three attempts. Contract cancelled.','bad');}else i.due=s.tick+P.collection_retry_ticks;
    }
    if(s.debt&&s.tick>=s.debt.due){const d=s.debt;const principal=Math.ceil(d.principal/d.months),raw=d.principal*P.default_loan_apr_bps+d.remainder,interest=Math.floor(raw/120000);if(!settle(s,principal+interest,'Loan payment'))break;d.remainder=raw%120000;s.expenses+=interest;s.lifetimeCosts+=interest;d.principal-=principal;d.months--;d.due+=600;if(!d.principal)s.debt=null;}
    const p=pressure(s);s.strain=Math.max(0,s.strain+(p.load-p.capacity)/600);
    const rawCost=monthlyCost(s)+s.expenseRemainder,accrued=Math.floor(rawCost/600);s.expenseRemainder=rawCost%600;s.expenseAccrued+=accrued;s.expenses+=accrued;s.lifetimeCosts+=accrued;
    for(const a of s.accounts)if(a.active){
      const raw=a.price*a.count+a.remainder,earned=Math.floor(raw/600);a.remainder=raw%600;a.earned+=earned;s.lifetimeEarned+=earned;
      if(a.threat&&s.tick>=a.threat){billAccount(s,a);a.active=false;s.churn+=a.price*a.count*12;note(s,`${a.count} customer${a.count===1?'':'s'} churned after an unanswered threat.`,'bad');continue;}
      if(s.tick%10===0){a.health=clamp(a.health+(12*(a.fit-.6)-15*a.defects+(a.caredUntil>s.tick?8:0)-5*p.rot)/60,0,100);const monthly=clamp(.01+.12*(1-a.health/100)+.05*a.defects+.02*.1,.005,.35);if(!a.threat&&a.caredUntil<=s.tick&&random(s.seed,'threat',a.id,s.tick)<1-(1-monthly)**(1/60)){a.threat=s.tick+P.churn_threat_ttl_ticks;note(s,`${a.count} account${a.count===1?'':'s'} at risk. Retention has 12 seconds to intervene.`,'bad');}}
    }
    s.leads=s.leads.filter(j=>j.expires>s.tick);s.trials=s.trials.filter(j=>j.expires>s.tick);
    for(const f of FUNCTIONS){if(!s.enabled[f]||!s.ranks[f].automate||s.deployed[f]>s.tick)continue;
      s.credits[f]+=units(s,f)*P.auto_speed_by_rank[s.ranks[f].automate]*p.speed/(P.functions[f].manual_seconds*10);
      const attempts=Math.floor(s.credits[f]);s.credits[f]-=attempts;
      for(let i=0;i<attempts;i++){if(!work(s,f,true))break;}
    }
    if(s.tick%600===0){
      for(const a of s.accounts)billAccount(s,a);
      if(!settle(s,s.expenseAccrued,'Monthly operating bill'))break;s.expenseAccrued=0;s.market=[...P.marketPerMonth];
      note(s,'Month settled. Earned service invoiced; operating costs paid.');
    }
    if(s.vc&&s.tick>=s.vc.due){const a=eligibleArr(s);if(a<s.vc.target){fail(s,`VC mandate missed: $${Math.floor(a/100)} ARR against $${Math.floor(s.vc.target/100)} promised. Funding bought a deadline. Automate the bottleneck before accepting another growth obligation.`);break;}s.vc={baseline:a,target:Math.ceil(a*1.5),due:s.tick+1800};note(s,'VC growth promise met. The next three-month commitment begins.','good');}
    if(s.tick%1800===0){
      if(s.cash<=0){fail(s,'Quarter ended with no liquid cash. Preserve a reserve before investing.');break;}
      const choices=quarterChoices(s);
      s.reports.push({quarter:s.quarter,opening:s.openingArr,closing:arr(s),collected:s.collected,expenses:s.expenses,newArr:s.newArr,expansion:s.expansion,churn:s.churn,cash:s.cash,choices});s.openingArr=arr(s);s.quarter++;s.collected=0;s.expenses=0;s.newArr=0;s.expansion=0;s.churn=0;
      note(s,choices.length?'Quarter closed. Choose your next edge, or keep the cash. The company keeps running.':'Quarter closed. Every capability is installed. Keep the company alive.','good');
    }
    if(s.tick%10===0){s.history.push({tick:s.tick,arr:eligibleArr(s)});s.history=s.history.filter(h=>h.tick>=s.tick-1810);}
    if(s.tick%10===0&&s.wonAt===null&&metrics(s).valuation>=P.win_valuation_cents){s.wonAt=s.tick;s.status='won';s.paused=true;note(s,'One person. One billion. Your founder history remembers.','good');}
  }
  return s;
}
export function validateCompany(s:Company){
  if(!Array.isArray(s.actions)||!s.risky||!s.accounts.every(a=>Number.isSafeInteger(a.origin)))throw new Error('Checkpoint is missing required provenance.');
  if(!s.ops||!s.bankDamage||!Number.isSafeInteger(s.operationsNet))throw new Error('Missing toy state.');
  if(s.ops.inspected.some(i=>!Number.isInteger(i)||i<0||i>6)||new Set(s.ops.claimed).size!==s.ops.claimed.length||s.ops.claimed.some(i=>!s.ops.inspected.includes(i)))throw new Error('Invalid scratch ledger.');
  if(s.package.board&&(s.package.board.length!==16||s.package.board.some(t=>t&&(![0,1].includes(t.family)||!Number.isInteger(t.tier)||t.tier<1||t.tier>4))))throw new Error('Invalid merge board.');
  if(s.version!==P.version)throw new Error('This checkpoint belongs to another engine version.');
  if(!Number.isSafeInteger(s.cash)||s.cash<0||!Number.isInteger(s.tick)||s.tick<0)throw new Error('Invalid cash or clock.');
  for(const f of FUNCTIONS){for(const a of AXES)if(!Number.isInteger(s.ranks[f][a])||s.ranks[f][a]<0||s.ranks[f][a]>4)throw new Error('Invalid rank.');if(!Number.isFinite(s.rot[f])||s.rot[f]<0||s.rot[f]>1)throw new Error('Invalid rot.');}
  for(const a of s.accounts)if(!Number.isInteger(a.count)||a.count<1||!Number.isSafeInteger(a.price)||a.price<0)throw new Error('Invalid customer ledger.');
  const residual=s.invoices.reduce((n,i)=>n+i.cents,0)+s.accounts.reduce((n,a)=>n+a.earned,0);
  if(s.lifetimeEarned!==s.lifetimeCollected+s.badDebt+residual)throw new Error('Revenue ledger does not reconcile.');
}
