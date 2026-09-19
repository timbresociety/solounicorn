import {expect,it} from 'vitest';
import {play,policies} from './founder-policy-matrix';
import {advance,command,createCompany,metrics,replayCompany,validateCompany} from '../../src/game/founder/engine';
import {decodeSave,encodeSave} from '../../src/game/founder/save';
import {recordFounderWin} from '../../src/game/founder/history';
import type {Company} from '../../src/game/founder/model';
import {writeFileSync} from 'node:fs';
it('earns a unicorn then reloads, continues and starts a clean company with one history award',async()=>{
 let earned:Company|undefined;const result=await play(15000,policies[4],27000,s=>{earned=s;});
 expect(result.outcome).toBe('unicorn');const winner=earned!;const raw=encodeSave(winner);writeFileSync('artifacts/qa/founder-revamp/S15/earned-unicorn.json',raw);
 const loaded=decodeSave(raw);expect(metrics(loaded).valuation).toBeGreaterThanOrEqual(100_000_000_000);
 let continued=command(loaded,{type:'continue'});
 if(continued.phase==='quarter-draft')continued=command(continued,{type:'draft-skip',quarter:continued.pendingDraftQuarter!});
 if(continued.phase==='paused')continued=command(continued,{type:'continue'});
 const before=encodeSave(continued),times:number[]=[];
 for(let i=0;i<40;i++){const start=performance.now();advance(continued,1);times.push(performance.now()-start);}
 expect(encodeSave(continued)).toBe(before);continued=advance(continued,20);validateCompany(continued);expect(continued.wonAt).toBe(winner.wonAt);
 const history=recordFounderWin(recordFounderWin({version:2,wins:[],records:[]},winner),continued);expect(history.wins).toHaveLength(1);
 const fresh=createCompany(15001,history.wins.length);expect(fresh.accounts).toHaveLength(0);expect(fresh.inventory.relics).toHaveLength(0);expect(fresh.wonAt).toBeNull();expect(fresh.cash).toBe(createCompany(15001).cash+15000);
 const replay=replayCompany(winner);expect(replay.cash).toBe(winner.cash);expect(replay.wonAt).toBe(winner.wonAt);expect(replay.accounts).toEqual(winner.accounts);
 times.sort((a,b)=>a-b);writeFileSync('artifacts/qa/founder-revamp/S14/earned-late-run-performance.json',JSON.stringify({runtime:process.version,platform:process.platform,arch:process.arch,seed:winner.seed,tick:winner.tick,actions:winner.actions.length,accounts:winner.accounts.length,activeAccounts:winner.accounts.filter(a=>a.active).length,invoiceCount:winner.invoices.length,closedJobs:Object.keys(winner.jobs.closed).length,saveBytes:raw.length,samples:40,advanceOneTickMs:{p50:times[20],p95:times[37],p99:times[39]},browserFrameTime:'not measured',renderingIncluded:false},null,2));
},180000);
