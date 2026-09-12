'use client';

import Image from 'next/image';
import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { V2_GOLDEN_BALANCE } from '../../game/balance/v2-golden';
import { contentById, V2_GOLDEN_CONTENT } from '../../game/content/v2-golden';
import { evaluateEligibility } from '../../game/effects/eligibility';
import type { FunctionId } from '../../game/schema/actions';
import type { CustomerArchetypeContent, MarketingSignalContent, ProductRecipeContent, RelicContent, SkillRankContent, StrategyContent } from '../../game/schema/content';
import { asContentId, asEntityId, asQueueItemId } from '../../game/schema/ids';
import type { RunState } from '../../game/schema/state';
import { selectEconomy, formatCash, formatDollars } from '../../game/selectors/economy';
import { selectGoldenRooms } from '../../game/selectors/rooms';
import { startBrowserClock } from '../../game/runtime/browser-clock';
import { DEFAULT_ENGINE_CONTEXT } from '../../game/engine/create-run';
import { GameRuntime, type RuntimeSnapshot } from '../../game/runtime/game-runtime';
import { assertCompatibleSave, createSaveEnvelope, IndexedDbPersistence } from '../../game/runtime/persistence';
import { mostImportantEvent, type PresentedEvent } from '../../presentation/event-orchestrator';
import { playEventSound } from '../../presentation/audio';
import { EXPANSION_MODULE_FIXTURES, OPERATIONS_EVIDENCE_FIXTURES, RETENTION_THREAT_FIXTURES } from '../../game/fixtures/v2-presentation';

const SAVE_SLOT = 'golden-run';
const persistence = new IndexedDbPersistence();
const MARKETING_SIGNAL_IDS = ['signal.support-tabs', 'signal.finance-sheet', 'signal.agent-studio'] as const;
const FUNCTION_IDS: FunctionId[] = ['MARKETING', 'PRODUCT', 'MONETIZATION', 'RETENTION', 'EXPANSION', 'OPERATIONS', 'FINANCE'];

export default function GameShell() {
  const [runtime, setRuntime] = useState(() => new GameRuntime(84022));
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>(runtime.snapshot);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [restored, setRestored] = useState(false);
  const [loadNotice, setLoadNotice] = useState('');
  const [bootReady, setBootReady] = useState(false);
  const [runtimeError, setRuntimeError] = useState(false);
  const lastSoundSequence = useRef(0);

  useEffect(() => runtime.subscribe(setSnapshot), [runtime]);
  useEffect(() => {
    let active = true;
    persistence.load(SAVE_SLOT).then((save) => {
      if (!active || !save || save.snapshot.state.clock.phase === 'SETUP') return;
      assertCompatibleSave(save, DEFAULT_ENGINE_CONTEXT.balance.version, DEFAULT_ENGINE_CONTEXT.content.version);
      const restoredRuntime = new GameRuntime(save.snapshot.state.header.seed, DEFAULT_ENGINE_CONTEXT, save.snapshot);
      setSnapshot(restoredRuntime.snapshot);
      setRuntime(restoredRuntime);
      setRestored(true);
    }).catch((error: unknown) => { setRestored(false); setLoadNotice(error instanceof Error && error.message.startsWith('INCOMPATIBLE_SAVE') ? 'A previous run uses a different balance/content version. It was preserved and not silently migrated.' : 'A previous run could not be restored.'); }).finally(() => { if (active) setBootReady(true); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const clock = startBrowserClock(runtime, V2_GOLDEN_BALANCE.ticksPerSecond.value, () => setRuntimeError(true));
    const visibility = () => clock.setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); clock.stop(); };
  }, [runtime]);
  const [saveStatus, setSaveStatus] = useState('Saved on this device');
  useEffect(() => {
    if (!bootReady) return;
    let saved = runtime.snapshot.checksum;
    let saving = false;
    let disposed = false;
    const save = async () => {
      const current = runtime.snapshot;
      if (saving || current.state.clock.phase === 'SETUP' || current.checksum === saved) return;
      saving = true;
      try {
        await persistence.save(SAVE_SLOT, createSaveEnvelope(current));
        saved = current.checksum;
        if (!disposed) setSaveStatus('Saved on this device');
      } catch { if (!disposed) setSaveStatus('Save unavailable · keep this tab open'); }
      finally { saving = false; }
    };
    const interval = window.setInterval(() => { void save(); }, 5000);
    const onHide = () => { if (document.visibilityState === 'hidden') void save(); };
    const onPageHide = () => { void save(); };
    window.addEventListener('pagehide', onPageHide);
    document.addEventListener('visibilitychange', onHide);
    return () => { disposed = true; clearInterval(interval); window.removeEventListener('pagehide', onPageHide); document.removeEventListener('visibilitychange', onHide); };
  }, [runtime, bootReady]);
  useEffect(() => {
    const fresh = snapshot.events.filter((item) => item.sequence > lastSoundSequence.current);
    const presented = mostImportantEvent(fresh);
    if (presented) playEventSound(presented, audioEnabled);
    if (fresh.length) lastSoundSequence.current = fresh.at(-1)!.sequence;
  }, [snapshot, audioEnabled]);

  const state = snapshot.state;
  const startNewRun = async () => {
    if (state.clock.phase !== 'FAILED' && state.clock.phase !== 'SETUP' && !window.confirm('Start a new company? The current local run will be replaced.')) return;
    await persistence.remove(SAVE_SLOT).catch(() => setSaveStatus('Save unavailable · keep this tab open'));
    lastSoundSequence.current = 0;
    setRestored(false);
    setLoadNotice('');
    const freshRuntime = new GameRuntime(crypto.getRandomValues(new Uint32Array(1))[0]);
    setSnapshot(freshRuntime.snapshot);
    setRuntime(freshRuntime);
  };
if (runtimeError) return <main className="boot-screen"><h1>The run was interrupted.</h1><p>Your last saved checkpoint is still on this device.</p><button className="primary-action" onClick={() => window.location.reload()}>Reload checkpoint</button></main>;
  if (!bootReady) return <main className="boot-screen"><Image src="/structure-mark.png" alt="" width={54} height={61} priority /><p>VERIFYING LOCAL RUN</p><span>Seed, balance, content and checksum</span></main>;
  if (state.clock.phase === 'SETUP') return <RunSetup runtime={runtime} notice={loadNotice} />;
  return <Cockpit runtime={runtime} snapshot={snapshot} audioEnabled={audioEnabled} onToggleAudio={() => setAudioEnabled((value) => !value)} onNewRun={startNewRun} restored={restored} saveStatus={saveStatus} />;
}

