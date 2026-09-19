import type { Company, Command } from './model';
import { FUNCTIONS, P, type Work } from './profile';

export const BUILD_FAMILIES={bootstrap:'Default alive',growth:'Ship and sell',durable:'Customers stay',automation:'Small team of agents'} as const;
export type BuildFamily=keyof typeof BUILD_FAMILIES;
// Candidate magnitudes are owned by P. Content identifies an engine effect, never computes ARR.
export const REWARD_EFFECTS={
 'overhead-reduction':{target:'base overhead and unit upkeep',unit:'cost factor',value:P.rewardOverheadFactor,trigger:'operating accrual',legacy:'lean',summary:`Base overhead and unit upkeep cost ${Math.round((1-P.rewardOverheadFactor)*100)}% less. Compute and service bills stay full price.`},
 'faster-collections':{target:'new invoices',unit:'delay factor',value:P.rewardCollectionFactor,trigger:'invoice creation',legacy:'terms',summary:`New invoices wait ${Math.round((1-P.rewardCollectionFactor)*100)}% less before collection. Existing invoices keep their dates.`},
 'demand-stake-reduction':{target:'Demand acquisition stakes',unit:'cost factor',value:P.rewardDemandFactor,trigger:'paid Demand attempt',legacy:'community',summary:`Demand stakes cost ${Math.round((1-P.rewardDemandFactor)*100)}% less. Poor-fit profiles still waste the stake.`},
 'product-fit':{target:'new Product shipments',unit:'fit points',value:P.rewardProductFit,trigger:'Product shipment',legacy:'quality',summary:`New shipments gain ${Math.round(P.rewardProductFit*100)} fit points, capped at 100. The recipe still needs your work.`},
 'care-window':{target:'resolved customer problems',unit:'months',value:P.rewardCareMonths,trigger:'Retention resolution',legacy:'care',summary:`Resolved problems get ${P.rewardCareMonths} months of care. Unanswered problems still churn.`},
 'addon-service':{target:'addon service overhead',unit:'cost factor',value:P.rewardAddonServiceFactor,trigger:'service accrual',legacy:'',summary:`Addon service overhead costs ${Math.round((1-P.rewardAddonServiceFactor)*100)}% less. Base service costs stay unchanged.`},
 'context-decay':{target:'agent routine context rot',unit:'gain factor',value:P.rewardRotFactor,trigger:'completed agent effort',legacy:'',summary:`Routine agent work adds ${Math.round((1-P.rewardRotFactor)*100)}% less context rot. Existing rot remains.`},
 'compute-reduction':{target:'enabled agents',unit:'cost factor',value:P.rewardComputeFactor,trigger:'compute accrual',legacy:'',summary:`Agent compute costs ${Math.round((1-P.rewardComputeFactor)*100)}% less. Coordination load still grows.`},
 'protect-threat':{target:'one live customer problem',unit:'months of care',value:1,trigger:'manual use',legacy:'',summary:'Resolve one live customer problem and protect it for one month. No new ARR.'},
 'reset-context':{target:'one function',unit:'context rot',value:0,trigger:'manual use',legacy:'',summary:'Clear one function’s context rot. Strain and recurring compute bills remain.'},
} as const;
export type RewardEffect=keyof typeof REWARD_EFFECTS;
export type Reward={id:string;kind:'relic'|'consumable';family:BuildFamily;name:string;effect:RewardEffect;downside:string;cue:string;duration:'run'|'month'|'instant';context:string;cost:'One quarter choice';stacking:'unique effect'|'up to three charges';locale:'en';contentVersion:'founder-rewards.12'};
const item=(id:string,family:BuildFamily,name:string,effect:RewardEffect,downside:string,cue:string,duration:Reward['duration']='run'):Reward=>({id,kind:duration==='run'?'relic':'consumable',family,name,effect,downside,cue,duration,context:'Quarter reward; original founder fiction. Name is flavor, effect text is mechanical.',cost:'One quarter choice',stacking:duration==='run'?'unique effect':'up to three charges',locale:'en',contentVersion:'founder-rewards.12'});
export const REWARDS:readonly Reward[]=[
 item('relic:ramen-budget','bootstrap','Ramen budget','overhead-reduction','No discount on customer service or compute.','Monthly bill falls.'),
 item('relic:clean-terms','bootstrap','Clean terms','faster-collections','Shorter terms do not guarantee collection.','New invoice dates move closer.'),
 item('consumable:weekend-budget','bootstrap','Cancel the offsite','overhead-reduction','One month only; cannot stack with Ramen budget.','One-month bill discount.','month'),
 item('relic:signal-ledger','growth','Signal ledger','demand-stake-reduction','Does not improve profile fit or increase market supply.','The acquisition stake shrinks.'),
 item('relic:regression-suite','growth','It works on my machine','product-fit','Does not bypass recipe assembly, testing or capacity.','New trial fit rises.'),
 item('consumable:launch-checklist','growth','Read the diff','product-fit','One month only; cannot stack with the fit relic.','One-month shipment fit boost.','month'),
 item('relic:care-calendar','durable','Founder office hours','care-window','Care starts only after you resolve the problem.','Resolved care window lasts longer.'),
 item('relic:shared-infrastructure','durable','One backend, many upsells','addon-service','Saves only addon service overhead, not base service costs.','Addon service bill falls.'),
 item('consumable:customer-firebreak','durable','Customer firebreak','protect-threat','One threatened account only; cannot recover churned customers.','A live problem clears.','instant'),
 item('relic:context-checksum','automation','Leave a paper trail','context-decay','Does not remove existing rot or strain.','Routine context rot grows more slowly.'),
 item('relic:reserved-instances','automation','Committed compute','compute-reduction','Cheaper agents still create coordination load.','Compute bill falls.'),
 item('consumable:context-reset','automation','Fresh context window','reset-context','One function only; agents will accumulate rot again.','Selected context rot clears.','instant'),
];
export const rewardById=(id:string)=>REWARDS.find(r=>r.id===id);
export const hasRewardEffect=(s:Company,effect:RewardEffect)=>s.inventory.relics.some(id=>rewardById(id)?.effect===effect)||(s.inventory.active??[]).some(b=>b.until>s.tick&&rewardById(b.id)?.effect===effect);
export const effectActive=(s:Company,effect:RewardEffect)=>hasRewardEffect(s,effect)||!!REWARD_EFFECTS[effect].legacy&&s.upgrades.includes(REWARD_EFFECTS[effect].legacy);
export function rewardRelevant(s:Company,r:Reward){
 if(r.effect==='faster-collections'||r.effect==='care-window'||r.effect==='protect-threat')return s.accounts.some(a=>a.active);
 if(r.effect==='addon-service')return s.accounts.some(a=>a.active&&(a.addons>0||s.tick-a.born>=P.expansion_maturity_months*P.ticks_per_month));
 if(r.effect==='product-fit')return s.leads.length>0||s.completed.product>0;
 if(r.family==='automation')return FUNCTIONS.some(f=>s.ranks[f].automate>0);
 return true;
}
export type DraftOption=Reward&{text:string;available:boolean;reason:string};
export function draftOption(s:Company,id:string,quarter:number):DraftOption|undefined {
 void quarter;const r=rewardById(id);if(!r)return;
 const active=effectActive(s,r.effect),full=(s.inventory.consumables[id]??0)>=P.rewardMaxCharges;
 const reason=r.kind==='relic'&&s.inventory.relics.includes(id)?'Already in this build':active?'Equivalent effect already active':r.kind==='consumable'&&full?'Charges full':'';
 return {...r,text:REWARD_EFFECTS[r.effect].summary+(r.duration==='month'?' Lasts one active month.':''),available:!reason,reason};
}
export function rewardPool(s:Company){return REWARDS.filter(r=>rewardRelevant(s,r)&&draftOption(s,r.id,s.quarter)?.available);}
export function buildAffinity(s:Company,family:BuildFamily){
 const work:Work[]=family==='bootstrap'?[]:family==='growth'?['demand','product','monetisation']:family==='durable'?['retention','expansion']:['operations'];
 return work.reduce((n,f)=>n+Object.values(s.ranks[f]).reduce((a,b)=>a+b,0),0)+(family==='automation'?FUNCTIONS.reduce((n,f)=>n+s.ranks[f].automate,0):0);
}
export function consumableUse(s:Company,c:Extract<Command,{type:'consume'}>):{available:boolean;reason:string}{
 const r=rewardById(c.id);
 if(!r||r.kind!=='consumable'||!(s.inventory.consumables[c.id]>0))return {available:false,reason:'No charge available'};
 if(!['active','continuation'].includes(s.phase))return {available:false,reason:'Continue the company to use'};
 if(r.duration==='month')return {available:!effectActive(s,r.effect),reason:effectActive(s,r.effect)?'Equivalent effect already active':'Use for one active month'};
 if(r.effect==='protect-threat'){
  const a=s.accounts.find(a=>a.id===c.account&&a.active&&a.threat>s.tick);
  const available=!!a&&(c.problem===undefined||a.problem?.id===c.problem);return {available,reason:available?'Resolve this problem':'Choose a live customer problem'};
 }
 const available=!!c.work&&FUNCTIONS.includes(c.work)&&s.rot[c.work]>0;
 return {available,reason:available?'Clear this context rot':'Choose a function with context rot'};
}
export function validateRewardCatalogue(){
 if(new Set(REWARDS.map(r=>r.id)).size!==REWARDS.length)throw new Error('Duplicate reward ID');
 for(const r of REWARDS)if(!REWARD_EFFECTS[r.effect]||!r.context||!r.downside||!r.cue||!r.locale||r.kind!==(r.duration==='run'?'relic':'consumable'))throw new Error('Invalid reward contract');
 for(const family of Object.keys(BUILD_FAMILIES))if(REWARDS.filter(r=>r.family===family&&r.kind==='relic').length<2||!REWARDS.some(r=>r.family===family&&r.kind==='consumable'))throw new Error('Incomplete build family');
}
