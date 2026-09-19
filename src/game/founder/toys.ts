import type { Company, Lead, OperationsPatch, OperationsPatchEffect } from './model';
import { FUNCTIONS, P } from './profile';

export function toyRoll(seed:number,...keys:(string|number)[]){let h=seed>>>0;for(const c of keys.join(':')){h=Math.imul(h^c.charCodeAt(0),16777619);h^=h>>>13;}h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return ((h^(h>>>16))>>>0)/4294967296;}
export const COMPONENTS=[
 {name:'Capture',detail:'Bring scattered inputs into one inbox',shape:'capture'},
 {name:'Workflow',detail:'Move work without another status meeting',shape:'workflow'},
 {name:'Permissions',detail:'The right people, the right buttons',shape:'control'},
 {name:'Insights',detail:'Turn activity into a useful answer',shape:'insight'},
 {name:'Notifications',detail:'Nudge a human when something matters',shape:'notify'},
 {name:'Archive',detail:'Remember what happened and why',shape:'archive'},
];
export const BRIEFS=[
 {id:'creator-inbox',name:'The tab intervention',quote:'Catch my ideas, turn them into a checklist, and remind me to finish something.',steps:['Collect the ideas','Make a repeatable process','Nudge the creator'],parts:[0,1,4]},
 {id:'creator-report',name:'Proof of actual work',quote:'Give me a weekly report from my activity. Save a copy so I can stop screenshotting everything.',steps:['Bring in activity','Find the useful pattern','Keep the report'],parts:[0,3,5]},
 {id:'creator-launch',name:'Launch without the spreadsheet',quote:'I need a publishing checklist, launch reminders, and a record of what shipped.',steps:['Sequence the launch','Send a timely nudge','Save the release'],parts:[1,4,5]},
 {id:'team-handoff',name:'Whose turn is it, anyway?',quote:'Route work between teammates, limit who can approve, and tell the next person it is their turn.',steps:['Route the handoff','Gate the approval','Notify the next owner'],parts:[1,2,4]},
 {id:'team-feedback',name:'Feedback with a forwarding address',quote:'Collect customer feedback, spot patterns, then turn the findings into assigned work.',steps:['Collect feedback','Group the patterns','Route the follow-up'],parts:[0,3,1]},
 {id:'team-decisions',name:'The meeting could be a record',quote:'Control who signs off, preserve the decision, and notify everyone who has to live with it.',steps:['Choose the approvers','Keep the decision','Share the outcome'],parts:[2,5,4]},
 {id:'enterprise-audit',name:'An audit without a war room',quote:'Capture each request, restrict access, keep the evidence, and show us what went wrong.',steps:['Capture the request','Restrict access','Preserve evidence','Surface exceptions'],parts:[0,2,5,3]},
 {id:'enterprise-exceptions',name:'Exceptions, minus the heroics',quote:'Route exceptions to the right owner, protect approvals, alert the on-call, and retain the trail.',steps:['Route exceptions','Protect approvals','Alert the owner','Keep the trail'],parts:[1,2,4,5]},
 {id:'enterprise-governance',name:'Governance that people use',quote:'Bring data together, let the right people inspect it, show risks, and keep every decision.',steps:['Collect the sources','Limit access','Expose the risks','Archive decisions'],parts:[0,2,3,5]},
];
export const productBrief=(s:Company,l:Lead)=>BRIEFS[l.segment*3+Math.floor(toyRoll(s.seed,'brief',l.id)*3)];
export type MergeTile={family:number;tier:number};
export const initialBoard=():Array<MergeTile|null>=>Array.from({length:16},(_,i)=>i<8?{family:i%2,tier:1}:null);
export const mergeOrder=(addons:number)=>[{family:0,tier:3+addons},{family:1,tier:3+addons}];
export const mergeNames=[['Event','Report','Intelligence suite','Decision platform'],['Step','Workflow','Automation suite','Orchestration platform']];
export const expansionBoardSlots=(s:Company)=>Math.min(16,8+s.ranks.expansion.scale*2);
export const packageMass=(board:Array<MergeTile|null>,family:number)=>board.reduce((total,tile)=>total+(tile?.family===family?2**(tile.tier-1):0),0);
export const packageNeeds=(addons:number)=>mergeOrder(addons).map(target=>({...target,mass:2**(target.tier-1)}));
export const packageComplete=(s:Company,account:{addons:number},board:Array<MergeTile|null>)=>mergeOrder(account.addons).every(target=>board.some(tile=>tile?.family===target.family&&tile.tier===target.tier));
export const bankHits=(s:Company)=>Math.max(1,P.bankHits-Math.floor(s.ranks.retention.craft/2));
export const RETENTION_PROBLEMS=[
 {kind:'handoff' as const,label:'Approval handoff stalled',detail:'The next owner cannot clear a real customer approval.'},
 {kind:'reliability' as const,label:'Workflow failed mid-run',detail:'A customer workflow stopped before its promised outcome.'},
 {kind:'adoption' as const,label:'Team stopped using the loop',detail:'The account needs a concrete recovery before habits harden.'},
 {kind:'trust' as const,label:'Trust is eroding',detail:'A visible reliability promise needs an accountable response.'},
] as const;
export function retentionProblemContent(seed:number,accountId:number){return RETENTION_PROBLEMS[Math.floor(toyRoll(seed,'retention-problem',accountId)*RETENTION_PROBLEMS.length)]!;}
export const OPERATIONS_TICKET_STREAM='operations-ticket-v1';
export const operationsTicketPatchCount=(scaleRank:number)=>P.operationsTicketBasePatches+Math.max(0,Math.min(4,scaleRank))*P.operationsTicketPatchesPerScale;
export const operationsTicketSupply=(scaleRank:number)=>P.operationsTicketsPerQuarter+Math.max(0,Math.min(4,scaleRank))*P.operationsTicketsPerScale;
export const operationsTicketPrice=(scaleRank:number)=>P.operationsTicketBasePriceCents+operationsTicketPatchCount(scaleRank)*P.operationsTicketPricePerPatchCents;
export function operationsAutomationUpkeepPerTicket(automateRank:number,computeFactor=1){
 if(automateRank<=0)return 0;
 const upkeep=P.auto_upkeep_cents_per_unit_month[automateRank]??0,speed=P.auto_speed_by_rank[automateRank]??0;
 return Math.round(upkeep*computeFactor*(P.functions.operations.manual_seconds*10)/(Math.max(.001,speed)*P.ticks_per_month));
}
const OPS_LABELS={
 cash:{positive:'Vendor service credit',negative:'Emergency vendor invoice'},
 strain:{positive:'Untangle the handoff',negative:'Escalation loop'},
 rot:{positive:'Refresh the runbook',negative:'Stale configuration copied'},
 incident:{positive:'Close a live incident',negative:'Production incident escaped'},
} as const;
function ticketValue(seed:number,ticketId:number,patchId:number,luckRank:number){
 const values=P.operationsTicketBaseValuesCents,index=Math.floor(toyRoll(seed,OPERATIONS_TICKET_STREAM,ticketId,patchId,'base')*values.length);
 const shared=toyRoll(seed,OPERATIONS_TICKET_STREAM,ticketId,'shared')<.5?-1:1;
 const local=toyRoll(seed,OPERATIONS_TICKET_STREAM,ticketId,patchId,'local')<.5?-1:1;
 return Math.round(values[index]+luckRank*P.operationsTicketLuckSpreadCents*(Math.sqrt(.4)*shared+Math.sqrt(.6)*local));
}
export function operationsTicketPatches(seed:number,ticketId:number,scaleRank:number,luckRank:number,craftRank:number):OperationsPatch[]{
 const count=operationsTicketPatchCount(scaleRank),craftMultiplier=1+.25*Math.max(0,Math.min(4,craftRank));
 return Array.from({length:count},(_,id)=>{
  const valueCents=ticketValue(seed,ticketId,id,luckRank),sentiment=valueCents>=0?'positive':'negative',magnitude=Math.max(100,Math.abs(valueCents));
  const kinds=['cash','strain','rot','incident'] as const,kind=kinds[id%kinds.length];
  const target=FUNCTIONS[Math.floor(toyRoll(seed,OPERATIONS_TICKET_STREAM,ticketId,id,'target')*FUNCTIONS.length)];
  const positive=sentiment==='positive';
  let effect:OperationsPatchEffect;
  if(kind==='cash')effect={kind:'cash',cents:valueCents};
  else if(kind==='strain')effect={kind:'strain',direction:positive?'repair':'add',amount:Number((magnitude/1000*(positive?craftMultiplier:1)).toFixed(4))};
  else if(kind==='rot')effect={kind:'rot',direction:positive?'repair':'add',target,amount:Number((magnitude/100000*(positive?craftMultiplier:1)).toFixed(6))};
  else effect={kind:'incident',mode:positive?'resolve':'open',target,severity:(magnitude>=1100?3:magnitude>=600?2:1),monthlyCostCents:P.operationsIncidentBaseMonthlyCostCents*Math.max(1,Math.round(magnitude/500))};
  return {id,label:OPS_LABELS[kind][sentiment],sentiment,valueCents,effect};
 });
}
export const opsOutcomes=(s:Company)=>s.ops.patches;
export type OperationsDistributionMeasurement={samples:number;scaleRank:number;luckRank:number;automateRank:number;manual:{meanAfterPrice:number;lossRate:number};automated:{meanAfterPrice:number;meanAfterPriceAndUpkeep:number;lossRate:number;variance:number;minimum:number;maximum:number};ticket:{price:number;patches:number;supplyPerQuarter:number;upkeepPerTicket:number}};
export function measureOperationsTickets(samples:number,scaleRank:number,luckRank:number,automateRank:number,discountCompute=false):OperationsDistributionMeasurement{
 const price=operationsTicketPrice(scaleRank),upkeep=operationsAutomationUpkeepPerTicket(automateRank,discountCompute?P.rewardComputeFactor:1);let manual=0,manualLoss=0,auto=0,autoLoss=0,sumSq=0,minimum=Infinity,maximum=-Infinity;
 for(let seed=1;seed<=samples;seed++){
  const patches=operationsTicketPatches(seed,1,scaleRank,luckRank,0),manualNet=patches.reduce((n,p)=>n+Math.max(0,p.valueCents),0)-price,autoNet=patches.reduce((n,p)=>n+p.valueCents,0)-price;
  manual+=manualNet;if(manualNet<0)manualLoss++;auto+=autoNet;if(autoNet-upkeep<0)autoLoss++;sumSq+=autoNet*autoNet;minimum=Math.min(minimum,autoNet-upkeep);maximum=Math.max(maximum,autoNet-upkeep);
 }
 const autoMean=auto/samples;
 return {samples,scaleRank,luckRank,automateRank,manual:{meanAfterPrice:manual/samples,lossRate:manualLoss/samples},automated:{meanAfterPrice:autoMean,meanAfterPriceAndUpkeep:autoMean-upkeep,lossRate:autoLoss/samples,variance:sumSq/samples-autoMean*autoMean,minimum,maximum},ticket:{price,patches:operationsTicketPatchCount(scaleRank),supplyPerQuarter:operationsTicketSupply(scaleRank),upkeepPerTicket:upkeep}};
}

// S12 owns the authored catalogue; preserve imports used by older room adapters.
export { draftOption } from './rewards';
import { rewardPool, buildAffinity } from './rewards';
export function quarterChoices(s:Company):string[]{
 const pool=rewardPool(s).sort((a,b)=>(toyRoll(s.seed,'quarter-reward',s.quarter,a.id)-Math.min(1,buildAffinity(s,a.family)/100))-(toyRoll(s.seed,'quarter-reward',s.quarter,b.id)-Math.min(1,buildAffinity(s,b.family)/100)));
 const chosen:typeof pool=[];
 for(const option of pool)if(!chosen.some(r=>r.family===option.family||r.effect===option.effect)&&chosen.length<P.rewardDraftSize)chosen.push(option);
 for(const option of pool)if(!chosen.some(r=>r.effect===option.effect)&&chosen.length<P.rewardDraftSize)chosen.push(option);
 return chosen.map(r=>r.id);
}