function RunSetup({ runtime, notice }: { runtime: GameRuntime; notice: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const mandates = [0, 10, 25];
  const choose = (value: number) => {
    if (!runtime.snapshot.state.header.founderHistoryId) runtime.dispatch('RUN_FOUNDER_HISTORY_SELECTED', { founderHistoryId: asContentId('history.fresh-founder') });
    runtime.dispatch('RUN_GROWTH_MANDATE_SELECTED', { growthMandateBps: (value * 100) as never });
    setSelected(value);
  };
  return <main className="run-setup founder-entry">
    <div className="setup-mark"><Image src="/structure-mark.png" alt="" width={62} height={70} priority /></div>
    <p className="kicker">ONE PERSON UNICORN</p>{notice && <p className="save-notice">{notice}</p>}
    <h1>Small founder.
Extraordinary company.</h1>
    <p className="setup-copy">Find a need. Build something people love. Earn your first customers, automate the work, and survive the company you create.</p>
    <div className="founder-history"><span>FOUNDER HISTORY</span><strong>Fresh Founder</strong><small>Your next chapter starts here.</small></div>
    <p className="setup-difficulty">Choose your pace · bootstrap is a good first run</p><div className="mandate-grid" role="group" aria-label="Choose quarterly Growth Mandate">
      {mandates.map((value) => <button key={value} onClick={() => choose(value)} className={selected === value ? 'selected' : ''}><strong>{value === 0 ? 'Bootstrap' : `${value}%`}</strong><span>{value === 0 ? 'No growth ultimatum' : value === 10 ? 'Learn the machine' : value < 50 ? 'Serious growth' : value < 100 ? 'Relentless' : 'Double or die'}</span></button>)}
    </div>
    <button className="primary-action" disabled={selected === null} onClick={() => runtime.dispatch('RUN_STARTED', {})}>Begin Q1 <span>→</span></button>
    <p className="setup-foot">A solo-founder roguelike · Saved locally · Play at your pace</p>
  </main>;
}

function Cockpit({ runtime, snapshot, audioEnabled, onToggleAudio, onNewRun, restored, saveStatus }: { runtime: GameRuntime; snapshot: RuntimeSnapshot; audioEnabled: boolean; onToggleAudio: () => void; onNewRun: () => void; restored: boolean; saveStatus: string }) {
  const [command, setCommand] = useState(false);
  const [gestureEpoch, setGestureEpoch] = useState(0);
  useEffect(() => {
    const cancel = () => setGestureEpoch(value => value + 1);
    window.addEventListener('blur', cancel);
    window.addEventListener('resize', cancel);
    return () => { window.removeEventListener('blur', cancel); window.removeEventListener('resize', cancel); };
  }, []);
  const state = snapshot.state;
  const economy = selectEconomy(state);
  const rooms = selectGoldenRooms(state);
  const [receipt, setReceipt] = useState<{ event: PresentedEvent; sequence: number } | null>(null);
  useEffect(() => {
    let seen = -1;
    return runtime.subscribe(current => {
      const sequence = current.events.at(-1)?.sequence ?? 0;
      if (sequence === seen) return;
      seen = sequence;
      const event = mostImportantEvent(current.events);
      if (event) setReceipt({ event, sequence });
    });
  }, [runtime]);
  const presented = receipt?.event ?? null;
  const quarterProgress = Math.min(100, Math.floor(state.clock.tickInQuarter * 100 / quarterDuration(state)));
  const activeAccent = rooms.find((room) => room.id === state.founderAttention)?.accent ?? '#ff5c9a';
  const enter = (functionId: FunctionId) => { setCommand(false); runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId }); };
  return <main className="game-shell" style={{ '--active-accent': activeAccent } as React.CSSProperties}>
    <header className="economy-hud">
      <div className="identity"><Image src="/structure-mark.png" alt="" width={34} height={38} priority /><div><b>ONE PERSON UNICORN</b><span>RUN {state.header.seed} · SOLO FOUNDER</span></div></div>
      <HudMetric label="VALUATION" value={formatDollars(economy.valuation)} detail={`${(state.economy.growthMultipleBps / 10_000).toFixed(1)}× ARR`} primary />
      <HudMetric label="ARR" value={formatDollars(economy.arr)} detail={`+${formatDollars(state.economy.newCustomerArrQTD)} QTD`} />
      <HudMetric label="CASH" value={formatCash(economy.cashCents)} detail={`${state.cohorts.customers.length} customer${state.cohorts.customers.length === 1 ? '' : 's'}`} />
      <HudMetric label={economy.mandateBps ? "GROWTH TARGET" : "QUARTER"} value={economy.mandateBps ? `${(state.quarter.growthBps / 100).toFixed(1)} / ${(economy.mandateBps / 100).toFixed(0)}%` : `Q${economy.quarter} · ${formatClock(quarterDuration(state) - state.clock.tickInQuarter)}`} detail={`Q${economy.quarter} · ${quarterProgress}% elapsed`} warning={state.quarter.growthBps < economy.mandateBps} />
      <div className="run-controls"><button className="pause-toggle" disabled={state.clock.phase !== 'ACTIVE'} onClick={() => runtime.dispatch('RUN_PAUSE_SET', { paused: !state.clock.paused })}>{state.clock.paused ? 'Resume' : 'Pause'}</button><button className="audio-toggle" onClick={onToggleAudio} aria-pressed={audioEnabled}><span>{audioEnabled ? 'SOUND ON' : 'MUTED'}</span></button><button className="new-run" onClick={onNewRun}>NEW RUN</button><details className="mobile-settings"><summary aria-label="Run settings">•••</summary><div><button onClick={onToggleAudio}>{audioEnabled ? 'Mute sound' : 'Enable sound'}</button><button onClick={onNewRun}>New company</button></div></details></div>
    </header>

    <div className="shell-body">
      <nav className="function-rail" aria-label="Work functions">
        <button className={command ? 'command-nav active' : 'command-nav'} onClick={() => setCommand(true)}><span>Company</span><b>↗</b></button><p>FOUNDER ATTENTION</p>
        {rooms.map((room, index) => <button key={room.id} disabled={!room.unlocked || state.clock.phase !== 'ACTIVE'} className={!command && state.founderAttention === room.id ? 'active' : ''} onClick={() => enter(room.id)} style={{ '--room-accent': room.accent } as React.CSSProperties}><i>{String(index + 1).padStart(2, '0')}</i><span>{room.name}</span><b>{room.queue || (state.founderAttention === room.id ? 'YOU' : '·')}</b></button>)}
        <div className="rail-rule" />
        <small>{rooms.filter((room) => room.unlocked).length} / {rooms.length} systems online</small><QuickSim runtime={runtime} />
      </nav>

      <section key={gestureEpoch} className={`active-stage ${!command && state.clock.phase === 'ACTIVE' && !state.clock.paused ? 'with-work-routing' : ''}`} aria-live="off">
        {!command && state.clock.phase === 'ACTIVE' && !state.clock.paused && <WorkRouting runtime={runtime} state={state} enter={enter} />}
        {state.clock.phase === 'UNICORN_CHECKPOINT' ? <RoomFrame eyebrow="THE UNICORN CHECKPOINT" title="One person. A billion dollars." instruction="You built it. Keep operating the company and see how far it can go."><button className="primary-action" onClick={() => runtime.dispatch('RUN_CONTINUED_AFTER_UNICORN', {})}>Keep building →</button></RoomFrame> : (state.clock.phase === 'FAILED' || state.clock.phase === 'ABANDONED') ? <FailureScreen state={state} onNewRun={onNewRun} /> : state.clock.phase === 'QUARTER_CLOSE' ? <QuarterClose runtime={runtime} state={state} /> : state.clock.tickInQuarter === 0 && state.clock.paused ? <QuarterReady runtime={runtime} state={state} /> : state.clock.paused ? <RoomFrame eyebrow="TAKE A BREATH" title="The company can wait." instruction="Your run is paused. Resume when you’re ready; nothing advances in the background."><button className="primary-action" onClick={() => runtime.dispatch('RUN_PAUSE_SET', { paused: false })}>Resume company →</button></RoomFrame> : command ? <CompanyView state={state} enter={enter} runtime={runtime} /> : state.founderAttention === 'MARKETING' ? <MarketingRoom runtime={runtime} state={state} /> : state.founderAttention === 'PRODUCT' ? <ProductRoom runtime={runtime} state={state} /> : state.founderAttention === 'MONETIZATION' ? <MonetizationRoom runtime={runtime} state={state} /> : state.founderAttention === 'RETENTION' ? <RetentionRoom runtime={runtime} state={state} /> : state.founderAttention === 'EXPANSION' ? <ExpansionRoom key={state.functions.EXPANSION.queue.find(item => item.metadata.committed !== true)?.id ?? 'empty-expansion'} runtime={runtime} state={state} /> : state.founderAttention === 'OPERATIONS' ? <OperationsRoom key={state.functions.OPERATIONS.queue[0]?.id ?? 'empty-operations'} runtime={runtime} state={state} /> : <FinanceRoom runtime={runtime} state={state} />}
      </section>

      <aside className="causal-rail" aria-label="Company flow and causal ledger">
        {restored && <div className="restore-note">Welcome back. Your company is ready.</div>}
        <div className="flow-heading"><span>YOUR COMPANY</span><b>{state.clock.paused ? 'PAUSED' : 'LIVE'}</b></div>
        <ol className="cohort-flow">
          <FlowStep label="Demand" count={state.cohorts.demand.length} active={state.cohorts.demand.length > 0} accent="#ff5c9a" />
          <FlowStep label="Activation" count={state.cohorts.activated.length} active={state.cohorts.activated.length > 0} accent="#58d9ff" />
          <FlowStep label="Customer" count={state.cohorts.customers.length} active={state.cohorts.customers.length > 0} accent="#ffc857" />
        </ol>
        <div className="machine-load"><div><span>COMPLEXITY</span><b>{(state.pressure.complexity / 1000).toFixed(1)}</b></div><div><span>OPS CAPACITY</span><b>{(state.pressure.opsCapacity / 1000).toFixed(1)}</b></div><div><span>STRAIN</span><b>{state.pressure.strainBand}</b></div></div>
        <div key={receipt?.sequence ?? 0} className={`causal-receipt priority-${presented?.priority ?? 0}`}>
          <span>LATEST DEVELOPMENT</span>
          <strong>{presented?.label ?? 'Company running'}</strong>
          <p>{presented?.detail ?? nextInstruction(state)}</p>
          <small>{saveStatus}</small>
        </div>
      </aside>
    </div>

    <nav className="mobile-dock" aria-label="Work functions"><button onClick={() => setCommand(true)} className={command ? 'active' : ''}><span>Home</span><small>Company</small></button>{rooms.map((room) => <button key={room.id} disabled={!room.unlocked || state.clock.phase !== 'ACTIVE'} className={!command && state.founderAttention === room.id ? 'active' : ''} onClick={() => enter(room.id)} style={{ '--room-accent': room.accent } as React.CSSProperties}><span>{room.code}</span><small>{room.queue || (state.founderAttention === room.id ? 'YOU' : room.unlocked ? 'READY' : 'LOCKED')}</small></button>)}</nav>
    <div className="mobile-receipt" role="status"><b key={receipt?.sequence ?? 0}>{presented?.label ?? 'Company running'}</b><span>{presented?.detail ?? nextInstruction(state)}</span></div>
  </main>;
}

