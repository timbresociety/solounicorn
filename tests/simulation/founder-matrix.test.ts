import {it} from 'vitest';
import {existsSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {P} from '../../src/game/founder/profile';
import {play,policies} from './founder-policy-matrix';
it.runIf(process.env.RUN_FOUNDER_MATRIX==='1')('runs a resumable declared founder policy matrix without synthetic money or ranks',async()=>{
 const seeds=Number(process.env.MATRIX_SEEDS??30),offset=Number(process.env.MATRIX_OFFSET??0),only=process.env.MATRIX_POLICY;
 const path='artifacts/qa/founder-revamp/S15/matrix';mkdirSync(path,{recursive:true});
 for(const [i,policy] of policies.entries()){
  if(only!==undefined&&i!==Number(only))continue;
  for(let n=offset;n<offset+seeds;n++){
   const seed=15000+n,file=`${path}/${i}-${seed}.json`;
   if(existsSync(file)){const prior=JSON.parse(readFileSync(file,'utf8'));if(prior.policyVersion===(policy.capital==='bootstrap'?2:1)&&prior.profileSignature===JSON.stringify(P)&&JSON.stringify(prior.policy)===JSON.stringify(policy))continue;}
   const start=performance.now(),result=await play(seed,policy);writeFileSync(file,JSON.stringify({...result,version:P.version,policyVersion:policy.capital==='bootstrap'?2:1,profileSignature:JSON.stringify(P),elapsedMs:performance.now()-start},null,2));
   console.log(i,seed,result.outcome,result.activeSeconds,result.valuation/100,Math.round(performance.now()-start));
  }
 }
},7200000);
