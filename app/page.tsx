'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type RoomId = 'marketing' | 'product' | 'monetization' | 'retention' | 'expansion' | 'operations' | 'finance';
type GameState = {
  seed: number; quarter: number; moves: number; totalMoves: number; quarterStartArr: number;
  arr: number; cash: number; debt: number; ownership: number; multiple: number;
  demand: number; activation: number; customers: number; churnRisk: number;
  complexity: number; opsCapacity: number; rot: number; agents: number;
  active: RoomId; alerts: string[]; log: string[]; quarterOpen: boolean; gameOver: boolean;
};

const ROOM_DATA: {id: RoomId; code: string; name: string; accent: string; unlock: number; queue: (g: GameState) => number}[] = [
  {id:'marketing', code:'MKT', name:'Marketing', accent:'#FF5C9A', unlock:0, queue:g=>3 + (g.totalMoves%3)},
  {id:'product', code:'PRD', name:'Product', accent:'#58D9FF', unlock:2, queue:g=>g.demand},
  {id:'monetization', code:'REV', name:'Monetize', accent:'#FFC857', unlock:4, queue:g=>g.activation},
  {id:'retention', code:'RET', name:'Retention', accent:'#6F8CFF', unlock:6, queue:g=>g.churnRisk},
  {id:'operations', code:'OPS', name:'Operations', accent:'#B5F35A', unlock:8, queue:g=>g.alerts.length},
  {id:'expansion', code:'EXP', name:'Expansion', accent:'#A778FF', unlock:10, queue:g=>Math.max(0,Math.floor(g.customers/4))},
  {id:'finance', code:'FIN', name:'Finance', accent:'#77B9FF', unlock:12, queue:g=>g.cash < 18000 ? 1 : 0},
];

const SIGNALS = [
  {title:'“AI spreadsheets are having a week.”', copy:'Finance teams are rebuilding close workflows. The chatter is loud. The buying intent is quieter.', fit:'Strong', velocity:'↑ Fast', intent:'Partial', cost:'$420'},
  {title:'Support teams want fewer tabs.', copy:'A boring painkiller with durable intent. Saturation is low, but nobody is posting victory laps about it.', fit:'Excellent', velocity:'→ Steady', intent:'High', cost:'$260'},
  {title:'Everyone is suddenly an agent studio.', copy:'Huge surface area, punishing competition, and a suspicious amount of launch-day engagement.', fit:'Medium', velocity:'↑ Viral', intent:'Low', cost:'$890'},
];

const RECIPES = [
  {name:'AI Search', parts:['DATA','RETRIEVAL','MODEL','EVAL','DEPLOY']},
  {name:'Usage Billing', parts:['METER','BILLING','ANALYTICS','TEST','DEPLOY']},
  {name:'Enterprise SSO', parts:['AUTH','IDENTITY','ADMIN','TEST','DEPLOY']},
];

const INITIAL: GameState = {
  seed:84022, quarter:1, moves:0, totalMoves:0, quarterStartArr:120000,
  arr:120000, cash:38000, debt:0, ownership:100, multiple:8,
  demand:2, activation:0, customers:12, churnRisk:0,
  complexity:3, opsCapacity:10, rot:0, agents:0, active:'marketing',
  alerts:[], log:['Run 84022 started · Default Alive'], quarterOpen:false, gameOver:false,
};

const money = (n:number) => n >= 1e9 ? `$${(n/1e9).toFixed(2)}B` : n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `$${Math.round(n/1e3)}K` : `$${Math.round(n)}`;
const clamp = (n:number,min:number,max:number) => Math.min(max,Math.max(min,n));
const seeded = (seed:number,index:number) => { const x = Math.sin(seed*12.9898 + index*78.233)*43758.5453; return x-Math.floor(x); };