function nextWork(state: RunState): FunctionId | undefined {
  for (const id of ['PRODUCT', 'MONETIZATION', 'RETENTION', 'EXPANSION', 'OPERATIONS', 'FINANCE'] as FunctionId[]) {
    if (id !== state.founderAttention && state.functions[id].unlocked && state.functions[id].queue.some(item => item.metadata.resolved !== true && item.metadata.committed !== true)) return id;
  }
  const start = state.clock.tick - state.clock.tickInQuarter;
  const leadsRemain = MARKETING_SIGNAL_IDS.some(id => !state.cohorts.demand.some(cohort => cohort.createdAtTick >= start && cohort.sourceId === id) && !state.outcome.milestones.includes(`Q${state.clock.quarterIndex}:MARKETING_IGNORED:${id}`));
  return state.founderAttention !== 'MARKETING' && leadsRemain ? 'MARKETING' : undefined;
}
function WorkRouting({ runtime, state, enter }: { runtime: GameRuntime; state: RunState; enter: (id: FunctionId) => void }) {
  const next = nextWork(state);
  return <div className="work-routing"><span>Q{state.clock.quarterIndex} · {formatClock(quarterDuration(state) - state.clock.tickInQuarter)}</span>{next ? <button onClick={() => enter(next)}>Work waiting in {next.charAt(0) + next.slice(1).toLowerCase()} <b>→</b></button> : <QuickSim runtime={runtime} />}</div>;
}
function EmptyWork({ runtime, title, detail }: { runtime: GameRuntime; title: string; detail: string }) {
  return <RoomFrame eyebrow="WORKSPACE READY" title={title} instruction={detail}><div className="empty-work"><p>Find a fresh customer need to put this workspace to use.</p><button className="primary-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'MARKETING' })}>Find another lead →</button><QuickSim runtime={runtime} /></div></RoomFrame>;
}

function QuickSim({ runtime }: { runtime: GameRuntime }) {
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    let frame = 0;
    const advance = () => {
      if (runtime.snapshot.state.clock.phase !== 'ACTIVE' || runtime.snapshot.state.clock.paused) { setRunning(false); return; }
      runtime.advanceTicks(40);
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [running, runtime]);
  return <button className="quick-sim" disabled={runtime.snapshot.state.clock.phase !== 'ACTIVE' || runtime.snapshot.state.clock.paused} onClick={() => setRunning(value => !value)}>{running ? 'Stop fast forward' : 'Fast forward to review'}<small>Time and obligations advance</small></button>;
}

function CompanyView({ state, enter, runtime }: { state: RunState; enter: (id: FunctionId) => void; runtime: GameRuntime }) {
  const rooms = selectGoldenRooms(state);
  const next = rooms.find((room) => room.unlocked && room.queue > 0 && room.id !== 'MARKETING') ?? rooms.find((room) => room.unlocked && room.queue > 0) ?? rooms[0];
  return <section className="company-world">
    <div className="company-intro"><span className="kicker">A SMALL FOUNDER. A LARGER TOMORROW.</span><h1>Build a company.<br /><em>Become the outlier.</em></h1><p>Ship. Learn. Automate.<br />Survive the company you create.</p></div>
    <div className="company-chapter"><span>CHAPTER {String(state.clock.quarterIndex).padStart(2, '0')}</span><strong>{state.cohorts.customers.length ? 'Something worth growing.' : 'Find your first believers.'}</strong><small>{formatClock(quarterDuration(state) - state.clock.tickInQuarter)} until quarter review</small><QuickSim runtime={runtime} /></div>

    <div className="founder-next"><div><span>YOUR NEXT MOVE</span><strong>{next.id === 'MARKETING' ? 'Find a problem worth solving.' : `Your ${next.name.toLowerCase()} work is waiting.`}</strong><small>One founder. Your attention is the scarce resource.</small></div><button onClick={() => enter(next.id)}>Enter {next.name} <span>→</span></button></div>
  </section>;
}

function MarketingRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const sequence = MARKETING_SIGNAL_IDS.map((_, offset) => MARKETING_SIGNAL_IDS[(state.clock.quarterIndex - 1 + offset) % MARKETING_SIGNAL_IDS.length]);
  const quarterStartTick = state.clock.tick - state.clock.tickInQuarter;
  const resolvedSignalIds = new Set([
    ...state.cohorts.demand.filter((cohort) => cohort.createdAtTick >= quarterStartTick).map((cohort) => String(cohort.sourceId)),
    ...state.outcome.milestones.filter((milestone) => milestone.startsWith(`Q${state.clock.quarterIndex}:MARKETING_IGNORED:`)).map((milestone) => milestone.split(':').at(-1) ?? ''),
  ]);
  const signalId = sequence.find((id) => !resolvedSignalIds.has(id));
  const signal = signalId ? contentById.get(asContentId(signalId)) as MarketingSignalContent : undefined;
  const resolved = !signal;
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const origin = useRef({ x: 0, y: 0 });
  const committed = useRef(false);
  useEffect(() => { committed.current = false; }, [signalId]);
  if (!signal) return <RoomFrame eyebrow="MARKETING · QUEUE CLEARED" title="Every current lead has a decision." instruction="The quarter can now close naturally, or you can clear the work already moving through Product and Monetization."><div className="retention-empty"><span>LEADS / {String(sequence.length).padStart(2, '0')}</span><strong>{state.functions.PRODUCT.queue.length + state.functions.MONETIZATION.queue.length ? 'Downstream work is still waiting.' : 'No untriaged demand remains this quarter.'}</strong></div></RoomFrame>;
  const intent = drag.y < -55 && Math.abs(drag.y) > Math.abs(drag.x) * .72 ? 'aggressive' : drag.x > 54 ? 'pursue' : drag.x < -54 ? 'ignore' : null;
  const resolve = (decision: 'ignore' | 'pursue' | 'aggressive') => {
    if (committed.current || resolved) return;
    committed.current = true;
    setDrag({ x: 0, y: 0, active: false });
    const type = decision === 'ignore' ? 'MARKETING_OPPORTUNITY_IGNORED' : decision === 'aggressive' ? 'MARKETING_OPPORTUNITY_AGGRESSIVELY_PURSUED' : 'MARKETING_OPPORTUNITY_PURSUED';
    const result = runtime.dispatch(type, { opportunityId: signal.id });
    if (result.events.some(event => event.type === 'ACTION_REJECTED')) committed.current = false;
  };
  const down = (event: ReactPointerEvent<HTMLDivElement>) => { if (resolved) return; origin.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); setDrag({ x: 0, y: 0, active: true }); };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => { if (!drag.active) return; setDrag({ x: Math.max(-220, Math.min(220, event.clientX - origin.current.x)), y: Math.max(-170, Math.min(80, event.clientY - origin.current.y)), active: true }); };
  const up = () => { if (intent) resolve(intent); else setDrag({ x: 0, y: 0, active: false }); };
  return <RoomFrame eyebrow={`MARKETING · LEAD ${resolvedSignalIds.size + 1}/${sequence.length}`} title="Read the signal." instruction="Swipe left to ignore, right to pursue, or up to pursue aggressively. Multiple qualified leads can flow in one quarter.">
    <div className={`gesture-label left ${intent === 'ignore' ? 'ready' : ''}`}>← <b>IGNORE</b></div><div className={`gesture-label right ${intent === 'pursue' ? 'ready' : ''}`}><b>PURSUE</b> →</div><div className={`gesture-label up ${intent === 'aggressive' ? 'ready' : ''}`}>↑<b>AGGRESSIVE</b></div>
    <div className="signal-card-stack" aria-hidden="true" />
    <div className="signal-card" key={signalId} data-dragging={drag.active} style={{ transform: `translate3d(${drag.x}px,${drag.y}px,0) rotate(${Math.max(-5, Math.min(5, drag.x / 35))}deg)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => setDrag({ x: 0, y: 0, active: false })} onLostPointerCapture={() => setDrag({ x: 0, y: 0, active: false })} onKeyDown={(event) => { if (event.key === 'ArrowLeft') resolve('ignore'); if (event.key === 'ArrowRight') resolve('pursue'); if (event.key === 'ArrowUp') resolve('aggressive'); }} tabIndex={0} role="group" aria-label={`${signal.name}. Swipe or use arrow keys to decide.`}>
      <div className="object-head"><span>SIGNAL / Q{String(state.clock.quarterIndex).padStart(2, '0')}</span><b>{signal.quality} READ</b></div><div className="signal-wave">{[31,56,42,78,48,91,63,36,71,52,84,46].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
      <small>{signal.segment.replaceAll('_', ' ')} · {signal.tags.join(' · ')}</small><h2>{signal.name}.</h2><p>{signal.description}</p>
      <dl><Fact label="Audience" value={signal.revealed.audienceFit} /><Fact label="Intent" value={signal.revealed.purchaseIntent} /><Fact label="Velocity" value={signal.revealed.trendVelocity} /><Fact label="Saturation" value={signal.revealed.saturation} /></dl><div className="object-foot"><span>ACQUISITION COST</span><strong>{formatCash(signal.pursueCostCents.value)}</strong></div>
    </div>
  </RoomFrame>;
}

function ProductRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const request = state.functions.PRODUCT.queue[0];
  const recipe = request ? contentById.get(request.contentId) as ProductRecipeContent : undefined;
  const active = state.functions.PRODUCT.activeRecipe;
  const placed = active?.placedComponentIds ?? [];
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null);
  const dragOrigin = useRef({ x: 0, y: 0 });
  if ((!request || !recipe) && !state.functions.MONETIZATION.queue.length) return <EmptyWork runtime={runtime} title="Your build queue is clear." detail="Marketing finds customer needs. They arrive here as requests to assemble." />;
  if (!request || !recipe) { const activation = state.cohorts.activated.at(-1); const shippedRecipe = activation ? contentById.get(activation.recipeId) as ProductRecipeContent : undefined; return <RoomFrame eyebrow="PRODUCT · PROVED" title="Activation is ready." instruction="The verified build preserved Product quality and routed an Activation cohort into pricing."><div className="proof-object cyan"><span>ACTIVATED COHORT · Q{state.clock.quarterIndex}</span><strong>{shippedRecipe?.name ?? 'Verified product'}</strong><p>Verified · {activation ? Math.round(activation.productQualityPpm / 10_000) : 0}% product quality · {activation?.implementationRiskPpm ? 'early-ship risk active' : 'no early-ship risk'}</p><div className="route-line"><i /> ROUTED TO MONETIZATION <i /></div></div><button className="stage-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'MONETIZATION' })}>Enter Monetization <span>→</span></button></RoomFrame>; }
  const labelFor = (id: string) => id.replace('component.', '').replaceAll('-', ' ').toUpperCase();
  const place = (componentId: string, slotId: string) => { runtime.dispatch('PRODUCT_COMPONENT_PLACED', { requestId: request.id, componentId: asContentId(componentId), slotId: asEntityId(slotId) }); setSelected(null); };
  const drop = (event: ReactPointerEvent<HTMLButtonElement>, componentId: string) => { const target = document.elementsFromPoint(event.clientX, event.clientY).map((element) => element.closest<HTMLElement>('[data-slot]')).find(Boolean); if (target?.dataset.slot) place(componentId, target.dataset.slot); setDragging(null); };
  const complete = placed.length === recipe.componentIds.length;
  return <RoomFrame eyebrow="PRODUCT · DO" title="Assemble the request." instruction="Place each component in its logical slot. Test before shipping to protect customer health.">
    <div className="recipe-bench">
      <div className="recipe-name"><span>REQUEST / Q{String(state.clock.quarterIndex).padStart(2, '0')}</span><strong>{recipe.name.toUpperCase()}</strong><small>{placed.length} / {recipe.componentIds.length} COMPONENTS</small></div>
      <div className="recipe-slots">{recipe.slotIds.map((slotId, index) => { const component = recipe.componentIds[index]; const filled = placed.includes(component); return <button key={slotId} data-slot={slotId} className={filled ? 'filled' : ''} onClick={() => selected && place(selected, slotId)}><span>{String(index + 1).padStart(2, '0')} · {slotId.toUpperCase()}</span><strong>{filled ? labelFor(component) : 'DROP COMPONENT'}</strong></button>; })}</div>
      <div className="component-tray" aria-label="Product components">{recipe.componentIds.map((id) => <button key={id} disabled={placed.includes(id)} className={selected === id ? 'selected' : ''} style={dragging?.id === id ? { transform: `translate3d(${dragging.x}px,${dragging.y}px,0)`, zIndex: 8 } : undefined} onClick={() => setSelected(id)} onPointerDown={(event) => { dragOrigin.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); setSelected(id); setDragging({ id, x: 0, y: 0 }); }} onPointerMove={(event) => { if (dragging?.id !== id) return; setDragging({ id, x: event.clientX - dragOrigin.current.x, y: event.clientY - dragOrigin.current.y }); }} onPointerUp={(event) => drop(event, id)} onPointerCancel={() => setDragging(null)}><i /><span>{labelFor(id)}</span><small>{placed.includes(id) ? 'LOCKED' : 'DRAG'}</small></button>)}</div>
      <div className="product-actions"><button disabled={!complete || Boolean(active?.tested)} onClick={() => runtime.dispatch('PRODUCT_RECIPE_TESTED', { requestId: request.id })}>{active?.tested ? 'VERIFIED' : 'TEST BUILD'}</button><button disabled={!complete} className="ship" onClick={() => runtime.dispatch('PRODUCT_RECIPE_SHIPPED', { requestId: request.id, mode: active?.verified ? 'VERIFIED' : 'EARLY' })}>{active?.verified ? 'SHIP VERIFIED' : 'SHIP EARLY'}</button></div>
    </div>
  </RoomFrame>;
}

function MonetizationRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const pricing = state.functions.MONETIZATION.queue[0];
  const customerType = pricing ? contentById.get(pricing.contentId) as CustomerArchetypeContent : undefined;
  if ((!pricing || !customerType) && !state.functions.RETENTION.queue.some(item => item.metadata.resolved !== true)) return <EmptyWork runtime={runtime} title="No quotes waiting." detail="Ship a product to create an opportunity, then return here to make the offer." />;
  if (!pricing || !customerType) { const customer = state.cohorts.customers.at(-1); return <RoomFrame eyebrow="MONETIZATION · PROVED" title="Customer ARR booked." instruction="Your product has a paying customer. Protect the relationship, then find the next opportunity."><div className="arr-proof"><span>NEW CUSTOMER ARR · Q{state.clock.quarterIndex}</span><strong>+{formatDollars(state.economy.newCustomerArrQTD)}</strong><p>{customer?.pricingModel} · {customer?.segment.replaceAll('_', ' ')} · cash collected separately</p></div>{state.functions.RETENTION.unlocked && <button className="stage-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'RETENTION' })}>Enter Retention <span>→</span></button>}</RoomFrame>; }
  const cycle = V2_GOLDEN_BALANCE.tuning.pricingCycleTicks.value;
  const position = (state.clock.tick % cycle) * 100 / cycle;
  const inPerfect = position >= customerType.perfectBandStartPpm.value / 10_000 && position <= customerType.perfectBandEndPpm.value / 10_000;
  return <RoomFrame eyebrow="MONETIZATION · DO" title="Price the moment." instruction="Tap when the cursor reaches the bright band. Better timing earns a better contract.">
    <div className="pricing-rig">
      <div className="pricing-customer"><span>ACTIVATION / Q{String(state.clock.quarterIndex).padStart(2, '0')}</span><strong>{customerType.name}</strong><small>{customerType.pricingModel.replace('_', '-')} MODEL · {formatDollars(customerType.baseArr.value)} BASE ARR</small></div>
      <div className="pricing-scale" style={{ gridTemplateColumns: `${Math.max(0, customerType.perfectBandStartPpm.value - 180_000)}fr 180000fr ${customerType.perfectBandEndPpm.value - customerType.perfectBandStartPpm.value}fr 180000fr ${Math.max(0, 1_000_000 - customerType.perfectBandEndPpm.value - 180_000)}fr` }}><div className="zone cheap">TOO CHEAP</div><div className="zone good">GOOD</div><div className="zone perfect">PERFECT</div><div className="zone good">GOOD</div><div className="zone expensive">TOO EXPENSIVE</div><i className="pricing-cursor" style={{ left: `${position}%`, transition: position === 0 ? 'none' : undefined }} /></div>
      <div className="pricing-readout"><span>LIVE QUOTE</span><strong>{formatDollars(Math.floor(customerType.baseArr.value * (inPerfect ? V2_GOLDEN_BALANCE.tuning.pricingPerfectMultiplierPpm.value : position >= (customerType.perfectBandStartPpm.value - 180_000) / 10_000 && position <= (customerType.perfectBandEndPpm.value + 180_000) / 10_000 ? V2_GOLDEN_BALANCE.tuning.pricingGoodMultiplierPpm.value : V2_GOLDEN_BALANCE.tuning.pricingPoorMultiplierPpm.value) / 1_000_000))}</strong><small>{inPerfect ? 'PERFECT BAND' : 'WAIT FOR FIT'}</small></div>
      <button className={inPerfect ? 'lock-price hot' : 'lock-price'} onClick={() => runtime.dispatch('MONETIZATION_PRICE_COMMITTED', { activationId: pricing.id, cursorTick: state.clock.tick })}>LOCK PRICE <span>PRESS / TAP</span></button>
    </div>
  </RoomFrame>;
}

function RetentionRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const queue = state.functions.RETENTION.queue;
  const accounts = state.cohorts.customers.filter(account => queue.some(threat => String(threat.sourceEntityId) === String(account.id)));
  const customer = accounts.find(account => account.id === selectedAccount) ?? accounts.find(account => queue.some(threat => String(threat.sourceEntityId) === String(account.id) && threat.metadata.resolved !== true)) ?? accounts[0] ?? state.cohorts.customers.at(-1);
  const threats = queue.filter(threat => String(threat.sourceEntityId) === String(customer?.id));
  const activeThreats = threats.filter((threat) => threat.metadata.resolved !== true);
  const resolvedThreat = threats.find((threat) => threat.metadata.resolved === true);
  const allResolved = activeThreats.length === 0 && Boolean(resolvedThreat);
  const [aim, setAim] = useState({ x: 50, y: 50 });
  const [lockedId, setLockedId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const field = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const position = (threatId: string) => {
    const fixture = RETENTION_THREAT_FIXTURES.find((item) => (item.id === threatId || threatId.startsWith(`${item.id}-`))) ?? RETENTION_THREAT_FIXTURES[0];
    const travel = (fixture.phase + (reducedMotion ? 0 : state.clock.tick * fixture.speed)) % 152;
    return { x: 12 + (travel <= 76 ? travel : 152 - travel), y: fixture.lane };
  };
  const pointFromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const bounds = field.current?.getBoundingClientRect();
    if (!bounds) return aim;
    return { x: Math.max(0, Math.min(100, (event.clientX - bounds.left) * 100 / bounds.width)), y: Math.max(0, Math.min(100, (event.clientY - bounds.top) * 100 / bounds.height)) };
  };
  const prioritize = (threatId: string) => {
    if (!customer) return;
    setLockedId(threatId);
    runtime.dispatch('RETENTION_THREAT_PRIORITIZED', { threatId: asQueueItemId(threatId), customerId: customer.id });
  };
  const autoFire = (point = aim) => {
    if (!activeThreats.length) return;
    const closest = activeThreats.map((threat) => {
      const target = position(threat.id);
      return { threat, distance: Math.hypot(target.x - point.x, target.y - point.y) };
    }).sort((a, b) => a.distance - b.distance)[0];
    if (closest.distance <= 30) prioritize(closest.threat.id);
  };
  if (customer && !threats.length) return <EmptyWork runtime={runtime} title="Your customers are settled." detail="No intervention is waiting. Use your attention to develop the next opportunity." />;
  if (!customer) return <RoomFrame eyebrow="RETENTION · WAITING" title="Nothing to defend yet." instruction="Retention unlocks when the first customer creates ARR worth protecting."><div className="retention-empty"><span>NO CUSTOMER ARR</span><strong>Acquire before you defend.</strong></div></RoomFrame>;
  return <RoomFrame eyebrow="RETENTION · AIM" title="Protect what you earned." instruction="Aim at a moving churn threat. Your intervention auto-fires on the prioritized target.">
    <div className="retention-console">
      {accounts.length > 1 && <div className="retention-accounts" role="group" aria-label="Customer accounts">{accounts.map(account => <button key={account.id} aria-pressed={customer.id === account.id} onClick={() => { setSelectedAccount(account.id); setLockedId(null); }}><strong>Account {String(account.id).replace('customer-', '')}</strong><span>{queue.filter(threat => String(threat.sourceEntityId) === String(account.id) && threat.metadata.resolved !== true).length} open</span></button>)}</div>}
      <div className="retention-status"><span>CUSTOMER SUCCESS · ACCOUNT {String(customer.id).replace('customer-', '')}</span><strong>{allResolved ? 'ACCOUNT PROTECTED' : `${activeThreats.length} THREATS REMAINING`}</strong><small>{resolvedThreat ? `${formatDollars(customer.currentArr)} existing ARR protected · $0 ARR created` : 'Move the reticle, then release over a target'}</small></div>
      <div ref={field} className={`threat-field ${allResolved ? 'has-save' : ''}`} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setAim(pointFromPointer(event)); }} onPointerMove={(event) => setAim(pointFromPointer(event))} onPointerUp={(event) => { const point = pointFromPointer(event); setAim(point); autoFire(point); }} aria-label="Retention threat field">
        <div className="field-grid" aria-hidden="true" />
        <div className="retention-reticle" style={{ left: `${aim.x}%`, top: `${aim.y}%` }} aria-hidden="true"><i /><b /></div>
        {threats.map((threat) => { const point = position(threat.id); const isResolved = threat.metadata.resolved === true; return <button key={threat.id} className={`churn-target ${isResolved ? 'resolved' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} disabled={isResolved} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); prioritize(threat.id); }} aria-label={`Prioritize ${String(threat.metadata.label)}. ${String(threat.metadata.urgency)} churn threat.`}><i /><span>{isResolved ? 'HELD' : String(threat.metadata.urgency)}</span><strong>{String(threat.metadata.label)}</strong><small>{String(threat.metadata.cause)}</small></button>; })}
        {allResolved && <div className="retention-save"><span>INTERVENTION LANDED</span><strong>{String(resolvedThreat?.metadata.label)} contained.</strong><small>Retention protected existing value. It did not create positive ARR.</small></div>}
      </div>
      <div className="retention-footer"><span>AUTO-FIRE / ARMED</span><b>{lockedId || resolvedThreat ? 'TARGET RESOLVED' : 'NO TARGET LOCK'}</b><small>Tap a threat or use Tab + Enter</small></div>
      {resolvedThreat && <button className="stage-action retention-route" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'EXPANSION' })}>Enter Expansion <span>→</span></button>}
    </div>
  </RoomFrame>;
}

function ExpansionRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const need = state.functions.EXPANSION.queue.find(item => item.metadata.committed !== true) ?? state.functions.EXPANSION.queue.at(-1);
  const customer = state.cohorts.customers.find((item) => String(item.id) === String(need?.sourceEntityId)) ?? state.cohorts.customers.at(-1);
  const customerArchetype = customer ? V2_GOLDEN_CONTENT.entries.find((entry) => entry.kind === 'CUSTOMER_ARCHETYPE' && entry.segment === customer.segment) as CustomerArchetypeContent | undefined : undefined;
  const customerName = customerArchetype?.name ?? 'Customer account';
  const [dragging, setDragging] = useState<{ id: string; type: 'module' | 'output'; x: number; y: number } | null>(null);
  const dragOrigin = useRef({ x: 0, y: 0 });
  if (!need || !customer) return <EmptyWork runtime={runtime} title="No packages waiting." detail="Protect a customer relationship to uncover an expansion need." />;

  if (need.metadata.committed === true) return <RoomFrame eyebrow="EXPANSION · PROVED" title="The account package fits." instruction="The committed package made a bounded expansion change. Operations now owns the added surface area."><div className="proof-object violet"><span>ACCOUNT FIT COMMITTED</span><strong>{customerName} expanded.</strong><p>Customer ARR changed through the package fit. The next obligation is now explicit.</p><div className="route-line"><i /> ROUTED TO OPERATIONS <i /></div></div><button className="stage-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'OPERATIONS' })}>Enter Operations <span>→</span></button></RoomFrame>;
  const outputs = Array.isArray(need.metadata.mergedOutputs) ? need.metadata.mergedOutputs.map(String) : [];
  const placed = Array.isArray(need.metadata.placedItems) ? need.metadata.placedItems.map(String) : [];
  const packageId = asEntityId(String(need.metadata.packageId));
  const startDrag = (event: ReactPointerEvent<HTMLElement>, id: string, type: 'module' | 'output') => {
    dragOrigin.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging({ id, type, x: 0, y: 0 });
  };
  const moveDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging) return;
    setDragging({ ...dragging, x: event.clientX - dragOrigin.current.x, y: event.clientY - dragOrigin.current.y });
  };
  const endDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!dragging) return;
    const targets = document.elementsFromPoint(event.clientX, event.clientY);
    if (dragging.type === 'module') {
      const target = targets.map((element) => element.closest<HTMLElement>('[data-expansion-module]')).find(Boolean);
      const secondId = target?.dataset.expansionModule;
      if (secondId && secondId !== dragging.id) runtime.dispatch('EXPANSION_ITEMS_MERGED', { firstItemId: asEntityId(dragging.id), secondItemId: asEntityId(secondId), cellId: asEntityId('expansion-merge-bench') });
    } else {
      const target = targets.map((element) => element.closest<HTMLElement>('[data-expansion-slot]')).find(Boolean);
      const slot = target?.dataset.expansionSlot;
      if (slot === dragging.id) runtime.dispatch('EXPANSION_PACKAGE_ITEM_PLACED', { packageId, itemId: asEntityId(dragging.id), slotId: asEntityId(`account-fit-${slot}`) });
    }
    setDragging(null);
  };
  const ready = ['intelligence', 'workflow'].every((item) => placed.includes(item));
  return <RoomFrame eyebrow="EXPANSION · MERGE" title="Make the account fit." instruction="Drag matching generator modules together, then drag each merged capability into its matching customer need.">
    <div className="expansion-console">
      <div className="fixture-strip"><span>CUSTOMER SUCCESS</span><b>{String(need.metadata.need)}</b></div>
      <div className="generator-grid merge-board" aria-label="Expansion merge board">{EXPANSION_MODULE_FIXTURES.map((module) => <button key={module.id} data-expansion-module={module.id} className={dragging?.id === module.id ? 'dragging' : ''} onPointerDown={(event) => startDrag(event, module.id, 'module')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => setDragging(null)} aria-label={`Drag ${module.label} onto its matching module to merge`}><span>GENERATOR</span><strong>{module.label}</strong><small>DRAG TO MATCH</small></button>)}</div>
      <div className="merge-output"><span>MERGED CAPABILITIES</span><div>{outputs.length ? outputs.map((output) => <button key={output} disabled={placed.includes(output)} className={dragging?.id === output ? 'dragging' : ''} onPointerDown={(event) => startDrag(event, output, 'output')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => setDragging(null)}><i />{output.toUpperCase()}<small>{placed.includes(output) ? 'IN PACKAGE' : 'DRAG TO NEED'}</small></button>) : <p>Drag matching modules together to create a capability.</p>}</div></div>
      <div className="package-fit"><div><span>ACCOUNT / {customerName.toUpperCase()}</span><strong>{formatDollars(customer.currentArr)} current ARR</strong></div><div data-expansion-slot="intelligence" className={placed.includes('intelligence') ? 'fit-slot filled' : 'fit-slot'}>INTELLIGENCE <b>{placed.includes('intelligence') ? 'FIT' : 'DROP INTELLIGENCE'}</b></div><div data-expansion-slot="workflow" className={placed.includes('workflow') ? 'fit-slot filled' : 'fit-slot'}>WORKFLOW <b>{placed.includes('workflow') ? 'FIT' : 'DROP WORKFLOW'}</b></div></div>
      {dragging && <div className="merge-drag-ghost" style={{ transform: `translate3d(${dragging.x}px,${dragging.y}px,0)` }}>{dragging.id.replaceAll('-', ' ').toUpperCase()}</div>}
      <button className="stage-action expansion-commit" disabled={!ready} onClick={() => runtime.dispatch('EXPANSION_PACKAGE_COMMITTED', { packageId, customerId: customer.id })}>Commit account fit <span>→</span></button>
    </div>
  </RoomFrame>;
}

function OperationsRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const obligation = state.functions.OPERATIONS.queue[0];
  const [scratchProgress, setScratchProgress] = useState<Record<string, number>>({});
  const [rejected, setRejected] = useState(false);
  const scratchStarts = useRef<Record<string, { x: number; y: number; distance: number }>>({});
  const rejectOrigin = useRef({ x: 0, y: 0 });
  const [rejectDrag, setRejectDrag] = useState<{ x: number; y: number } | null>(null);
  if (!obligation) return <RoomFrame eyebrow="OPERATIONS · PROVED" title="The obligation is resolved." instruction="Evidence became an explicit operational decision. Finance can now determine the next capital move."><div className="proof-object lime"><span>RETRY STORM CONTAINED</span><strong>Obligation closed.</strong><p>The recovery changed operational pressure, not ARR.</p><div className="route-line"><i /> ROUTED TO FINANCE <i /></div></div><button className="stage-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'FINANCE' })}>Enter Finance <span>→</span></button></RoomFrame>;
  const revealed = Array.isArray(obligation.metadata.revealedCells) ? obligation.metadata.revealedCells.map(String) : [];
  const reveal = (cellId: string) => { if (!revealed.includes(cellId)) runtime.dispatch('OPERATIONS_EVIDENCE_REVEALED', { obligationId: obligation.id, cellId: asEntityId(cellId) }); };
  const optimizerId = asQueueItemId(String(obligation.metadata.optimizerId));
  const beginScratch = (event: ReactPointerEvent<HTMLDivElement>, id: string) => { event.currentTarget.setPointerCapture(event.pointerId); scratchStarts.current[id] = { x: event.clientX, y: event.clientY, distance: 0 }; setScratchProgress((current) => ({ ...current, [id]: Math.max(current[id] ?? 0, 4) })); };
  const scratch = (event: ReactPointerEvent<HTMLDivElement>, id: string) => {
    const start = scratchStarts.current[id];
    if (!start || revealed.includes(id)) return;
    const dx = event.clientX - start.x; const dy = event.clientY - start.y;
    start.distance += Math.hypot(dx, dy); start.x = event.clientX; start.y = event.clientY;
    const progress = Math.min(100, Math.round(start.distance / 1.5));
    setScratchProgress((current) => ({ ...current, [id]: progress }));
    if (progress >= 100) { delete scratchStarts.current[id]; reveal(id); }
  };
  const discard = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!rejectDrag) return;
    const trash = document.elementsFromPoint(event.clientX, event.clientY).map((element) => element.closest<HTMLElement>('[data-ops-trash]')).find(Boolean);
    if (trash) { runtime.dispatch('OPERATIONS_OPTIMIZER_DISMISSED', { optimizerId }); setRejected(true); }
    setRejectDrag(null);
  };
  return <RoomFrame eyebrow="OPERATIONS · SCRATCH" title="Install the safe mechanisms." instruction="Scratch a whole positive mechanism to unlock it. This card is already all downside: drag it into the trash, do not scratch it.">
    <div className="ops-console">
      <div className="fixture-strip"><span>CUSTOMER SUCCESS</span><b>{String(obligation.metadata.label)}</b></div>
      <div className="evidence-grid scratch-grid" aria-label="Scratch safe operating mechanisms">{OPERATIONS_EVIDENCE_FIXTURES.map((evidence) => {
        const isRevealed = revealed.includes(evidence.id);
        const progress = isRevealed ? 100 : scratchProgress[evidence.id] ?? 0;
        return <div key={evidence.id} className={isRevealed ? 'scratch-card revealed' : 'scratch-card'} style={{ '--scratch-progress': `${progress}%` } as React.CSSProperties} onPointerDown={(event) => beginScratch(event, evidence.id)} onPointerMove={(event) => scratch(event, evidence.id)} onPointerUp={() => { delete scratchStarts.current[evidence.id]; }} onPointerCancel={() => { delete scratchStarts.current[evidence.id]; }} tabIndex={0} role="button" onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setScratchProgress((current) => ({ ...current, [evidence.id]: 100 })); reveal(evidence.id); } }} aria-label={`${isRevealed ? 'Unlocked' : 'Scratch to unlock'} ${evidence.label}`}><span>{isRevealed ? 'MECHANISM UNLOCKED' : `${progress}% SCRATCHED`}</span><strong>{evidence.label}</strong><p>{isRevealed ? evidence.finding : 'Scratch the entire surface to install this protection.'}</p></div>;
      })}</div>
      <div className="optimizer-card rejection-zone"><div><span>ALL NEGATIVE · DO NOT SCRATCH</span><strong>{rejected ? 'Rejected unsafe shortcut' : 'Unlimited retries'}</strong><p>{rejected ? 'The shortcut cannot contaminate the operating system.' : 'Every hidden outcome increases failure pressure. Drag this card into the trash.'}</p></div>{!rejected && <div className="reject-card" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); rejectOrigin.current = { x: event.clientX, y: event.clientY }; setRejectDrag({ x: 0, y: 0 }); }} onPointerMove={(event) => rejectDrag && setRejectDrag({ x: event.clientX - rejectOrigin.current.x, y: event.clientY - rejectOrigin.current.y })} onPointerUp={discard} onPointerCancel={() => setRejectDrag(null)} style={{ transform: rejectDrag ? `translate(${rejectDrag.x}px, ${rejectDrag.y}px)` : undefined }} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); runtime.dispatch('OPERATIONS_OPTIMIZER_DISMISSED', { optimizerId }); setRejected(true); } }} aria-label="Drag Unlimited retries to the trash"><span>UNSAFE</span><b>DRAG TO TRASH</b></div>}<div className="ops-trash" data-ops-trash aria-label="Trash unsafe card"><i /><small>REJECT</small></div></div>
      <button className="stage-action ops-resolve" disabled={revealed.length < OPERATIONS_EVIDENCE_FIXTURES.length} onClick={() => runtime.dispatch('OPERATIONS_RESOLUTION_CHOSEN', { obligationId: obligation.id, resolutionId: asContentId('resolution.cap-retries') })}>Resolve obligation <span>→</span></button>
    </div>
  </RoomFrame>;
}

