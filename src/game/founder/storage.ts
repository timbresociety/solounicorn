import type { Company } from './model';
import {SAVE_KEY,BACKUP_SAVE_KEY,encodeSave,decodeSave} from './save';
export const PENDING_SAVE_KEY=SAVE_KEY+'-pending';
export type StoragePort=Pick<Storage,'getItem'|'setItem'|'removeItem'>;
// A verified journal precedes promotion. Any interrupted step leaves at least
// one valid checkpoint. Invalid/incompatible bytes are never silently replaced.
export function persistCheckpoint(storage:StoragePort,s:Company){
 const raw=encodeSave(s),prior=storage.getItem(SAVE_KEY);
 if(prior)decodeSave(prior);
 storage.setItem(PENDING_SAVE_KEY,raw);
 if(storage.getItem(PENDING_SAVE_KEY)!==raw)throw new Error('Checkpoint write did not verify.');
 if(prior)storage.setItem(BACKUP_SAVE_KEY,prior);
 storage.setItem(SAVE_KEY,raw);
 if(storage.getItem(SAVE_KEY)!==raw)throw new Error('Checkpoint promotion did not verify.');
 storage.removeItem(PENDING_SAVE_KEY);
}
export function recoverCheckpoint(storage:Pick<Storage,'getItem'>){
 const errors:string[]=[];
 // Pending is the most recent attempted write, including a new company at tick 0.
 for(const key of [PENDING_SAVE_KEY,SAVE_KEY,BACKUP_SAVE_KEY]){
  const raw=storage.getItem(key);if(!raw)continue;
  try{return {company:decodeSave(raw),source:key,invalid:errors};}catch{errors.push(key);}
 }
 if(errors.length)throw new Error('No compatible checkpoint. Export the stored copies before replacing this company.');
 return null;
}
export function exportCheckpoints(storage:Pick<Storage,'getItem'>){return JSON.stringify(Object.fromEntries([SAVE_KEY,BACKUP_SAVE_KEY,PENDING_SAVE_KEY].map(k=>[k,storage.getItem(k)])),null,2);}