export default function Home(){
  const [game,setGame] = useState<GameState>(INITIAL);
  const [recipeStep,setRecipeStep] = useState(0);
  const [toast,setToast] = useState('One founder. One active function.');
  const [settings,setSettings] = useState(false);
  const [showBrief,setShowBrief] = useState(true);
  const [meter,setMeter] = useState(8);
  const meterDirection = useRef(1);

  useEffect(()=>{
    const timer=window.setInterval(()=>setMeter(value=>{
      if(value>=96) meterDirection.current=-1;
      if(value<=4) meterDirection.current=1;
      return value + meterDirection.current*2.2;
    }),45);
    return()=>window.clearInterval(timer);
  },[]);

  const unlocked = ROOM_DATA.filter(room=>game.totalMoves>=room.unlock);
  const room = ROOM_DATA.find(item=>item.id===game.active) ?? ROOM_DATA[0];
  const signal = SIGNALS[game.totalMoves%SIGNALS.length];
  const recipe = RECIPES[Math.floor(game.totalMoves/2)%RECIPES.length];
  const growth = ((game.arr-game.quarterStartArr)/game.quarterStartArr)*100;
  const valuation = game.arr*game.multiple;
  const strain = game.complexity/game.opsCapacity;
  const turnsLeft = 18-game.moves;

  function work(kind:string,quality=1){
    setGame(current=>{
      if(current.quarterOpen||current.gameOver) return current;
      const next={...current,alerts:[...current.alerts],log:[...current.log]};
      const unit=Math.max(5000,5000*Math.pow(current.arr/100000,2/3));
      const roll=seeded(current.seed,current.totalMoves+kind.length);
      let result='';
      if(kind==='marketing-ignore') result='Signal ignored · capacity protected';
      if(kind==='marketing-pursue'){next.demand+=quality>1?5:3;next.cash-=quality>1?1200:450;result=`+${quality>1?5:3} demand · ${money(quality>1?1200:450)} spent`;}
      if(kind==='product'){
        if(next.demand>0){next.demand-=1;next.activation+=1;next.cash-=600;result=`${recipe.name} shipped · +1 activation`;}
        else result='No qualified demand to activate';
      }
      if(kind==='monetization'){
        if(next.activation>0){const won=unit*(.65+quality*.55);next.activation-=1;next.customers+=1;next.arr+=won;next.cash+=won*.09;result=`Deal closed · +${money(won)} ARR`;}
        else result='No activated cohort to price';
      }
      if(kind==='retention'){
        if(next.churnRisk>0){const saved=unit*(.35+quality*.25);next.churnRisk-=1;result=`Cohort saved · ${money(saved)} ARR protected`;}
        else{next.cash-=250;result='Health sweep complete · no urgent risk';}
      }
      if(kind==='expansion'){
        if(next.customers>0){const won=Math.min(current.arr*.02,unit*(.35+quality*.3));next.arr+=won;next.cash+=won*.07;result=`Custom package accepted · +${money(won)} ARR`;}
      }
      if(kind==='operations-safe'){next.cash-=500;next.rot=clamp(next.rot-12,0,100);next.opsCapacity+=.6;next.alerts=next.alerts.slice(1);result='System stabilized · rot −12';}
      if(kind==='operations-risk'){
        if(roll>.38){next.cash+=2400;next.rot=clamp(next.rot-5,0,100);result='One-line fix held · +$2.4K cash';}
        else{next.rot=clamp(next.rot+18,0,100);next.alerts.push('Recursive workflow');result='Black box bit back · rot +18';}
      }
      if(kind==='finance-bootstrap'){next.cash-=500;result='Board declined · ownership held at 100%';}
      if(kind==='finance-debt'){next.cash+=15000;next.debt+=17000;next.complexity+=1;result='+$15K cash · $17K repayment opened';}
      if(kind==='finance-vc'){next.cash+=60000;next.ownership=clamp(next.ownership-8,0,100);next.complexity+=2;result='+$60K cash · ownership −8pp';}
      next.moves+=1;next.totalMoves+=1;
      next.cash-=360;
      if(next.totalMoves>8){next.rot=clamp(next.rot + Math.max(0,strain-.7)*2.4 + next.agents*.35,0,100);}
      if(next.totalMoves%5===0){next.churnRisk+=1;next.alerts.push(next.rot>30?'Agent handoff drift':'Customer health warning');}
      if(next.totalMoves===8){next.agents=1;next.complexity+=3;result+=' · first agent online';}
      const newlyUnlocked=ROOM_DATA.find(r=>r.unlock===next.totalMoves);
      if(newlyUnlocked) next.alerts.push(`${newlyUnlocked.name} is now relevant`);
      if(next.moves>=18) next.quarterOpen=true;
      if(next.cash<=-10000){next.gameOver=true;next.quarterOpen=false;result='Runway exhausted';}
      next.log=[result,...next.log].slice(0,7);
      setToast(result);
      return next;
    });
  }

  function choosePart(part:string){
    if(part===recipe.parts[recipeStep]){
      const next=recipeStep+1;setRecipeStep(next);setToast(`${part} locked · ${next}/${recipe.parts.length}`);
      if(next===recipe.parts.length){work('product',1);setRecipeStep(0);}
    }else{setToast(`${part} bounced · recipe needs ${recipe.parts[recipeStep]}`);}
  }

  function closeQuarter(relic:'craft'|'systems'|'luck'){
    setGame(current=>{
      const qGrowth=(current.arr-current.quarterStartArr)/current.quarterStartArr;
      const nextMultiple=qGrowth>=.12?Math.min(22,current.multiple+2):Math.max(4,current.multiple-1);
      const next={...current,quarter:current.quarter+1,moves:0,quarterStartArr:current.arr,multiple:nextMultiple,quarterOpen:false,alerts:current.alerts.slice(-2)};
      if(relic==='craft'){next.cash-=2500;next.opsCapacity+=2;next.log=['Actually Read the Diff · Ops capacity +2',...next.log];}
      if(relic==='systems'){next.cash-=4000;next.agents+=1;next.complexity+=3;next.log=['Post While You Sleep · +1 agent',...next.log];}
      if(relic==='luck'){next.cash+=seeded(current.seed,current.quarter)>0.45?12000:-4000;next.log=['Founder Math resolved',...next.log];}
      setToast(`Q${current.quarter} closed · multiple locked at ${nextMultiple}×`);
      return next;
    });
  }

  function reset(){if(window.confirm('End this run and return to day one?')){setGame(INITIAL);setRecipeStep(0);setToast('New run · same seed, clean machine');setSettings(false);}}

  return <main className="app-shell" style={{'--accent':room.accent} as React.CSSProperties}>
    <header className="topbar">
      <div className="brand"><img src="/structure-mark.png" alt=""/><div><b>ONE PERSON UNICORN</b><span>Run {game.seed} · Q{game.quarter}</span></div></div>
      <div className="valuation-block"><span>VALUATION</span><strong>{money(valuation)}</strong><small className={growth>=0?'positive':'negative'}>{growth>=0?'↑':'↓'} {Math.abs(growth).toFixed(1)}% this quarter · {game.multiple}×</small></div>
      <button className="quiet-button" onClick={()=>setSettings(true)} aria-label="Open settings"><span>SET</span></button>
    </header>

    <section className="metric-strip" aria-label="Company metrics">
      <Metric label="ARR" value={money(game.arr)} note={`+${money(game.arr-game.quarterStartArr)} QTD`} tone="positive"/>
      <Metric label="CASH" value={money(game.cash)} note={game.debt?`${money(game.debt)} debt`:`${Math.max(0,Math.floor(game.cash/3200))} mo runway`}/>
      <Metric label="MANDATE" value={`${growth.toFixed(1)} / 12%`} note={`${turnsLeft} founder moves left`} tone={growth>=12?'positive':turnsLeft<5?'warning':''}/>
      <Metric label="OWNERSHIP" value={`${game.ownership.toFixed(0)}%`} note={game.ownership===100?'Default alive':'External capital'}/>
      <Metric label="MACHINE" value={`${Math.round(strain*100)}% strain`} note={`${Math.round(game.rot)} rot · ${game.agents} agent${game.agents===1?'':'s'}`} tone={strain>1?'warning':''}/>
    </section>

    <div className="game-grid">
      <nav className="room-rail" aria-label="Work functions">
        <div className="rail-label">WORK FUNCTIONS</div>
        {unlocked.map(item=><button key={item.id} className={game.active===item.id?'room active':'room'} style={{'--room':item.accent} as React.CSSProperties} onClick={()=>setGame(g=>({...g,active:item.id}))}><span className="asset-slot" aria-hidden="true"><span>{item.code}</span></span><span className="room-name">{item.name}</span>{item.queue(game)>0&&<i>{item.queue(game)}</i>}</button>)}
        {unlocked.length<ROOM_DATA.length&&<p className="rail-lock">The machine reveals systems when they become relevant.</p>}
      </nav>

      <section className="playfield" aria-labelledby="room-title">
        <div className="room-heading"><div><span>ACTIVE FUNCTION · {room.name.toUpperCase()}</span><h1 id="room-title">{roomTitle(game.active)}</h1></div><p>{roomSubtitle(game.active)}</p></div>
        <div className="canvas"><Room game={game} room={game.active} signal={signal} recipe={recipe} recipeStep={recipeStep} meter={meter} work={work} choosePart={choosePart}/></div>
        <div className="context-bar"><div><span className="status-dot"/> {toast}</div><small>ACTION {game.moves}/18 · SIM CONTINUES</small></div>
      </section>

      <aside className="side-panel">
        <section><div className="panel-label">ECONOMIC FLOW</div><div className="flow"><Flow label="Demand" value={game.demand} color="#FF5C9A"/><span>→</span><Flow label="Active" value={game.activation} color="#58D9FF"/><span>→</span><Flow label="Customers" value={game.customers} color="#FFC857"/></div><p>Marketing creates demand. Product activates it. Monetization converts it into ARR.</p></section>
        <section><div className="panel-label">FOUNDER ATTENTION</div><div className="attention-orbit"><span>YOU</span><i style={{background:room.accent}}/></div><p>You are operating <b>{room.name}</b>. Everything else keeps moving.</p></section>
        <section className={game.alerts.length?'alert-panel hot':'alert-panel'}><div className="panel-label">ALERT INBOX · {game.alerts.length}</div>{game.alerts.length?<><b>{game.alerts[0]}</b><p>{game.alerts.length>1?`+${game.alerts.length-1} more waiting`:'Route to Operations before it escalates.'}</p></>:<p>Quiet enough to hear the burn rate.</p>}</section>
        <section className="ledger"><div className="panel-label">ACTION LEDGER</div>{game.log.slice(0,4).map((entry,index)=><p key={`${entry}-${index}`}>{entry}</p>)}</section>
      </aside>
    </div>

    <nav className="mobile-nav" aria-label="Work functions">{unlocked.slice(-5).map(item=><button key={item.id} className={game.active===item.id?'active':''} style={{'--room':item.accent} as React.CSSProperties} onClick={()=>setGame(g=>({...g,active:item.id}))}><span>{item.code}</span><small>{item.name}</small>{item.queue(game)>0&&<i>{item.queue(game)}</i>}</button>)}</nav>

    {showBrief&&<div className="brief-sheet"><button className="sheet-close" onClick={()=>setShowBrief(false)} aria-label="Dismiss introduction">×</button><div className="brief-mark"><img src="/structure-mark.png" alt=""/></div><span>RUN 84022 · FOUNDER HISTORY: BUILDER</span><h2>Build the company.<br/>Survive the machine.</h2><p>Reach a <b>$1B valuation</b>. You can control one function at a time; the rest will not wait politely.</p><button className="hero-button" onClick={()=>setShowBrief(false)}>Read the first signal <b>→</b></button><small>One interaction first. The complexity earns its entrance.</small></div>}

    {game.quarterOpen&&<QuarterClose game={game} growth={growth} valuation={valuation} choose={closeQuarter}/>} 
    {game.gameOver&&<div className="modal-backdrop"><section className="result-modal"><span>RUN ENDED · BANKRUPT</span><h2>The runway ended before the queue did.</h2><p>Cash pressure began in Q{game.quarter}. Operations became the bottleneck while founder attention stayed in {room.name}.</p><button className="hero-button" onClick={reset}>Run it back →</button></section></div>}
    {settings&&<div className="drawer-backdrop" onClick={()=>setSettings(false)}><aside className="settings" onClick={event=>event.stopPropagation()}><button className="sheet-close" onClick={()=>setSettings(false)}>×</button><span>CONTROL PANEL</span><h2>Keep the signal. Tune the noise.</h2><label><input type="checkbox" defaultChecked/> Reduced milestone motion</label><label><input type="checkbox"/> Screen shake</label><label><input type="checkbox" defaultChecked/> Haptics on supported devices</label><label>Effects intensity<input type="range" min="0" max="100" defaultValue="65"/></label><button className="danger-button" onClick={reset}>Restart run</button></aside></div>}
  </main>;
}

