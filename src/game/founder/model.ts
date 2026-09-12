import type { Axis, Work } from './profile';
export type Ranks = Record<Axis, number>;
export type Lead = {id:number; segment:number; count:number; expires:number; fit:number};
export type Account = {id:number; origin:number; segment:number; count:number; price:number; basePrice:number; fit:number; health:number; defects:number; born:number; caredUntil:number; addons:number; threat:number; earned:number; remainder:number; active:boolean};
export type Invoice = {id:number; account:number; cents:number; due:number; attempts:number};
export type Report = {quarter:number; opening:number; closing:number; collected:number; expenses:number; newArr:number; expansion:number; churn:number; cash:number; choices:string[]; chosen?:string};
export type Company = {
  version:string; replayBase?:string; migratedActions?:{tick:number;command:Command}[]; seed:number; tick:number; serial:number; actions:{tick:number;command:Command}[]; status:'setup'|'running'|'failed'|'won'; paused:boolean; focus:Work|'finance'|'skills';
  cash:number; quarter:number; openingArr:number; collected:number; expenses:number; newArr:number; expansion:number; churn:number;
  ranks:Record<Work,Ranks>; rot:Record<Work,number>; credits:Record<Work,number>; attempts:Record<Work,number>; lastManual:Record<Work,number>; deployed:Record<Work,number>; enabled:Record<Work,boolean>; risky:Record<Work,boolean>; completed:Record<Work,number>;
  leads:Lead[]; trials:Lead[]; accounts:Account[]; invoices:Invoice[]; market:number[]; signal:number; channel:number;
  recipe:{id:number; slots:Array<number|null>; tested?:boolean}; package:{id:number; merged:number[]; board?:Array<{family:number;tier:number}|null>; supplied?:number}; evidence:number[];
  ops:{id:number;quarter:number;used:number;active:boolean;inspected:number[];claimed:number[];net:number}; operationsNet:number; bankDamage:Record<number,number>;
  strain:number; expenseRemainder:number; expenseAccrued:number; lifetimeEarned:number; lifetimeCollected:number; lifetimeCosts:number; badDebt:number;
  debt:{principal:number; months:number; due:number; remainder:number}|null;
  vc:{baseline:number; target:number; due:number}|null; ownership:number;
  reports:Report[]; upgrades:string[]; history:{tick:number;arr:number}[];
  log:{id:number;tick:number;text:string;kind:'good'|'bad'|'info'}[]; failure:string; wonAt:number|null; inheritedWins:number;
};
export type Command =
 | {type:'start'} | {type:'pause'} | {type:'focus';work:Company['focus']}
 | {type:'channel';channel:number} | {type:'demand';pursue:boolean;signal:number}
 | {type:'part';job:number;slot:number;part:number} | {type:'ship';job:number;early:boolean}
 | {type:'test-build';job:number}
 | {type:'price';job:number;plan:'fair'|'premium';timing?:number} | {type:'save';account:number}
 | {type:'hit-bank';account:number;expected:number} | {type:'supply';account:number;family:number}
 | {type:'merge';account:number;pair?:number;from?:number;to?:number;expectedTier?:number} | {type:'expand';account:number}
 | {type:'ops-deal'} | {type:'ops-inspect';card:number;cell:number} | {type:'ops-claim';card:number;cell:number} | {type:'ops-discard';card:number}
 | {type:'reveal';cell:number} | {type:'repair';target:'rot'|'strain'}
 | {type:'buy';work:Work;axis:Axis;rank:number} | {type:'automation';work:Work} | {type:'risk';work:Work}
 | {type:'draft-skip';quarter:number} | {type:'draft';quarter:number;id:string} | {type:'borrow'} | {type:'raise'} | {type:'continue'};