function DebtControls({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const debt = state.capital.debt.find(item => item.status === 'ACTIVE');
  const instrument = V2_GOLDEN_CONTENT.entries.find(entry => entry.kind === 'FINANCE_INSTRUMENT' && entry.id === 'finance.runway-note');
  return <div className="debt-panel"><div><span>RUNWAY NOTE</span><strong>{debt ? `${formatCash(debt.principalCents)} outstanding` : 'Optional financing'}</strong><small>{instrument?.kind === 'FINANCE_INSTRUMENT' ? `${formatCash(instrument.principalCents.value)} principal · ${(instrument.aprBps.value / 100).toFixed(1)}% APR` : 'Debt adds cash and a repayment obligation.'}</small></div>{debt ? <button disabled={state.economy.cash <= 0} onClick={() => runtime.dispatch('FINANCE_PRINCIPAL_PAID', { instrumentId: debt.instrumentId, amountCents: Math.min(state.economy.cash, debt.principalCents) })}>{state.economy.cash < debt.principalCents ? 'Pay available cash' : 'Repay principal'}</button> : <button onClick={() => runtime.dispatch('FINANCE_DEBT_DRAWN', { instrumentId: asContentId('finance.runway-note') })}>Borrow runway cash</button>}</div>;
}

function FinanceRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const offer = state.functions.FINANCE.queue[0];
  const debt = state.capital.debt.find((item) => item.status === 'ACTIVE');
  if (!offer) return <RoomFrame eyebrow="FINANCE · LIVE" title="Capital decision recorded." instruction="Cash, ownership, and debt remain separate from ARR. Your company keeps running while you decide."><div className="finance-proof"><span>CAPITAL LEDGER</span><strong>{formatCash(state.economy.cash)}</strong><p>{(state.capital.founderOwnershipBps / 100).toFixed(1)}% founder ownership · {debt ? `${formatCash(debt.principalCents)} debt active` : 'No active debt'}</p></div><DebtControls runtime={runtime} state={state} /><div className="waiting-quarter finance-wait"><span>Q{state.clock.quarterIndex} AUTO-CLOSE</span><b>{formatClock(quarterDuration(state) - state.clock.tickInQuarter)}</b><div><i style={{ width: `${Math.min(100, state.clock.tickInQuarter * 100 / quarterDuration(state))}%` }} /></div></div></RoomFrame>;
  const opened = offer.metadata.opened === true;
  const resolved = offer.metadata.resolved === true;
  const check = Number(offer.metadata.checkCents);
  const dilution = Number(offer.metadata.dilutionBps);
  return <RoomFrame eyebrow="FINANCE · COMMIT" title="Choose the capital shape." instruction="Inspect, counter, accept, pass, or use debt. Capital decisions never create ARR directly.">
    <div className="finance-console">
      <div className="fixture-strip"><span>CAPITAL OFFER</span><b>{String(offer.metadata.label)}</b></div>
      <div className="capital-terms"><div><span>SAFE CHECK</span><strong>{formatCash(check)}</strong></div><div><span>FOUNDER DILUTION</span><strong>{(dilution / 100).toFixed(1)}%</strong></div><div><span>ARR EFFECT</span><strong>NONE</strong></div></div>
      <div className="finance-actions"><button disabled={opened || resolved} onClick={() => runtime.dispatch('FINANCE_OFFER_OPENED', { offerId: offer.id })}>Inspect SAFE</button><button disabled={!opened || resolved} onClick={() => runtime.dispatch('FINANCE_OFFER_COUNTERED', { offerId: offer.id, targetDilutionBps: 550 as never })}>Counter 5.5%</button><button className="accept" disabled={!opened || resolved} onClick={() => runtime.dispatch('FINANCE_OFFER_ACCEPTED', { offerId: offer.id })}>Accept capital</button><button disabled={!opened || resolved} onClick={() => runtime.dispatch('FINANCE_OFFER_PASSED', { offerId: offer.id })}>Pass</button></div>
      <DebtControls runtime={runtime} state={state} />
      {resolved && <div className="finance-receipt"><span>CAPITAL DECISION COMMITTED</span><strong>{formatCash(state.economy.cash)} cash · {(state.capital.founderOwnershipBps / 100).toFixed(1)}% founder ownership</strong><small>The seven-function circuit is complete. ARR was unchanged by Finance.</small></div>}
    </div>
  </RoomFrame>;
}