function Metric({label,value,note,tone=''}:{label:string;value:string;note:string;tone?:string}){return <div><span>{label}</span><strong>{value}</strong><small className={tone}>{note}</small></div>}
function Flow({label,value,color}:{label:string;value:number;color:string}){return <div><b style={{color}}>{value}</b><small>{label}</small></div>}
function roomTitle(room:RoomId){return {marketing:'Read the signal.',product:'Build what converts.',monetization:'Price the moment.',retention:'Protect the ARR.',expansion:'Grow the cohort.',operations:'Control the machine.',finance:'Choose your gravity.'}[room]}
function roomSubtitle(room:RoomId){return {marketing:'Demand does not equal revenue.',product:'Ship speed leaves a receipt.',monetization:'Activation is waiting.',retention:'Prioritize value at risk.',expansion:'Fit beats feature volume.',operations:'Every shortcut has a blast radius.',finance:'Capital changes the run.'}[room]}

function Room({game,room,signal,recipe,recipeStep,meter,work,choosePart}:{game:GameState;room:RoomId;signal:(typeof SIGNALS)[number];recipe:(typeof RECIPES)[number];recipeStep:number;meter:number;work:(kind:string,quality?:number)=>void;choosePart:(part:string)=>void}){
  if(room==='marketing') return <div className="room-game marketing-game"><div className="signal-card"><div className="card-topline"><span>MARKET SIGNAL #{String(game.totalMoves+14).padStart(3,'0')}</span><b>72H WINDOW</b></div><div className="signal-bars" aria-hidden="true"><i/><i/><i/><i/><i/></div><h2>{signal.title}</h2><p>{signal.copy}</p><dl><div><dt>Audience fit</dt><dd>{signal.fit}</dd></div><div><dt>Trend velocity</dt><dd>{signal.velocity}</dd></div><div><dt>Purchase intent</dt><dd>{signal.intent}</dd></div><div><dt>Acquisition cost</dt><dd>{signal.cost}</dd></div></dl></div><div className="decision-row"><button onClick={()=>work('marketing-ignore')}>← Ignore</button><button className="primary" onClick={()=>work('marketing-pursue')}>Pursue →</button><button onClick={()=>work('marketing-pursue',2)}>Go big ↑</button></div><p className="micro-tutorial">Choose the work worth feeding into a constrained company.</p></div>;
  if(room==='product'){
    const tray=Array.from(new Set([...recipe.parts,'CACHE','SOCIAL','EXPORT'])).sort(()=>0); 
    return <div className="room-game product-game"><div className="work-object"><span>FEATURE REQUEST</span><h2>{recipe.name}</h2><p>Serve one demand cohort by assembling the deterministic recipe.</p><div className="recipe-track">{recipe.parts.map((part,index)=><div key={part} className={index<recipeStep?'filled':index===recipeStep?'next':''}><b>{index<recipeStep?'LOCKED':index===recipeStep?'NEXT':'WAIT'}</b><span>{part}</span></div>)}</div></div><div className="component-tray"><span>COMPONENT TRAY</span><div>{tray.map(part=><button key={part} onClick={()=>choosePart(part)}>{part}</button>)}</div></div><p className="micro-tutorial">Tap the next required component. Wrong pieces bounce; complete recipes activate demand.</p></div>;
  }
  if(room==='monetization'){
    const quality=meter>43&&meter<57?1.35:meter>25&&meter<75?1:.55;
    return <div className="room-game monetization-game"><div className="deal-card"><span>PRICING OPPORTUNITY · {game.activation} READY</span><h2>Ops team · 48 seats</h2><p>The champion is sold. Procurement is looking for a reason to say no.</p><div className="price-meter"><div className="zones"><i/><i/><i/><i/><i/></div><b style={{left:`${meter}%`}}/></div><div className="meter-labels"><span>TOO CHEAP</span><strong>PERFECT</strong><span>TOO EXPENSIVE</span></div><button className="hero-button" disabled={game.activation===0} onClick={()=>work('monetization',quality)}>Lock price</button></div><p className="micro-tutorial">Tap inside the bright band. Better timing converts more Activation into ARR.</p></div>;
  }
  if(room==='retention'){
    const threats=[['FAILED PAYMENT','$18K','12s'],['BROKEN WORKFLOW','$7K','24s'],['BAD ONBOARDING','$3K','31s']];
    return <div className="room-game retention-game"><div className="threat-board">{threats.map((item,index)=><button key={item[0]} disabled={game.churnRisk===0} onClick={()=>work('retention',index===0?1.4:1)}><span>{item[0]}</span><strong>{item[1]} ARR</strong><small>{item[2]} TO CHURN</small><i style={{width:`${88-index*19}%`}}/></button>)}</div><p className="micro-tutorial">Aim founder attention at the highest-value threat. Retention protects ARR; it never creates it.</p></div>;
  }
  if(room==='expansion') return <div className="room-game expansion-game"><div className="account-card"><span>ACCOUNT NEED · SIGNAL PARTIAL</span><h2>Northstar Labs</h2><p>Usage is spreading from Analytics into internal workflows.</p><div className="merge-board"><button>ANALYTICS <i>+</i></button><button>ANALYTICS <i>=</i></button><button className="merged">REPORTING</button><button>AUTOMATION <i>+</i></button><button>AUTOMATION <i>=</i></button><button className="merged">WORKFLOW</button></div><button className="hero-button" onClick={()=>work('expansion',1.2)}>Package Reporting + Workflow</button></div><p className="micro-tutorial">Merge modules into a package that matches the customer’s actual need.</p></div>;
  if(room==='operations') return <div className="room-game operations-game"><div className="ops-cards"><button onClick={()=>work('operations-safe')}><span>OBLIGATION</span><h2>{game.alerts[0]??'Context maintenance'}</h2><p>Trace the evidence, preserve the system, spend $500.</p><b>STABILIZE →</b></button><button className="risky" onClick={()=>work('operations-risk')}><span>OPTIMIZATION · HIGH VARIANCE</span><h2>One-line fix</h2><p>Could cut cost. Could teach the machine a new and exciting failure mode.</p><b>SHIP THE PATCH →</b></button></div><div className="ops-gauges"><Gauge label="Complexity" value={game.complexity} max={20}/><Gauge label="Ops capacity" value={game.opsCapacity} max={20}/><Gauge label="Context rot" value={game.rot} max={100}/></div></div>;
  return <div className="room-game finance-game"><div className="capital-stack"><button onClick={()=>work('finance-bootstrap')}><span>BOOTSTRAP</span><h2>Keep the cap table clean.</h2><p>Protect ownership. Keep operating inside the cash you earned.</p><b>DECLINE OFFERS →</b></button><button onClick={()=>work('finance-debt')}><span>DEBT</span><h2>$15K now. $17K later.</h2><p>No dilution. Fixed obligation. The lender does not enjoy your lore.</p><b>TAKE FACILITY →</b></button><button onClick={()=>work('finance-vc')}><span>VENTURE</span><h2>$60K for 8%.</h2><p>More runway, a higher mandate, and someone else in the room.</p><b>TAKE THE ROUND →</b></button></div><p className="micro-tutorial">Finance changes cash, debt, and ownership—not valuation directly.</p></div>;
}

