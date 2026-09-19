import {expect,it} from 'vitest';
import {createCompany,command,advance,replayCompany} from '../../src/game/founder/engine';
import {environment,MILESTONES,runSummary,decodePresentation} from '../../src/game/founder/presentation';
import {encodeSave,decodeSave} from '../../src/game/founder/save';
it('retains earned environment when current valuation falls and after reload',()=>{
 for(const milestone of MILESTONES){const s=createCompany(1300);s.peakValuation=milestone.dollars*100;expect(environment(decodeSave(encodeSave(s))).name).toBe(milestone.name);}
});
it('presentation preferences never enter economic saves or replay',()=>{
 const s=advance(command(createCompany(1301),{type:'start'}),50);
 expect(decodePresentation('{broken')).toEqual({sound:false,intensity:'full'});
 expect(decodePresentation('{"sound":true,"intensity":"off"}').intensity).toBe('off');
 expect(replayCompany(s)).toEqual(s);expect(runSummary(s).activeSeconds).toBe(5);expect(runSummary(s).firstUnicornSeconds).toBeNull();
});