function QuarterClose({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  if (state.quarter.closeStage === 'RESULTS') return <QuarterResults runtime={runtime} state={state} />;
  if (state.quarter.closeStage === 'WHAT_CHANGED') return <QuarterRelicChoice runtime={runtime} state={state} />;
  if (state.quarter.closeStage === 'STRATEGY') return <QuarterStrategyChoice runtime={runtime} state={state} />;
  return <QuarterInvestment runtime={runtime} state={state} />;
}

function QuarterResults({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  return <div className="quarter-close quarter-results">
    <QuarterPhase phase="01 / 04" label="RESULTS" />
    <h1>{state.quarter.mandateMet ? 'The promise held.' : 'The promise broke.'}</h1><p className="quarter-sub">The machine is paused. Read what changed before choosing the next operating posture.</p>
    <div className="arr-equation full-bridge"><Equation label="Starting ARR" value={state.quarter.startingArr} /><i>+</i><Equation label="New customer" value={state.quarter.newCustomerArr} positive /><i>+</i><Equation label="Expansion" value={state.quarter.expansionArr} positive /><i>−</i><Equation label="Churned" value={state.quarter.churnedArr} /><i>=</i><Equation label="Ending ARR" value={state.quarter.endingArr} total /></div>
    <div className="quarter-facts"><div><span>ACTUAL GROWTH</span><b>{(state.quarter.growthBps / 100).toFixed(1)}%</b></div><div><span>MANDATE</span><b>{((state.header.growthMandateBps ?? 0) / 100).toFixed(0)}% · {state.quarter.mandateMet ? 'MET' : 'MISSED'}</b></div><div><span>VALUATION</span><b>{formatDollars(state.economy.valuation)}</b><small>{(state.economy.growthMultipleBps / 10_000).toFixed(1)}× ARR</small></div></div>
    <button className="primary-action quarter-advance" onClick={() => runtime.dispatch('QUARTER_RESULTS_REVIEWED', {})}>Inspect what changed <span>→</span></button>
  </div>;
}

function QuarterRelicChoice({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const relics = V2_GOLDEN_CONTENT.entries.filter((entry): entry is RelicContent => entry.kind === 'RELIC');
  return <div className="quarter-close quarter-decision">
    <QuarterPhase phase="02 / 04" label="WHAT CHANGED?" />
    <h1>Something stuck.</h1><p className="quarter-sub">This is a permanent, run-specific rule change. It is not a skill purchase.</p>
    <div className="decision-cards" aria-label="What Changed choices">{relics.map((relic) => <RelicCard key={relic.id} relic={relic} state={state} onChoose={() => runtime.dispatch('QUARTER_RELIC_CHOSEN', { relicId: relic.id })} />)}</div>
    <div className="decision-footer"><p>Only currently eligible changes can enter this run. The calibration slice has a small pool, so declining is always explicit.</p><button className="quiet-action" onClick={() => runtime.dispatch('QUARTER_RELICS_SKIPPED', {})}>No material change <span>→</span></button></div>
  </div>;
}

function QuarterStrategyChoice({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const strategies = V2_GOLDEN_CONTENT.entries.filter((entry): entry is StrategyContent => entry.kind === 'STRATEGY');
  return <div className="quarter-close quarter-decision">
    <QuarterPhase phase="03 / 04" label="NEXT QUARTER STRATEGY" />
    <h1>Set the operating posture.</h1><p className="quarter-sub">A Strategy changes how the company operates for a limited number of quarters. It is neither a permanent skill nor a Relic.</p>
    <div className="decision-cards" aria-label="Next Quarter Strategy choices">{strategies.map((strategy) => <StrategyCard key={strategy.id} strategy={strategy} state={state} onChoose={() => runtime.dispatch('QUARTER_STRATEGY_CHOSEN', { strategyId: strategy.id })} />)}</div>
    <div className="decision-footer"><p>Choose a thesis only when you want its operating tradeoff. The machine can continue without one.</p><button className="quiet-action" onClick={() => runtime.dispatch('QUARTER_STRATEGY_SKIPPED', {})}>Hold current posture <span>→</span></button></div>
  </div>;
}

function QuarterInvestment({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const [selectedFunction, setSelectedFunction] = useState<FunctionId>(state.founderAttention);
  const skills = V2_GOLDEN_CONTENT.entries.filter((entry): entry is SkillRankContent => entry.kind === 'SKILL_RANK');
  const functionSkills = skills.filter((skill) => skill.functionId === selectedFunction);
  const purchasedCount = state.progression.purchasedSkillRankIds.length;
  const continueRun = () => {
    if (state.quarter.closeStage === 'INVEST') runtime.dispatch('QUARTER_INVESTING_FINISHED', {});
    runtime.dispatch('QUARTER_NEXT_STARTED', {});
  };
  return <div className="quarter-close">
    <QuarterPhase phase="04 / 04" label="INVEST" />
    <h1>Commit capability.</h1><p className="quarter-sub">Cash becomes permanent function-level capability. No global decision is hidden in this board.</p>
    <section className="skill-tree" aria-label="Skill investment">
      <header><div><span>INVEST · PERMANENT RUN CAPABILITY</span><h2>Where does this company get better?</h2></div><div className="skill-cash"><span>AVAILABLE CASH</span><strong>{formatCash(state.economy.cash)}</strong><small>{purchasedCount} FOUNDATION RANK{purchasedCount === 1 ? '' : 'S'} INSTALLED</small></div></header>
      <div className="skill-function-tabs" role="tablist" aria-label="Work-function skill trees">{FUNCTION_IDS.map((functionId) => <button key={functionId} role="tab" aria-selected={selectedFunction === functionId} className={selectedFunction === functionId ? 'active' : ''} onClick={() => setSelectedFunction(functionId)}>{functionId}</button>)}</div>
      <div className="skill-branches" role="tabpanel" aria-label={`${selectedFunction} skill tree`}>{functionSkills.map((skill) => {
        const owned = state.progression.purchasedSkillRankIds.includes(skill.id);
        const eligibility = evaluateEligibility(state, skill.eligibility);
        const affordable = state.economy.cash >= skill.costCents.value;
        const blocked = !eligibility.eligible ? eligibility.reasons[0] : !affordable ? 'Insufficient Cash' : 'Available now';
        return <article key={skill.id} className={`skill-node ${owned ? 'owned' : ''} ${eligibility.eligible && affordable ? 'available' : ''}`}>
          <div className="skill-node-head"><span>{skill.branch}</span><b>{owned ? 'INSTALLED' : 'TIER 1'}</b></div><h3>{skill.name}</h3><p>{skill.description}</p><div className="skill-node-foot"><small>{owned ? 'Permanent capability active' : blocked}</small><button disabled={owned || !eligibility.eligible || !affordable} onClick={() => runtime.dispatch('SKILL_RANK_PURCHASED', { skillRankId: skill.id })}>{owned ? 'ACTIVE' : formatCash(skill.costCents.value)}</button></div>
        </article>;
      })}</div>
      <p className="skill-calibration-note">Every purchase lasts for this run. Invest in the work you want to improve, then put the capability to use.</p>
    </section>
    <button className="primary-action begin-q2" onClick={continueRun}>{state.quarter.mandateMet === false ? 'Resolve run' : `Begin Q${state.quarter.index + 1}`} <span>→</span></button>
  </div>;
}

function QuarterPhase({ phase, label }: { phase: string; label: string }) { return <p className="kicker">QUARTER CLOSE · {phase} · {label} · HASHED</p>; }

function RelicCard({ relic, state, onChoose }: { relic: RelicContent; state: RunState; onChoose: () => void }) {
  const eligibility = evaluateEligibility(state, relic.eligibility);
  const owned = state.progression.ownedRelicIds.includes(relic.id);
  const available = eligibility.eligible && !owned;
  return <article className={`decision-card relic rarity-${relic.rarity.toLowerCase()} ${available ? 'available' : ''}`}><div className="decision-card-head"><span>PERMANENT · {relic.rarity}</span><b>{available ? 'ELIGIBLE' : owned ? 'OWNED' : 'LOCKED'}</b></div><h2>{relic.name}</h2><p>{relic.description}</p><small>{available ? 'Changes this run permanently.' : owned ? 'Already part of this company.' : eligibility.reasons[0]}</small><button disabled={!available} onClick={onChoose}>{available ? 'Take this change' : owned ? 'Already changed' : 'Unavailable'}</button></article>;
}

function StrategyCard({ strategy, state, onChoose }: { strategy: StrategyContent; state: RunState; onChoose: () => void }) {
  const eligibility = evaluateEligibility(state, strategy.eligibility);
  return <article className={`decision-card strategy ${eligibility.eligible ? 'available' : ''}`}><div className="decision-card-head"><span>{strategy.durationQuarters} QUARTER{strategy.durationQuarters === 1 ? '' : 'S'} · TEMPORARY</span><b>{eligibility.eligible ? 'AVAILABLE' : 'LOCKED'}</b></div><h2>{strategy.name}</h2><p>{strategy.description}</p><small>{eligibility.eligible ? 'The effect expires automatically.' : eligibility.reasons[0]}</small><button disabled={!eligibility.eligible} onClick={onChoose}>{eligibility.eligible ? 'Adopt strategy' : 'Unavailable'}</button></article>;
}

function QuarterReady({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  return <RoomFrame eyebrow={`Q${state.quarter.index} · SYSTEM CONTINUITY`} title="The machine remembers." instruction="Customers, capital and purchased capability crossed the quarter boundary. A fresh demand signal is waiting.">
    <div className="q2-proof"><span>QUARTER {String(state.quarter.index).padStart(2, '0')} · READY</span><h2>{formatDollars(state.economy.startingArr)} starting ARR</h2><p>Signal Discipline I is {state.progression.purchasedSkillRankIds.includes(asContentId('skill.marketing.craft.1')) ? 'installed' : 'not installed'}. Marketing capacity is {(state.functions.MARKETING.capacity / 1000).toFixed(2)} work units. Complexity remains {(state.pressure.complexity / 1000).toFixed(1)}.</p><div><b>NEXT TARGET</b><strong>{formatDollars(state.quarter.targetArr)}</strong></div></div>
    <button className="stage-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'MARKETING' })}>Start Q{state.quarter.index} in Marketing <span>→</span></button>
  </RoomFrame>;
}

function FailureScreen({ state, onNewRun }: { state: RunState; onNewRun: () => void }) {
  const failure = state.outcome.finalResult;
  return <div className="failure-screen"><p className="kicker">RUN ENDED · Q{state.quarter.index} · HASHED</p><h1>The company broke.</h1><p>{failure?.explanation ?? 'The run reached a terminal failure state.'}</p><div className="failure-ledger"><span>PRIMARY BOTTLENECK</span><strong>{failure?.bottleneckFunction ?? 'UNKNOWN'}</strong><small>{failure?.type.replaceAll('_', ' ') ?? 'UNATTRIBUTED'} · {failure?.buildLabel ?? 'UNCLASSIFIED BUILD'}</small></div><button className="primary-action" onClick={onNewRun}>Start a new company <span>→</span></button></div>;
}

function RoomFrame({ eyebrow, title, instruction, children }: { eyebrow: string; title: string; instruction: string; children: React.ReactNode }) { return <div className="room-frame"><header><span>{eyebrow}</span><h1>{title}</h1><p>{instruction}</p></header><div className="room-workspace">{children}</div></div>; }
function HudMetric({ label, value, detail, primary, warning }: { label: string; value: string; detail: string; primary?: boolean; warning?: boolean }) { return <div className={`hud-metric ${primary ? 'primary' : ''}`}><span>{label}</span><strong>{value}</strong><small className={warning ? 'warning' : ''}>{detail}</small></div>; }
function FlowStep({ label, count, active, accent }: { label: string; count: number; active: boolean; accent: string }) { return <li className={active ? 'active' : ''} style={{ '--flow-accent': accent } as React.CSSProperties}><i /><div><span>{label}</span><b>{String(count).padStart(2, '0')}</b></div></li>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
function Equation({ label, value, positive, total }: { label: string; value: number; positive?: boolean; total?: boolean }) { return <div className={total ? 'total' : ''}><span>{label}</span><strong className={positive ? 'positive' : ''}>{positive ? '+' : ''}{formatDollars(value)}</strong></div>; }
function formatClock(remainingTicks: number) { const seconds = Math.max(0, Math.ceil(remainingTicks / V2_GOLDEN_BALANCE.ticksPerSecond.value)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }
function quarterDuration(state: RunState) { return V2_GOLDEN_BALANCE.ticksPerQuarter.value * (state.clock.quarterIndex === 1 ? 2 : 1); }
function nextInstruction(state: RunState) {
  const quarterStartTick = state.clock.tick - state.clock.tickInQuarter;
  if (!state.cohorts.demand.some((cohort) => cohort.createdAtTick >= quarterStartTick)) return `Q${state.clock.quarterIndex}: read the signal and commit one Marketing decision.`;
  if (state.functions.PRODUCT.queue.length) return 'The Demand cohort is waiting at the Product bench.';
  if (state.functions.MONETIZATION.queue.length) return 'The Activation cohort is ready for a pricing commitment.';
  if (state.functions.FINANCE.unlocked && state.functions.FINANCE.queue.length === 0) return `Q${state.clock.quarterIndex} circuit complete. The deterministic quarter clock is still running.`;
  if (state.functions.FINANCE.queue.length) return 'Operations is stable. Inspect and commit the capital decision.';
  if (state.functions.OPERATIONS.unlocked) return state.functions.OPERATIONS.queue.length ? 'Expansion created an operational obligation. Reveal its cause.' : 'The obligation is resolved. Route the company into Finance.';
  if (state.functions.EXPANSION.unlocked) return state.functions.EXPANSION.queue.some((item) => item.metadata.committed !== true) ? 'Protected ARR has an Expansion need. Build the package.' : 'The account fit is committed. Route the obligation into Operations.';
  if (state.functions.RETENTION.queue.some((item) => item.metadata.resolved === true)) return 'The intervention landed. Move the protected account into Expansion.';
  if (state.functions.RETENTION.queue.length) return 'Customer ARR is exposed. Prioritize a Retention threat.';
  return `Q${state.clock.quarterIndex} circuit complete. The deterministic quarter clock is still running.`;
}
