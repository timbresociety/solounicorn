'use client';

import Image from 'next/image';
import { PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react';
import { V2_GOLDEN_BALANCE } from '../../game/balance/v2-golden';
import { contentById } from '../../game/content/v2-golden';
import type { FunctionId } from '../../game/schema/actions';
import type { CustomerArchetypeContent, MarketingSignalContent, ProductRecipeContent, SkillRankContent } from '../../game/schema/content';
import { asContentId, asEntityId, asQueueItemId } from '../../game/schema/ids';
import type { RunState } from '../../game/schema/state';
import { selectEconomy, formatCash, formatDollars } from '../../game/selectors/economy';
import { selectGoldenRooms } from '../../game/selectors/rooms';
import { startBrowserClock } from '../../game/runtime/browser-clock';
import { DEFAULT_ENGINE_CONTEXT } from '../../game/engine/create-run';
import { GameRuntime, type RuntimeSnapshot } from '../../game/runtime/game-runtime';
import { assertCompatibleSave, createSaveEnvelope, IndexedDbPersistence } from '../../game/runtime/persistence';
import { mostImportantEvent } from '../../presentation/event-orchestrator';
import { playEventSound } from '../../presentation/audio';
import { EXPANSION_MODULE_FIXTURES, OPERATIONS_EVIDENCE_FIXTURES, RETENTION_THREAT_FIXTURES } from '../../game/fixtures/v2-presentation';

const SAVE_SLOT = 'golden-run';
const persistence = new IndexedDbPersistence();

export default function GameShell() {
  const [runtime, setRuntime] = useState(() => new GameRuntime(84022));
  const [snapshot, setSnapshot] = useState<RuntimeSnapshot>(runtime.snapshot);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [restored, setRestored] = useState(false);
  const [loadNotice, setLoadNotice] = useState('');
  const lastSoundSequence = useRef(0);

  useEffect(() => runtime.subscribe(setSnapshot), [runtime]);
  useEffect(() => {
    let active = true;
    persistence.load(SAVE_SLOT).then((save) => {
      if (!active || !save || save.snapshot.state.clock.phase === 'SETUP') return;
      assertCompatibleSave(save, DEFAULT_ENGINE_CONTEXT.balance.version, DEFAULT_ENGINE_CONTEXT.content.version);
      setRuntime(new GameRuntime(save.snapshot.state.header.seed, DEFAULT_ENGINE_CONTEXT, save.snapshot));
      setRestored(true);
    }).catch((error: unknown) => { setRestored(false); setLoadNotice(error instanceof Error && error.message.startsWith('INCOMPATIBLE_SAVE') ? 'A previous run uses a different balance/content version. It was preserved and not silently migrated.' : 'A previous run could not be restored.'); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const clock = startBrowserClock(runtime, V2_GOLDEN_BALANCE.ticksPerSecond.value);
    const visibility = () => clock.setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', visibility);
    return () => { document.removeEventListener('visibilitychange', visibility); clock.stop(); };
  }, [runtime]);
  useEffect(() => {
    const accepted = snapshot.events.some((event) => event.type === 'ACTION_ACCEPTED' || event.type === 'QUARTER_CLOSED');
    const interval = snapshot.state.clock.tick > 0 && snapshot.state.clock.tick % 50 === 0;
    if (snapshot.state.clock.phase !== 'SETUP' && (accepted || interval)) void persistence.save(SAVE_SLOT, createSaveEnvelope(snapshot));
    const event = snapshot.events.filter((item) => item.sequence > lastSoundSequence.current).at(-1);
    if (event) {
      const presented = mostImportantEvent(snapshot.events.filter((item) => item.sequence > lastSoundSequence.current));
      if (presented) playEventSound(presented, audioEnabled);
      lastSoundSequence.current = event.sequence;
    }
  }, [snapshot, audioEnabled]);

  const state = snapshot.state;
  if (state.clock.phase === 'SETUP') return <RunSetup runtime={runtime} notice={loadNotice} />;
  return <Cockpit runtime={runtime} snapshot={snapshot} audioEnabled={audioEnabled} onToggleAudio={() => setAudioEnabled((value) => !value)} restored={restored} />;
}

function RunSetup({ runtime, notice }: { runtime: GameRuntime; notice: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const mandates = [10, 25, 50, 75, 100];
  const choose = (value: number) => {
    if (!runtime.snapshot.state.header.founderHistoryId) runtime.dispatch('RUN_FOUNDER_HISTORY_SELECTED', { founderHistoryId: asContentId('history.fresh-founder') });
    runtime.dispatch('RUN_GROWTH_MANDATE_SELECTED', { growthMandateBps: (value * 100) as never });
    setSelected(value);
  };
  return <main className="run-setup">
    <div className="setup-mark"><Image src="/structure-mark.png" alt="" width={62} height={70} priority /></div>
    <p className="kicker">NEW RUN · SEED 84022</p>{notice && <p className="save-notice">{notice}</p>}
    <h1>How fast did you promise?</h1>
    <p className="setup-copy">Your Growth Mandate is the line you must cross every quarter. It changes difficulty, never luck.</p>
    <div className="founder-history"><span>FOUNDER HISTORY</span><strong>Fresh Founder</strong><small>Standardized baseline. No hidden advantage.</small></div>
    <div className="mandate-grid" role="group" aria-label="Choose quarterly Growth Mandate">
      {mandates.map((value) => <button key={value} onClick={() => choose(value)} className={selected === value ? 'selected' : ''}><strong>{value}%</strong><span>{value === 10 ? 'Learn the machine' : value < 50 ? 'Serious growth' : value < 100 ? 'Relentless' : 'Double or die'}</span></button>)}
    </div>
    <button className="primary-action" disabled={!selected} onClick={() => runtime.dispatch('RUN_STARTED', {})}>Begin Q1 <span>→</span></button>
    <p className="setup-foot">One founder. One active function. Every consequence recorded.</p>
  </main>;
}

function Cockpit({ runtime, snapshot, audioEnabled, onToggleAudio, restored }: { runtime: GameRuntime; snapshot: RuntimeSnapshot; audioEnabled: boolean; onToggleAudio: () => void; restored: boolean }) {
  const state = snapshot.state;
  const economy = selectEconomy(state);
  const rooms = selectGoldenRooms(state);
  const presented = mostImportantEvent(snapshot.events);
  const quarterProgress = Math.min(100, Math.floor(state.clock.tickInQuarter * 100 / V2_GOLDEN_BALANCE.ticksPerQuarter.value));
  const activeAccent = rooms.find((room) => room.id === state.founderAttention)?.accent ?? '#ff5c9a';
  const enter = (functionId: FunctionId) => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId });
  return <main className="game-shell" style={{ '--active-accent': activeAccent } as React.CSSProperties}>
    <header className="economy-hud">
      <div className="identity"><Image src="/structure-mark.png" alt="" width={34} height={38} priority /><div><b>ONE PERSON UNICORN</b><span>RUN 84022 · FRESH FOUNDER</span></div></div>
      <HudMetric label="VALUATION" value={formatDollars(economy.valuation)} detail={`${(state.economy.growthMultipleBps / 10_000).toFixed(1)}× ARR`} primary />
      <HudMetric label="ARR" value={formatDollars(economy.arr)} detail={`+${formatDollars(state.economy.newCustomerArrQTD)} QTD`} />
      <HudMetric label="CASH" value={formatCash(economy.cashCents)} detail={`${state.cohorts.customers.length} customer${state.cohorts.customers.length === 1 ? '' : 's'}`} />
      <HudMetric label="MANDATE" value={`${(state.quarter.growthBps / 100).toFixed(1)} / ${(economy.mandateBps / 100).toFixed(0)}%`} detail={`Q${economy.quarter} · ${quarterProgress}% elapsed`} warning={state.quarter.growthBps < economy.mandateBps} />
      <button className="audio-toggle" onClick={onToggleAudio} aria-pressed={audioEnabled}><span>{audioEnabled ? 'SOUND ON' : 'MUTED'}</span></button>
    </header>

    <div className="shell-body">
      <nav className="function-rail" aria-label="Work functions">
        <p>ACTIVE WORK</p>
        {rooms.map((room, index) => <button key={room.id} disabled={!room.unlocked || state.clock.phase !== 'ACTIVE'} className={state.founderAttention === room.id ? 'active' : ''} onClick={() => enter(room.id)} style={{ '--room-accent': room.accent } as React.CSSProperties}><i>{String(index + 1).padStart(2, '0')}</i><span>{room.name}</span><b>{room.queue || (state.founderAttention === room.id ? 'YOU' : '·')}</b></button>)}
        <div className="rail-rule" />
        <small>{rooms.filter((room) => room.unlocked).length} / {rooms.length} systems online</small>
      </nav>

      <section className="active-stage" aria-live="off">
        {state.clock.phase === 'QUARTER_CLOSE' ? <QuarterClose runtime={runtime} state={state} /> : state.clock.quarterIndex >= 2 && state.founderAttention !== 'MARKETING' ? <QuarterTwoReady runtime={runtime} state={state} /> : state.founderAttention === 'MARKETING' ? <MarketingRoom runtime={runtime} state={state} /> : state.founderAttention === 'PRODUCT' ? <ProductRoom runtime={runtime} state={state} /> : state.founderAttention === 'MONETIZATION' ? <MonetizationRoom runtime={runtime} state={state} /> : state.founderAttention === 'RETENTION' ? <RetentionRoom runtime={runtime} state={state} /> : state.founderAttention === 'EXPANSION' ? <ExpansionRoom runtime={runtime} state={state} /> : state.founderAttention === 'OPERATIONS' ? <OperationsRoom runtime={runtime} state={state} /> : <FinanceRoom runtime={runtime} state={state} />}
      </section>

      <aside className="causal-rail" aria-label="Company flow and causal ledger">
        {restored && <div className="restore-note">RUN RESTORED · HASH VERIFIED</div>}
        <div className="flow-heading"><span>ECONOMIC FLOW</span><b>LIVE</b></div>
        <ol className="cohort-flow">
          <FlowStep label="Demand" count={state.cohorts.demand.length} active={state.cohorts.demand.length > 0} accent="#ff5c9a" />
          <FlowStep label="Activation" count={state.cohorts.activated.length} active={state.cohorts.activated.length > 0} accent="#58d9ff" />
          <FlowStep label="Customer" count={state.cohorts.customers.length} active={state.cohorts.customers.length > 0} accent="#ffc857" />
        </ol>
        <div className="machine-load"><div><span>COMPLEXITY</span><b>{(state.pressure.complexity / 1000).toFixed(1)}</b></div><div><span>OPS CAPACITY</span><b>{(state.pressure.opsCapacity / 1000).toFixed(1)}</b></div><div><span>STRAIN</span><b>{state.pressure.strainBand}</b></div></div>
        <div className={`causal-receipt priority-${presented?.priority ?? 0}`}>
          <span>CAUSAL RECEIPT</span>
          <strong>{presented?.label ?? 'SIMULATION LIVE'}</strong>
          <p>{presented?.detail ?? nextInstruction(state)}</p>
          <small>HASH {snapshot.checksum.replace('fnv1a32:', '').toUpperCase()}</small>
        </div>
      </aside>
    </div>

    <nav className="mobile-dock" aria-label="Work functions">{rooms.map((room) => <button key={room.id} disabled={!room.unlocked || state.clock.phase !== 'ACTIVE'} className={state.founderAttention === room.id ? 'active' : ''} onClick={() => enter(room.id)} style={{ '--room-accent': room.accent } as React.CSSProperties}><span>{room.code}</span><small>{room.queue || (state.founderAttention === room.id ? 'YOU' : 'LOCKED')}</small></button>)}</nav>
    <div className="mobile-receipt"><b>{presented?.label ?? 'SIMULATION LIVE'}</b><span>{presented?.detail ?? nextInstruction(state)}</span></div>
  </main>;
}

function MarketingRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const resolved = state.cohorts.demand.length > 0;
  const signal = contentById.get(asContentId('signal.support-tabs')) as MarketingSignalContent;
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const origin = useRef({ x: 0, y: 0 });
  const committed = useRef(false);
  const intent = drag.y < -55 && Math.abs(drag.y) > Math.abs(drag.x) * .72 ? 'aggressive' : drag.x > 54 ? 'pursue' : drag.x < -54 ? 'ignore' : null;
  const resolve = (decision: 'ignore' | 'pursue' | 'aggressive') => {
    if (committed.current || resolved) return;
    committed.current = true;
    const type = decision === 'ignore' ? 'MARKETING_OPPORTUNITY_IGNORED' : decision === 'aggressive' ? 'MARKETING_OPPORTUNITY_AGGRESSIVELY_PURSUED' : 'MARKETING_OPPORTUNITY_PURSUED';
    runtime.dispatch(type, { opportunityId: signal.id });
  };
  const down = (event: ReactPointerEvent<HTMLDivElement>) => { if (resolved) return; origin.current = { x: event.clientX, y: event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); setDrag({ x: 0, y: 0, active: true }); };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => { if (!drag.active) return; setDrag({ x: Math.max(-220, Math.min(220, event.clientX - origin.current.x)), y: Math.max(-170, Math.min(80, event.clientY - origin.current.y)), active: true }); };
  const up = () => { if (intent) resolve(intent); else setDrag({ x: 0, y: 0, active: false }); };
  if (resolved) return <RoomFrame eyebrow="MARKETING · PROVED" title="Demand is moving." instruction="The cohort kept its source, quality and cost. Product now owns the next consequence."><div className="proof-object pink"><span>DEMAND COHORT 001</span><strong>{signal.name}</strong><p>Exceptional quality · 3.0 work units · $260 acquisition</p><div className="route-line"><i /> ROUTED TO PRODUCT <i /></div></div><button className="stage-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'PRODUCT' })}>Enter Product <span>→</span></button></RoomFrame>;
  return <RoomFrame eyebrow="MARKETING · POINT" title="Read the signal." instruction="Swipe left to ignore, right to pursue, or up to pursue aggressively.">
    <div className={`gesture-label left ${intent === 'ignore' ? 'ready' : ''}`}>← <b>IGNORE</b></div><div className={`gesture-label right ${intent === 'pursue' ? 'ready' : ''}`}><b>PURSUE</b> →</div><div className={`gesture-label up ${intent === 'aggressive' ? 'ready' : ''}`}>↑<b>AGGRESSIVE</b></div>
    <div className="signal-card-stack" aria-hidden="true" />
    <div className="signal-card" style={{ transform: `translate3d(${drag.x}px,${drag.y}px,0) rotate(${Math.max(-5, Math.min(5, drag.x / 35))}deg)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={(event) => { if (event.key === 'ArrowLeft') resolve('ignore'); if (event.key === 'ArrowRight') resolve('pursue'); if (event.key === 'ArrowUp') resolve('aggressive'); }} tabIndex={0} role="group" aria-label="Support teams want fewer tabs. Swipe or use arrow keys to decide.">
      <div className="object-head"><span>SIGNAL / 015</span><b>91% READ</b></div><div className="signal-wave">{[31,56,42,78,48,91,63,36,71,52,84,46].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div>
      <small>SUPPORT OPS · DURABLE SIGNAL</small><h2>Support teams want fewer tabs.</h2><p>A boring painkiller with durable intent. Low saturation, clear ownership, almost no launch-day theatre.</p>
      <dl><Fact label="Audience" value="Excellent" /><Fact label="Intent" value="High" /><Fact label="Velocity" value="Steady" /><Fact label="Saturation" value="Low" /></dl><div className="object-foot"><span>ACQUISITION COST</span><strong>$260</strong></div>
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
  if (!request || !recipe) return <RoomFrame eyebrow="PRODUCT · PROVED" title="Activation is ready." instruction="The verified build preserved Product quality and routed an Activation cohort into pricing."><div className="proof-object cyan"><span>ACTIVATED COHORT 001</span><strong>Support Workflow Hub</strong><p>Verified · 90% product quality · no early-ship risk</p><div className="route-line"><i /> ROUTED TO MONETIZATION <i /></div></div><button className="stage-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'MONETIZATION' })}>Enter Monetization <span>→</span></button></RoomFrame>;
  const labels: Record<string, string> = { 'component.inbox': 'INBOX', 'component.routing': 'ROUTING', 'component.context': 'CONTEXT' };
  const place = (componentId: string, slotId: string) => { runtime.dispatch('PRODUCT_COMPONENT_PLACED', { requestId: request.id, componentId: asContentId(componentId), slotId: asEntityId(slotId) }); setSelected(null); };
  const drop = (event: ReactPointerEvent<HTMLButtonElement>, componentId: string) => { const target = document.elementsFromPoint(event.clientX, event.clientY).map((element) => element.closest<HTMLElement>('[data-slot]')).find(Boolean); if (target?.dataset.slot) place(componentId, target.dataset.slot); setDragging(null); };
  const complete = placed.length === recipe.componentIds.length;
  return <RoomFrame eyebrow="PRODUCT · DO" title="Assemble the request." instruction="Place each component in its logical slot. Test before shipping to protect customer health.">
    <div className="recipe-bench">
      <div className="recipe-name"><span>REQUEST / 001</span><strong>SUPPORT WORKFLOW HUB</strong><small>{placed.length} / {recipe.componentIds.length} COMPONENTS</small></div>
      <div className="recipe-slots">{recipe.slotIds.map((slotId, index) => { const component = recipe.componentIds[index]; const filled = placed.includes(component); return <button key={slotId} data-slot={slotId} className={filled ? 'filled' : ''} onClick={() => selected && place(selected, slotId)}><span>{String(index + 1).padStart(2, '0')} · {slotId.toUpperCase()}</span><strong>{filled ? labels[component] : 'DROP COMPONENT'}</strong></button>; })}</div>
      <div className="component-tray" aria-label="Product components">{recipe.componentIds.map((id) => <button key={id} disabled={placed.includes(id)} className={selected === id ? 'selected' : ''} style={dragging?.id === id ? { transform: `translate3d(${dragging.x}px,${dragging.y}px,0)`, zIndex: 8 } : undefined} onClick={() => setSelected(id)} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setSelected(id); setDragging({ id, x: 0, y: 0 }); }} onPointerMove={(event) => dragging?.id === id && setDragging({ id, x: event.movementX + dragging.x, y: event.movementY + dragging.y })} onPointerUp={(event) => drop(event, id)}><i /><span>{labels[id]}</span><small>{placed.includes(id) ? 'LOCKED' : 'DRAG'}</small></button>)}</div>
      <div className="product-actions"><button disabled={!complete || Boolean(active?.tested)} onClick={() => runtime.dispatch('PRODUCT_RECIPE_TESTED', { requestId: request.id })}>{active?.tested ? 'VERIFIED' : 'TEST BUILD'}</button><button disabled={!complete} className="ship" onClick={() => runtime.dispatch('PRODUCT_RECIPE_SHIPPED', { requestId: request.id, mode: active?.verified ? 'VERIFIED' : 'EARLY' })}>{active?.verified ? 'SHIP VERIFIED' : 'SHIP EARLY'}</button></div>
    </div>
  </RoomFrame>;
}

function MonetizationRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const pricing = state.functions.MONETIZATION.queue[0];
  const customerType = pricing ? contentById.get(pricing.contentId) as CustomerArchetypeContent : undefined;
  if (!pricing || !customerType) return <RoomFrame eyebrow="MONETIZATION · PROVED" title="First ARR booked." instruction="The same cohort is now a customer. ARR and collections moved through separate ledgers."><div className="arr-proof"><span>NEW CUSTOMER ARR</span><strong>+{formatDollars(state.economy.newCustomerArrQTD)}</strong><p>{state.cohorts.customers[0]?.pricingModel} · {state.cohorts.customers[0]?.segment.replace('_', ' ')} · cash collected separately</p></div><div className="waiting-quarter"><span>Q1 AUTO-CLOSE</span><b>{Math.max(0, V2_GOLDEN_BALANCE.ticksPerQuarter.value - state.clock.tickInQuarter)} ticks</b><div><i style={{ width: `${Math.min(100, state.clock.tickInQuarter * 100 / V2_GOLDEN_BALANCE.ticksPerQuarter.value)}%` }} /></div></div></RoomFrame>;
  const cycle = V2_GOLDEN_BALANCE.tuning.pricingCycleTicks.value;
  const position = (state.clock.tick % cycle) * 100 / cycle;
  const inPerfect = position >= customerType.perfectBandStartPpm.value / 10_000 && position <= customerType.perfectBandEndPpm.value / 10_000;
  return <RoomFrame eyebrow="MONETIZATION · DO" title="Price the moment." instruction="The band belongs to the customer. The cursor belongs to the simulation clock.">
    <div className="pricing-rig">
      <div className="pricing-customer"><span>ACTIVATION / 001</span><strong>Support Scaleup</strong><small>PER-SEAT MODEL · $18K BASE ARR</small></div>
      <div className="pricing-scale"><div className="zone cheap">TOO CHEAP</div><div className="zone good">GOOD</div><div className="zone perfect">PERFECT</div><div className="zone good">GOOD</div><div className="zone expensive">TOO EXPENSIVE</div><i className="pricing-cursor" style={{ left: `${position}%` }} /></div>
      <div className="pricing-readout"><span>LIVE QUOTE</span><strong>{inPerfect ? '$20.7K' : '$18.0K'}</strong><small>{inPerfect ? 'PERFECT BAND' : 'WAIT FOR FIT'}</small></div>
      <button className={inPerfect ? 'lock-price hot' : 'lock-price'} onClick={() => runtime.dispatch('MONETIZATION_PRICE_COMMITTED', { activationId: pricing.id, cursorTick: state.clock.tick })}>LOCK PRICE <span>PRESS / TAP</span></button>
    </div>
  </RoomFrame>;
}

function RetentionRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const customer = state.cohorts.customers[0];
  const threats = state.functions.RETENTION.queue;
  const activeThreats = threats.filter((threat) => threat.metadata.resolved !== true);
  const resolvedThreat = threats.find((threat) => threat.metadata.resolved === true);
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
    const fixture = RETENTION_THREAT_FIXTURES.find((item) => item.id === threatId) ?? RETENTION_THREAT_FIXTURES[0];
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
    if (closest.distance <= 22) prioritize(closest.threat.id);
  };
  if (!customer) return <RoomFrame eyebrow="RETENTION · WAITING" title="Nothing to defend yet." instruction="Retention unlocks when the first customer creates ARR worth protecting."><div className="retention-empty"><span>NO CUSTOMER ARR</span><strong>Acquire before you defend.</strong></div></RoomFrame>;
  return <RoomFrame eyebrow="RETENTION · AIM" title="Protect what you earned." instruction="Aim at a moving churn threat. Your intervention auto-fires on the prioritized target.">
    <div className="retention-console">
      <div className="retention-status"><span>PRESENTATION FIXTURE · NON-AUTHORITATIVE BALANCE</span><strong>{resolvedThreat ? 'CHURN PREVENTED' : `${activeThreats.length} THREATS MOVING`}</strong><small>{resolvedThreat ? `${formatDollars(customer.currentArr)} existing ARR protected · $0 ARR created` : 'Move the reticle, then release over a target'}</small></div>
      <div ref={field} className={`threat-field ${resolvedThreat ? 'has-save' : ''}`} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setAim(pointFromPointer(event)); }} onPointerMove={(event) => setAim(pointFromPointer(event))} onPointerUp={(event) => { const point = pointFromPointer(event); setAim(point); autoFire(point); }} aria-label="Retention threat field">
        <div className="field-grid" aria-hidden="true" />
        <div className="retention-reticle" style={{ left: `${aim.x}%`, top: `${aim.y}%` }} aria-hidden="true"><i /><b /></div>
        {threats.map((threat) => { const point = position(threat.id); const isResolved = threat.metadata.resolved === true; return <button key={threat.id} className={`churn-target ${isResolved ? 'resolved' : ''}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} disabled={isResolved} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); prioritize(threat.id); }} aria-label={`Prioritize ${String(threat.metadata.label)}. ${String(threat.metadata.urgency)} churn threat.`}><i /><span>{isResolved ? 'HELD' : String(threat.metadata.urgency)}</span><strong>{String(threat.metadata.label)}</strong><small>{String(threat.metadata.cause)}</small></button>; })}
        {resolvedThreat && <div className="retention-save"><span>INTERVENTION LANDED</span><strong>{String(resolvedThreat.metadata.label)} contained.</strong><small>Retention protected existing value. It did not create positive ARR.</small></div>}
      </div>
      <div className="retention-footer"><span>AUTO-FIRE / ARMED</span><b>{lockedId || resolvedThreat ? 'TARGET RESOLVED' : 'NO TARGET LOCK'}</b><small>Tap a threat or use Tab + Enter</small></div>
    </div>
  </RoomFrame>;
}

function ExpansionRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const need = state.functions.EXPANSION.queue[0];
  const customer = state.cohorts.customers[0];
  const [firstModule, setFirstModule] = useState<string | null>(null);
  if (!need || !customer) return <RoomFrame eyebrow="EXPANSION · PROVED" title="The account package fits." instruction="A customer-specific package was committed inside the quarter cap."><div className="proof-object violet"><span>ACCOUNT FIT COMMITTED</span><strong>Support Scaleup expanded.</strong><p>Operations now owns the obligation created by the added surface area.</p><div className="route-line"><i /> ROUTED TO OPERATIONS <i /></div></div><button className="stage-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'OPERATIONS' })}>Enter Operations <span>→</span></button></RoomFrame>;
  if (need.metadata.committed === true) return <RoomFrame eyebrow="EXPANSION · PROVED" title="The account package fits." instruction="The committed package made a bounded expansion change. Operations now owns the added surface area."><div className="proof-object violet"><span>ACCOUNT FIT COMMITTED</span><strong>Support Scaleup expanded.</strong><p>Customer ARR changed through the package fit. The next obligation is now explicit.</p><div className="route-line"><i /> ROUTED TO OPERATIONS <i /></div></div><button className="stage-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'OPERATIONS' })}>Enter Operations <span>→</span></button></RoomFrame>;
  const outputs = Array.isArray(need.metadata.mergedOutputs) ? need.metadata.mergedOutputs.map(String) : [];
  const placed = Array.isArray(need.metadata.placedItems) ? need.metadata.placedItems.map(String) : [];
  const packageId = asEntityId(String(need.metadata.packageId));
  const selectModule = (moduleId: string) => {
    if (!firstModule) { setFirstModule(moduleId); return; }
    if (firstModule !== moduleId) runtime.dispatch('EXPANSION_ITEMS_MERGED', { firstItemId: asEntityId(firstModule), secondItemId: asEntityId(moduleId), cellId: asEntityId('expansion-merge-bench') });
    setFirstModule(null);
  };
  const place = (output: string) => runtime.dispatch('EXPANSION_PACKAGE_ITEM_PLACED', { packageId, itemId: asEntityId(output), slotId: asEntityId(`account-fit-${output}`) });
  const ready = ['intelligence', 'workflow'].every((item) => placed.includes(item));
  return <RoomFrame eyebrow="EXPANSION · MERGE" title="Make the account fit." instruction="Merge generator modules, then place the resulting capabilities into this customer package.">
    <div className="expansion-console">
      <div className="fixture-strip"><span>PRESENTATION FIXTURE · NON-AUTHORITATIVE BALANCE</span><b>{String(need.metadata.need)}</b></div>
      <div className="generator-grid" aria-label="Expansion module generator">{EXPANSION_MODULE_FIXTURES.map((module) => <button key={module.id} className={firstModule === module.id ? 'selected' : ''} onClick={() => selectModule(module.id)}><span>GENERATOR</span><strong>{module.label}</strong><small>{firstModule === module.id ? 'SELECT SECOND' : 'MERGE'}</small></button>)}</div>
      <div className="merge-output"><span>MERGED CAPABILITIES</span><div>{outputs.length ? outputs.map((output) => <button key={output} disabled={placed.includes(output)} onClick={() => place(output)}><i />{output.toUpperCase()}<small>{placed.includes(output) ? 'IN PACKAGE' : 'PLACE'}</small></button>) : <p>Select matching generator modules to create a capability.</p>}</div></div>
      <div className="package-fit"><div><span>ACCOUNT / SUPPORT SCALEUP</span><strong>{formatDollars(customer.currentArr)} current ARR</strong></div><div className={placed.includes('intelligence') ? 'fit-slot filled' : 'fit-slot'}>INTELLIGENCE <b>{placed.includes('intelligence') ? 'FIT' : 'OPEN'}</b></div><div className={placed.includes('workflow') ? 'fit-slot filled' : 'fit-slot'}>WORKFLOW <b>{placed.includes('workflow') ? 'FIT' : 'OPEN'}</b></div></div>
      <button className="stage-action expansion-commit" disabled={!ready} onClick={() => runtime.dispatch('EXPANSION_PACKAGE_COMMITTED', { packageId, customerId: customer.id })}>Commit account fit <span>→</span></button>
    </div>
  </RoomFrame>;
}

function OperationsRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const obligation = state.functions.OPERATIONS.queue[0];
  const [scratching, setScratching] = useState<string | null>(null);
  if (!obligation) return <RoomFrame eyebrow="OPERATIONS · PROVED" title="The obligation is resolved." instruction="Evidence became an explicit operational decision. Finance can now determine the next capital move."><div className="proof-object lime"><span>RETRY STORM CONTAINED</span><strong>Obligation closed.</strong><p>The recovery changed operational pressure, not ARR.</p><div className="route-line"><i /> ROUTED TO FINANCE <i /></div></div><button className="stage-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'FINANCE' })}>Enter Finance <span>→</span></button></RoomFrame>;
  const revealed = Array.isArray(obligation.metadata.revealedCells) ? obligation.metadata.revealedCells.map(String) : [];
  const reveal = (cellId: string) => { if (!revealed.includes(cellId)) runtime.dispatch('OPERATIONS_EVIDENCE_REVEALED', { obligationId: obligation.id, cellId: asEntityId(cellId) }); };
  const optimizerId = asQueueItemId(String(obligation.metadata.optimizerId));
  return <RoomFrame eyebrow="OPERATIONS · SCRATCH" title="Reveal the failure path." instruction="Scratch each obligation cell before choosing a resolution. The optimizer is explicitly optional and dangerous.">
    <div className="ops-console">
      <div className="fixture-strip"><span>PRESENTATION FIXTURE · NON-AUTHORITATIVE BALANCE</span><b>{String(obligation.metadata.label)}</b></div>
      <div className="evidence-grid" aria-label="Scratch to reveal operational evidence">{OPERATIONS_EVIDENCE_FIXTURES.map((evidence) => {
        const isRevealed = revealed.includes(evidence.id);
        return <button key={evidence.id} className={isRevealed ? 'revealed' : scratching === evidence.id ? 'scratching' : ''} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setScratching(evidence.id); }} onPointerUp={() => { setScratching(null); reveal(evidence.id); }} onPointerCancel={() => setScratching(null)} onClick={() => reveal(evidence.id)}><span>{isRevealed ? 'EVIDENCE REVEALED' : 'SCRATCH / HOLD'}</span><strong>{evidence.label}</strong><p>{isRevealed ? evidence.finding : 'Drag or tap to uncover this part of the failure path.'}</p></button>;
      })}</div>
      <div className="optimizer-card"><div><span>OPTIONAL OPTIMIZER · HIGH VARIANCE</span><strong>One-line retry fix</strong><p>Could reduce the incident. Could create a worse one. This does not replace evidence.</p></div><div><button onClick={() => runtime.dispatch('OPERATIONS_OPTIMIZER_ACCEPTED', { optimizerId })}>TAKE RISK</button><button onClick={() => runtime.dispatch('OPERATIONS_OPTIMIZER_DISMISSED', { optimizerId })}>DISMISS</button></div></div>
      <button className="stage-action ops-resolve" disabled={revealed.length < OPERATIONS_EVIDENCE_FIXTURES.length} onClick={() => runtime.dispatch('OPERATIONS_RESOLUTION_CHOSEN', { obligationId: obligation.id, resolutionId: asContentId('resolution.cap-retries') })}>Resolve obligation <span>→</span></button>
    </div>
  </RoomFrame>;
}

