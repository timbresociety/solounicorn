import { P } from './profile';
import { metrics, offeredOperationsTicket, validateCompany } from './engine';
import { FOUNDER_CONTENT_VERSION, FOUNDER_CONTRACT_VERSION, FOUNDER_SAVE_VERSION } from './contracts';
import type { Command, Company } from './model';

export const SAVE_KEY='solounicorn-founder-v1';
export const BACKUP_SAVE_KEY='solounicorn-founder-v1-last-known-good';
export const HISTORY_KEY='solounicorn-founder-history-v1';

type SaveEnvelopeV1={version:1;data:string;checksum:string};
type SaveEnvelopeV2={version:2;contractVersion:string;contentVersion:string;balanceVersion:string;data:string;checksum:string};
type LegacyCompany=Omit<Company,'contractVersion'|'contentVersion'|'actionCursor'|'actionResults'|'phase'|'resumePhase'|'pendingDraftQuarter'|'inventory'|'jobs'|'actions'> & {
  actions:Array<{tick:number;command:Command}>;status:'setup'|'running'|'failed'|'won';paused:boolean;
};

export function checksum(text:string){let h=2166136261;for(let i=0;i<text.length;i++)h=Math.imul(h^text.charCodeAt(i),16777619);return(h>>>0).toString(16);}
function replayBaseline(s:Company){const copy=structuredClone(s);delete copy.replayBase;copy.actions=[];copy.actionResults=[];copy.actionCursor=0;return JSON.stringify(copy);}
function migrateLegacyCompany(input:LegacyCompany):Company {
  const s=input as unknown as Company & {status?:LegacyCompany['status'];paused?:boolean};
  if(s.version==='founder-candidate.2'){s.version='founder-candidate.3';s.ops=offeredOperationsTicket(0,s.quarter,0);s.operationsNet=0;s.bankDamage={};s.recipe={id:0,slots:[]};s.package={id:0,merged:[]};}
  if(s.version==='founder-candidate.3'){s.version='founder-candidate.4';s.ops={...s.ops,active:false,inspected:[],claimed:[],net:0};}
  if(s.version==='founder-candidate.4')s.version='founder-candidate.5';
  if(s.version==='founder-candidate.5')s.version='founder-candidate.6';
  if(s.version==='founder-candidate.6')s.version='founder-candidate.7';
  if(s.version==='founder-candidate.7')s.version='founder-candidate.8';
  if(s.version==='founder-candidate.8'){
    s.version='founder-candidate.9';
    s.ops=offeredOperationsTicket(s.ops?.id??0,s.quarter,0);
    s.operationsReturns={manual:{tickets:0,patchValue:0,prices:0,upkeep:0,net:0},automated:{tickets:0,patchValue:0,prices:0,upkeep:0,net:0}};
    s.incidents=[];
  }
  const oldActions=[...(s.migratedActions??[]),...(s.actions??[])];
  s.contractVersion=FOUNDER_CONTRACT_VERSION;s.contentVersion=FOUNDER_CONTENT_VERSION;
  s.phase=s.status==='setup'?'setup':s.status==='failed'?'failure':s.status==='won'?'unicorn':s.paused?'paused':'active';s.resumePhase='active';
  s.actionCursor=0;s.actions=[];s.actionResults=[];s.pendingDraftQuarter=s.reports.find(r=>!r.chosen)?.quarter??null;
  if(s.pendingDraftQuarter!==null)s.phase='quarter-draft';
  s.inventory={relics:[],consumables:{},active:[]};s.jobs={reservations:[],closed:{}};
  if(s.recipe.id)s.jobs.reservations.push({jobId:`lead:${s.recipe.id}`,owner:'founder',actionId:'migration',reservedAt:s.tick});
  if(s.package.id)s.jobs.reservations.push({jobId:`expansion:${s.package.id}`,owner:'founder',actionId:'migration',reservedAt:s.tick});
  if(s.ops.active)s.jobs.reservations.push({jobId:`operations:${s.ops.id}`,owner:'founder',actionId:'migration',reservedAt:s.tick});
  // The candidate.6 piggy-bank counter was presentation progress, not a
  // customer outcome. Preserve it as finite work on the corresponding live
  // customer problem when one exists; otherwise discard only that obsolete
  // gesture state. No ARR, health, or churn ledger is changed by migration.
  for(const id of Object.keys(s.bankDamage)){
    const account=s.accounts.find(a=>a.id===Number(id)&&a.active&&a.threat);
    if(account){const content={kind:'trust' as const,label:'Legacy customer follow-up',detail:'A saved Retention gesture was migrated into a real customer response.'};account.problem={id:++s.serial,...content,openedAt:s.tick,deadline:account.threat,severity:2,workRequired:8,workCompleted:Math.min(7,(s.bankDamage[Number(id)]??0)*2),exposedArr:account.price*account.count*12};}
  }
  s.bankDamage={};
  if(s.recipe.tested&&!s.recipe.verification)s.recipe.verification='verified';
  else if(s.recipe.id&&!s.recipe.verification)s.recipe.verification='incomplete';
  s.migratedActions=oldActions;delete s.status;delete s.paused;delete s.replayBase;s.replayBase=replayBaseline(s);return s;
}
export function encodeSave(s:Company){validateCompany(s);const data=JSON.stringify(s);const envelope:SaveEnvelopeV2={version:FOUNDER_SAVE_VERSION,contractVersion:s.contractVersion,contentVersion:s.contentVersion,balanceVersion:s.version,data,checksum:checksum(data)};return JSON.stringify(envelope);}
export function decodeSave(raw:string):Company{
  const envelope=JSON.parse(raw) as SaveEnvelopeV1|SaveEnvelopeV2;
  if((envelope.version!==1&&envelope.version!==FOUNDER_SAVE_VERSION)||typeof envelope.data!=='string'||checksum(envelope.data)!==envelope.checksum)throw new Error('Checkpoint checksum failed.');
  let s=JSON.parse(envelope.data) as Company|LegacyCompany;if(envelope.version===1||!('contractVersion' in s))s=migrateLegacyCompany(s as LegacyCompany);
  if(envelope.version===FOUNDER_SAVE_VERSION&&(envelope.contractVersion!==FOUNDER_CONTRACT_VERSION||envelope.contentVersion!==(s as Company).contentVersion||envelope.balanceVersion!==(s as Company).version))throw new Error('Checkpoint contract, content, or balance version is incompatible.');
  const company=s as Company;let migratedFinance=false;
  // S06 changes how rank-zero work and Luck resolve. Preserve an existing
  // candidate.5 company as a new replay baseline instead of replaying its old
  // action log through new rules.
  if(company.version==='founder-candidate.5'||company.version==='founder-candidate.6'||company.version==='founder-candidate.7'||company.version==='founder-candidate.8'){
    company.version='founder-candidate.9';
    // Rebase candidate.6's retired piggy-bank gesture into persisted finite
    // problem work. Existing financial/customer state stays authoritative.
    for(const [id,damage] of Object.entries(company.bankDamage??{})){
      const account=company.accounts.find(a=>a.id===Number(id)&&a.active&&a.threat);
      if(account&&!account.problem)account.problem={id:++company.serial,kind:'trust',label:'Legacy customer follow-up',detail:'Migrated from saved Retention progress.',openedAt:company.tick,deadline:account.threat,severity:2,workRequired:8,workCompleted:Math.min(7,damage*2),exposedArr:account.price*account.count*12};
    }
    company.bankDamage={};
    company.ops=offeredOperationsTicket(company.ops?.id??0,company.quarter,0);
    company.operationsReturns={manual:{tickets:0,patchValue:0,prices:0,upkeep:0,net:0},automated:{tickets:0,patchValue:0,prices:0,upkeep:0,net:0}};
    company.incidents=[];
    company.jobs.reservations=company.jobs.reservations.filter(r=>!r.jobId.startsWith('operations:'));
    for(const account of company.accounts)if(account.active&&account.threat&&!account.problem)account.problem={id:++company.serial,kind:'trust',label:'Legacy customer follow-up',detail:'Migrated from a saved churn threat.',openedAt:company.tick,deadline:account.threat,severity:2,workRequired:8,workCompleted:0,exposedArr:account.price*account.count*12};
    company.migratedActions=[...(company.migratedActions??[]),...company.actions];
    company.actions=[];company.actionResults=[];company.actionCursor=0;
    delete company.replayBase;company.replayBase=replayBaseline(company);
  }
  if(company.version==='founder-candidate.9'){
    company.version='founder-candidate.10';
    // Scheduler semantics changed. Preserve paid tickets, partial gestures and
    // finances; archive old actions instead of replaying them through new rules.
    for(const f of Object.keys(company.credits) as Array<keyof Company['credits']>)company.credits[f]=0;
    for(const lead of company.leads)if(company.jobs.closed[`lead:${lead.id}`]?.reason==='completed')delete company.jobs.closed[`lead:${lead.id}`];
    for(const account of company.accounts)if(account.problem&&account.active)delete company.jobs.closed[`retention:${account.id}`];
    company.migratedActions=[...(company.migratedActions??[]),...company.actions];
    company.actions=[];company.actionResults=[];company.actionCursor=0;
    delete company.replayBase;company.replayBase=replayBaseline(company);
  }
  if(company.version==='founder-candidate.10'){
    company.version='founder-candidate.11';migratedFinance=true;
    // Preserve obligations already accepted under the old profile. New loans
    // and new mandates use S11 rules; existing commitments remain disclosed.
    if(company.debt){const d=company.debt;Object.assign(d,{id:++company.serial,mode:'amortising',aprBps:P.default_loan_apr_bps,acceptedAt:Math.max(0,d.due-P.ticks_per_month),lastPaymentAt:d.due-P.ticks_per_month,maturity:d.due+(d.months-1)*P.ticks_per_month});}
    if(company.vc){const v=company.vc;Object.assign(v,{acceptedAt:Math.max(0,v.due-P.months_per_quarter*P.ticks_per_month),startsAt:v.due-P.months_per_quarter*P.ticks_per_month,baselineLocked:true,rule:'legacy-target',growthBps:P.default_vc_growth_bps});}
    company.migratedActions=[...(company.migratedActions??[]),...company.actions];
    company.actions=[];company.actionResults=[];company.actionCursor=0;
    delete company.replayBase;company.replayBase=replayBaseline(company);
  }
  if(company.version==='founder-candidate.11'){
    if(!['founder-content.candidate.5',FOUNDER_CONTENT_VERSION].includes(company.contentVersion))throw new Error('Unsupported reward content version.');
    company.version='founder-candidate.12';company.contentVersion=FOUNDER_CONTENT_VERSION;
    company.inventory.active=[];
    company.migratedActions=[...(company.migratedActions??[]),...company.actions];
    company.actions=[];company.actionResults=[];company.actionCursor=0;migratedFinance=true;
    // Preserve existing offers, owned relics, charges and accepted financing.
  }
  if(company.version==='founder-candidate.12'){company.version=P.version;company.migratedActions=[...(company.migratedActions??[]),...company.actions];company.actions=[];company.actionResults=[];company.actionCursor=0;migratedFinance=true;}
  if(!Number.isSafeInteger(company.openingCash))company.openingCash=company.cash;
  for(const report of company.reports){
    if(!Number.isSafeInteger(report.openingCash))report.openingCash=report.cash;
    if(!report.score){const current=metrics(company);report.score={eligibleArr:report.closing,multiple:current.multiple,stability:current.stability,valuation:current.valuation};}
  }
  if(company.recipe.tested&&!company.recipe.verification)company.recipe.verification='verified';
  else if(company.recipe.id&&!company.recipe.verification)company.recipe.verification='incomplete';
  if(migratedFinance){delete company.replayBase;company.replayBase=replayBaseline(company);}
  validateCompany(company);return company;
}
export function decodeLastKnownGood(primary:string|null,backup:string|null):{company:Company;source:'primary'|'backup'}{
  if(primary){try{return {company:decodeSave(primary),source:'primary'};}catch(error){if(!backup)throw error;}}
  if(backup)return {company:decodeSave(backup),source:'backup'};throw new Error('No checkpoint is available.');
}
export function verifiedBackup(raw:string|null){if(!raw)return null;try{decodeSave(raw);return raw;}catch{return null;}}
