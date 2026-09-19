import type { Company } from './model';
import { P } from './profile';
import { HISTORY_KEY } from './save';

export type FounderHistory={version:2;wins:string[];records:{id:string;seed:number;wonAt:number;relics:string[];financing:'bootstrap'|'debt'|'vc'}[]};
export function decodeFounderHistory(raw:string|null):FounderHistory{
 if(!raw)return {version:2,wins:[],records:[]};
 const input=JSON.parse(raw);
 if(!input||!Array.isArray(input.wins)||input.wins.some((id:unknown)=>typeof id!=='string')||input.version!==undefined&&input.version!==2)throw new Error('Invalid founder history');
 const wins=[...new Set<string>(input.wins)];
 const records=Array.isArray(input.records)?input.records.filter((r:FounderHistory['records'][number])=>r&&wins.includes(r.id)&&Number.isSafeInteger(r.seed)&&Number.isSafeInteger(r.wonAt)&&r.wonAt>0&&Array.isArray(r.relics)&&r.relics.every(id=>typeof id==='string')&&['bootstrap','debt','vc'].includes(r.financing)):[];
 return {version:2,wins,records:records.filter((r:FounderHistory['records'][number],i:number)=>records.findIndex((other:FounderHistory['records'][number])=>other.id===r.id)===i)};
}
export function recordFounderWin(history:FounderHistory,s:Company):FounderHistory{
 if(s.wonAt===null||!Number.isSafeInteger(s.wonAt)||s.wonAt<=0||s.wonAt>s.tick||s.phase==='setup')return history;
 const id=`${s.seed}:${s.wonAt}`;if(history.wins.includes(id))return history;
 return {version:2,wins:[...history.wins,id],records:[...history.records,{id,seed:s.seed,wonAt:s.wonAt,relics:[...s.inventory.relics],financing:s.vc?'vc':s.debt?'debt':'bootstrap'}]};
}
export const inheritedStartingCash=(history:FounderHistory)=>history.wins.length*P.winCashBonus;
// A storage adapter, independent of React or browser timing. Retry is safe after a partial save.
export function syncFounderHistory(storage:{getItem(key:string):string|null;setItem(key:string,value:string):void},s:Company){
 const history=decodeFounderHistory(storage.getItem(HISTORY_KEY)),next=recordFounderWin(history,s);
 if(next!==history)storage.setItem(HISTORY_KEY,JSON.stringify(next));
 return next;
}
