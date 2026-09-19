import type { Company } from './model';
import { metrics } from './engine';
import { rewardById } from './rewards';
// Dollars converted to ledger cents. Later thresholds are presentation candidates only.
export const MILESTONES = [
  { dollars:0, name:'Ramen garage', equipment:'Battered laptop', tile:0 },
  { dollars:10000, name:'First proof', equipment:'A light that works', tile:1 },
  { dollars:50000, name:'Side project no more', equipment:'Proper workbench', tile:2 },
  { dollars:100000, name:'Default ambitious', equipment:'Founder studio', tile:3 },
  { dollars:500000, name:'One person, many processes', equipment:'Compute rack', tile:4 },
  { dollars:1000000, name:'Million-dollar desk', equipment:'Sky studio', tile:5 },
  { dollars:10000000, name:'Small team energy', equipment:'Autonomous studio', tile:5 },
  { dollars:100000000, name:'Category contender', equipment:'Orbital desk', tile:5 },
  { dollars:1000000000, name:'One person unicorn', equipment:'The sky is yours', tile:5 },
] as const;
export function environment(s:Company){
  const m=metrics(s),peak=Math.max(s.peakValuation??0,m.valuation,...s.reports.map(r=>r.score.valuation));
  let index=0;for(let i=1;i<MILESTONES.length;i++)if(peak>=MILESTONES[i].dollars*100)index=i;
  return {index,...MILESTONES[index],next:MILESTONES[index+1]??null,peak,distress:s.phase==='failure'?'failed':s.cash<m.nextBill?'cash':m.stability<.5?'strain':'calm'};
}
export function runSummary(s:Company){
  const m=metrics(s);return {seed:s.seed,activeSeconds:s.tick/10,firstUnicornSeconds:s.wonAt===null?null:s.wonAt/10,phase:s.phase,valuation:m.valuation,arr:m.arr,cash:s.cash,financing:s.vc?'VC':s.debt?'Debt outstanding':s.ownership<10000?'Equity raised':'Self-funded currently',ownership:s.ownership/100,build:s.inventory.relics.map(id=>rewardById(id)?.name??id),cause:s.failure||(s.wonAt!==null?'Reached $1B valuation':'Run in progress'),balance:s.version,content:s.contentVersion};
}
export type FeedbackIntensity='full'|'quiet'|'off';
export const PRESENTATION_KEY='solounicorn-presentation-v1';
export function decodePresentation(raw:string|null):{sound:boolean;intensity:FeedbackIntensity}{
  try{const p=JSON.parse(raw??'{}');return {sound:p.sound===true,intensity:['full','quiet','off'].includes(p.intensity)?p.intensity:'full'};}catch{return {sound:false,intensity:'full'};}
}