function Gauge({label,value,max}:{label:string;value:number;max:number}){return <div><span>{label}</span><b>{Math.round(value)}</b><i><em style={{width:`${clamp(value/max*100,0,100)}%`}}/></i></div>}

function QuarterClose({game,growth,valuation,choose}:{game:GameState;growth:number;valuation:number;choose:(r:'craft'|'systems'|'luck')=>void}){
  return <div className="modal-backdrop"><section className="quarter-modal"><div className="quarter-kicker">BOARD MEETING · Q{game.quarter} RESULTS</div><div className="quarter-head"><div><span>ENDING ARR</span><strong>{money(game.arr)}</strong></div><div><span>VALUATION</span><strong>{money(valuation)}</strong></div><div><span>GROWTH VS MANDATE</span><strong className={growth>=12?'positive':'warning'}>{growth.toFixed(1)}% / 12%</strong></div></div><div className="arr-ledger"><span>Starting ARR <b>{money(game.quarterStartArr)}</b></span><span>Net new ARR <b className="positive">+{money(game.arr-game.quarterStartArr)}</b></span><span>Growth multiple <b>{game.multiple}× locked</b></span></div><h2>What changed?</h2><p>Choose one permanent run modifier. The next quarter starts immediately.</p><div className="relic-grid"><button onClick={()=>choose('craft')}><span>CRAFT · RELIC</span><h3>Actually Read the Diff</h3><p>Ops capacity +2. Costs $2.5K.</p></button><button onClick={()=>choose('systems')}><span>AUTONOMY · RELIC</span><h3>Post While You Sleep</h3><p>+1 agent, +3 complexity. Costs $4K.</p></button><button onClick={()=>choose('luck')}><span>VARIANCE · RELIC</span><h3>Founder Math</h3><p>Asymmetric confidence. ± cash.</p></button></div></section></div>;
}