function FinanceRoom({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const offer = state.functions.FINANCE.queue[0];
  const debt = state.capital.debt.find((item) => item.status === 'ACTIVE');
  if (!offer) return <RoomFrame eyebrow="FINANCE · LIVE" title="Capital decision recorded." instruction="Cash, ownership, and debt remain separate from ARR."><div className="finance-proof"><span>CAPITAL LEDGER</span><strong>{formatCash(state.economy.cash)}</strong><p>{(state.capital.founderOwnershipBps / 100).toFixed(1)}% founder ownership · {debt ? `${formatCash(debt.principalCents)} debt active` : 'No active debt'}</p></div></RoomFrame>;
  const opened = offer.metadata.opened === true;
  const resolved = offer.metadata.resolved === true;
  const check = Number(offer.metadata.checkCents);
  const dilution = Number(offer.metadata.dilutionBps);
  return <RoomFrame eyebrow="FINANCE · COMMIT" title="Choose the capital shape." instruction="Inspect the SAFE, then accept it or use debt. These decisions never create ARR directly.">
    <div className="finance-console">
      <div className="fixture-strip"><span>PRESENTATION FIXTURE · NON-AUTHORITATIVE BALANCE</span><b>{String(offer.metadata.label)}</b></div>
      <div className="capital-terms"><div><span>SAFE CHECK</span><strong>{formatCash(check)}</strong></div><div><span>FOUNDER DILUTION</span><strong>{(dilution / 100).toFixed(1)}%</strong></div><div><span>ARR EFFECT</span><strong>NONE</strong></div></div>
      <div className="finance-actions"><button disabled={opened || resolved} onClick={() => runtime.dispatch('FINANCE_OFFER_OPENED', { offerId: offer.id })}>Inspect SAFE</button><button className="accept" disabled={!opened || resolved} onClick={() => runtime.dispatch('FINANCE_OFFER_ACCEPTED', { offerId: offer.id })}>Accept capital</button><button disabled={resolved} onClick={() => runtime.dispatch('FINANCE_OFFER_PASSED', { offerId: offer.id })}>Pass</button></div>
      <div className="debt-panel"><div><span>DEBT INSTRUMENT</span><strong>{debt ? `${formatCash(debt.principalCents)} ACTIVE` : 'RUNWAY NOTE AVAILABLE'}</strong><small>Debt creates cash and a repayment obligation. It does not create ARR.</small></div>{debt ? <button onClick={() => runtime.dispatch('FINANCE_PRINCIPAL_PAID', { instrumentId: debt.instrumentId, amountCents: debt.principalCents })}>Pay principal</button> : <button onClick={() => runtime.dispatch('FINANCE_DEBT_DRAWN', { instrumentId: asContentId('finance.runway-note') })}>Draw runway debt</button>}</div>
      {resolved && <div className="finance-receipt"><span>CAPITAL COMMITTED</span><strong>{formatCash(check)} cash added · {(dilution / 100).toFixed(1)}% ownership exchanged</strong><small>ARR is unchanged by this decision.</small></div>}
    </div>
  </RoomFrame>;
}

function QuarterClose({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  const skill = contentById.get(asContentId('skill.marketing.craft.1')) as SkillRankContent;
  const purchased = state.progression.purchasedSkillRankIds.includes(skill.id);
  return <div className="quarter-close">
    <p className="kicker">Q{state.quarter.index} · CLOSED · HASHED</p><h1>{state.quarter.mandateMet ? 'The promise held.' : 'The promise broke.'}</h1><p className="quarter-sub">The machine is paused. Inspect the bridge, then turn Cash into capability.</p>
    <div className="arr-equation"><Equation label="Starting ARR" value={state.quarter.startingArr} /><i>+</i><Equation label="New customer" value={state.quarter.newCustomerArr} positive /><i>=</i><Equation label="Ending ARR" value={state.quarter.endingArr} total /></div>
    <div className="quarter-facts"><div><span>ACTUAL GROWTH</span><b>{(state.quarter.growthBps / 100).toFixed(1)}%</b></div><div><span>MANDATE</span><b>{((state.header.growthMandateBps ?? 0) / 100).toFixed(0)}% · {state.quarter.mandateMet ? 'MET' : 'MISSED'}</b></div><div><span>VALUATION</span><b>{formatDollars(state.economy.valuation)}</b><small>{(state.economy.growthMultipleBps / 10_000).toFixed(1)}× ARR</small></div></div>
    <div className={purchased ? 'skill-purchase purchased' : 'skill-purchase'}><div><span>INVEST · MARKETING / CRAFT</span><h2>Signal Discipline I</h2><p>Founder Marketing capacity +0.25 work units. Craft adds capability without Complexity.</p></div><div><strong>{purchased ? 'INSTALLED' : '$3.5K'}</strong><button disabled={purchased} onClick={() => runtime.dispatch('SKILL_RANK_PURCHASED', { skillRankId: skill.id })}>{purchased ? 'CAPABILITY ACTIVE' : 'PURCHASE RANK'}</button></div></div>
    <button className="primary-action begin-q2" disabled={!purchased} onClick={() => runtime.dispatch('QUARTER_NEXT_STARTED', {})}>Begin Q2 <span>→</span></button>
  </div>;
}

function QuarterTwoReady({ runtime, state }: { runtime: GameRuntime; state: RunState }) {
  return <RoomFrame eyebrow="Q2 · SYSTEM CONTINUITY" title="The machine remembers." instruction="Cohorts, customers and purchased capability crossed the quarter boundary without a presentation reset.">
    <div className="q2-proof"><span>QUARTER 02 · ACTIVE</span><h2>{formatDollars(state.economy.startingArr)} starting ARR</h2><p>Signal Discipline I is installed. Marketing capacity is now {(state.functions.MARKETING.capacity / 1000).toFixed(2)} work units. Complexity remains {(state.pressure.complexity / 1000).toFixed(1)}.</p><div><b>NEXT TARGET</b><strong>{formatDollars(state.quarter.targetArr)}</strong></div></div>
    <button className="stage-action" onClick={() => runtime.dispatch('FOUNDER_FUNCTION_ENTERED', { functionId: 'MARKETING' })}>Continue in Marketing <span>→</span></button>
  </RoomFrame>;
}

function RoomFrame({ eyebrow, title, instruction, children }: { eyebrow: string; title: string; instruction: string; children: React.ReactNode }) { return <div className="room-frame"><header><span>{eyebrow}</span><h1>{title}</h1><p>{instruction}</p></header><div className="room-workspace">{children}</div></div>; }
function HudMetric({ label, value, detail, primary, warning }: { label: string; value: string; detail: string; primary?: boolean; warning?: boolean }) { return <div className={`hud-metric ${primary ? 'primary' : ''}`}><span>{label}</span><strong>{value}</strong><small className={warning ? 'warning' : ''}>{detail}</small></div>; }
function FlowStep({ label, count, active, accent }: { label: string; count: number; active: boolean; accent: string }) { return <li className={active ? 'active' : ''} style={{ '--flow-accent': accent } as React.CSSProperties}><i /><div><span>{label}</span><b>{String(count).padStart(2, '0')}</b></div></li>; }
function Fact({ label, value }: { label: string; value: string }) { return <div><dt>{label}</dt><dd>{value}</dd></div>; }
function Equation({ label, value, positive, total }: { label: string; value: number; positive?: boolean; total?: boolean }) { return <div className={total ? 'total' : ''}><span>{label}</span><strong className={positive ? 'positive' : ''}>{positive ? '+' : ''}{formatDollars(value)}</strong></div>; }
function nextInstruction(state: RunState) { if (state.clock.quarterIndex >= 2) return 'Q2 is active with Q1 cohorts and purchased capability intact.'; if (!state.cohorts.demand.length) return 'Read the signal and commit one Marketing decision.'; if (!state.cohorts.activated.length) return 'The Demand cohort is waiting in Product.'; if (!state.cohorts.customers.length) return 'The Activation cohort is ready for pricing.'; return 'First ARR is booked. Q1 continues to its deterministic close.'; }
