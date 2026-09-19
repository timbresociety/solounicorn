import { useState } from 'react';
import type { Company } from '../../game/founder/model';
import { environment, runSummary } from '../../game/founder/presentation';
export function Milestone({s}:{s:Company}){
 const e=environment(s);return <div className={`f-milestone ${e.distress}`} role="status"><b key={e.index}>{e.name}</b><span>{e.equipment}</span><small>{e.distress==='cash'?'Next bill needs a cash reserve':e.distress==='strain'?'Company under strain':e.distress==='failed'?'Company stopped':e.next?`Next room · $${e.next.dollars.toLocaleString()}`:'$1B reached'}</small></div>;
}
export function RunSummary({s}:{s:Company}){
 const summary=runSummary(s),[copied,setCopied]=useState('');
 const text=JSON.stringify(summary,null,2);
 return <details className="f-run-summary"><summary>Run receipt · seed {s.seed}</summary><dl><div><dt>Build</dt><dd>{summary.build.join(' + ')||'No relics'}</dd></div><div><dt>Capital</dt><dd>{summary.financing} · {summary.ownership}% owned</dd></div><div><dt>Result</dt><dd>{summary.cause}</dd></div><div><dt>Active time</dt><dd>{Math.floor(summary.activeSeconds/60)}m {Math.floor(summary.activeSeconds%60)}s</dd></div></dl><button onClick={()=>{if(!navigator.clipboard){setCopied('Copy unavailable. Select the receipt below.');return;}void navigator.clipboard.writeText(text).then(()=>setCopied('Copied locally'),()=>setCopied('Copy unavailable. Select the receipt below.'));}}>Copy run receipt</button><span role="status">{copied}</span><pre tabIndex={0}>{text}</pre></details>;
}
