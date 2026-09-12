import type { Company, Lead } from './model';
import { AXES, FUNCTIONS, NAMES, P, UPGRADES, type Axis, type Work } from './profile';

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
export const bankHits=(s:Company)=>Math.max(1,P.bankHits-Math.floor(s.ranks.retention.craft/2));
export function opsOutcomes(s:Company){
 const points=P.craft_batch_by_rank[s.ranks.operations.craft]*(s.upgrades.includes('maintenance')?1.5:1);
 return [
  {target:'strain' as const,label:'Untangle handoffs',amount:points*P.strain_repair_load_per_maintenance_point},
  ...FUNCTIONS.map(target=>({target,label:`Refresh ${NAMES[target]}`,amount:points*P.rot_recovery_per_maintenance_point})),
 ];
}

// Once the strategy pool thins, ordinary capability ranks keep quarters useful.
// These use the existing rank economics, not a second upgrade multiplier system.
export type DraftOption={id:string;name:string;text:string;cost:number;available:boolean;work?:Work;axis?:Axis;rank?:number};
export function draftOption(s:Company,id:string,quarter:number):DraftOption|undefined {
 const strategy=UPGRADES.find(u=>u.id===id);
 if(strategy)return {...strategy,cost:P.upgradeDraftBase*quarter,available:!s.upgrades.includes(id)};
 const [kind,work,axis,rawRank]=id.split(':');const rank=Number(rawRank);
 if(kind!=='capability'||!FUNCTIONS.includes(work as Work)||!AXES.includes(axis as Axis)||!Number.isInteger(rank)||rank<1||rank>4)return;
 const f=work as Work,a=axis as Axis;
 const effect=a==='craft'?`Up to ${P.craft_batch_by_rank[rank]} outputs per attempt${f==='retention'?`; ${Math.max(1,P.bankHits-Math.floor(rank/2))} hits per bank`:''}.`:a==='scale'?`${P.units_by_scale_rank[rank]} work lanes. Extra lanes add upkeep and coordination load.`:a==='automate'?`${P.auto_speed_by_rank[rank]}× manual speed per lane. Compute upkeep and context rot apply.`:'Wider output swings with slightly negative long-run expected output. Exposure starts enabled.';
 return {id,name:`${NAMES[f]}: ${a} ${rank}`,text:`${effect} Installs in 5 seconds.`,cost:Math.round(P.upgrade_base_cents*P.upgrade_cost_ratio**(rank-1)),available:s.ranks[f][a]+1===rank,work:f,axis:a,rank};
}
export function quarterChoices(s:Company):string[]{
 const strategies=UPGRADES.filter(u=>!s.upgrades.includes(u.id)).map(u=>u.id as string).sort((a,b)=>toyRoll(s.seed,'draft',s.quarter,a)-toyRoll(s.seed,'draft',s.quarter,b));
 const ranks=FUNCTIONS.flatMap(f=>AXES.filter(a=>s.ranks[f][a]<4).map(a=>`capability:${f}:${a}:${s.ranks[f][a]+1}`)).sort((a,b)=>toyRoll(s.seed,'capability-draft',s.quarter,a)-toyRoll(s.seed,'capability-draft',s.quarter,b));
 return [...strategies.slice(0,3),...ranks.slice(0,Math.max(0,3-strategies.length))];
}
