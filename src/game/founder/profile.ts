import master from '../../../solounicorn-master-context/engine/candidate_profile.json';

// Candidate tuning, never locked balance. Master units are cents and 0.1s ticks.
export const P = {
  ...master,
  version: 'founder-candidate.15',
  // S15 candidate capacity calibration. Final craft is a full production batch;
  // all outputs still consume finite inputs. Evidence in S15 matrix.
  craft_batch_by_rank: [1,2,4,8,32],
  // S12 candidate effect budgets; no locked balance is claimed. Existing legacy
  // reductions are reused; new scoped service/rot/compute savings require S15 calibration.
  rewardOverheadFactor: .75, rewardCollectionFactor: .5, rewardDemandFactor: .65,
  rewardProductFit: .12, rewardCareMonths: 2, rewardAddonServiceFactor: .75,
  rewardRotFactor: .75, rewardComputeFactor: .75, rewardMaxCharges: 3, rewardDraftSize: 3,
  // S11 retains the existing candidate financing amounts, not locked balance.
  vcOwnershipSoldBps: 2000,
  financeWarningTicks: 100,
  // S10 candidate: full context rot triples routine duration; no action lottery.
  automationRotSlowdown: 2,
  // S06 candidate tuning: advanced Luck has a small positive raw expected
  // output, in exchange for explicitly wider seeded variance. Finite queues
  // can cap that upside; this is reported by the effect preview and tests.
  luck_mean_per_rank: 0.01,
  // Playable content defaults: channel budgets, upgrade draft costs, win inheritance.
  marketPerMonth: [24000, 16000, 9600],
  acquisitionCents: [100, 300, 1000],
  monthlyPrices: [4000, 15000, 80000],
  monthlyService: [400, 1800, 12000],
  collectionDelay: [60, 120, 240],
  collectionChance: [.95, .98, .90],
  pricingBaseChance: .50,
  pricingFitChance: .48,
  pricingFriction: .18,
  pricingFrictionPower: 2,
  pricingQuarterPressure: .18,
  pricingTimingInside: 1,
  pricingTimingNearMiss: .78,
  pricingTimingMiss: .38,
  winCashBonus: 15000,
  upgradeDraftBase: 15000,
  // The original 600-enterprise market plateaued below $1B even with all ranks.
  // Larger finite pools allow scaled units to find enough real buyers.
  // Give first-pass Product assembly a full two minutes while the company
  // continues running. The brief remains finite, but the player has time to
  // read, drag, correct a mismatch and ship without racing the HUD clock.
  starterTTL: 1200,
  bankHits: 3, pricePeriodTicks: 24,
  // S09 candidate ticket profile. Values are modeled operational-value cents,
  // not locked cash equivalence. The named ticket stream is random at Luck 0;
  // Luck adds a zero-mean shared/local spread. Supply and patches stay finite.
  operationsTicketBasePatches: 4,
  operationsTicketPatchesPerScale: 1,
  operationsTicketsPerQuarter: 2,
  operationsTicketsPerScale: 1,
  operationsTicketBasePriceCents: 100,
  operationsTicketPricePerPatchCents: 50,
  operationsTicketBaseValuesCents: [-500,-200,800,1100] as const,
  operationsTicketLuckSpreadCents: 200,
  operationsIncidentBaseMonthlyCostCents: 250,
} as const;
export const FUNCTIONS = ['demand', 'product', 'monetisation', 'retention', 'expansion', 'operations'] as const;
export type Work = typeof FUNCTIONS[number];
export const AXES = ['craft', 'scale', 'automate', 'luck'] as const;
export type Axis = typeof AXES[number];
export const NAMES: Record<Work, string> = {demand:'Demand', product:'Product', monetisation:'Monetisation', retention:'Retention', expansion:'Expansion', operations:'Operations'};

export type SkillRankDefinition = {
  id:string;
  name:string;
  prerequisite:string;
  priceMultiplier:number;
  recurringCommitment:string;
  effectId:string;
  effect:string;
  downside:string;
  visibleChange:string;
};

// Candidate S06 effect catalogue. Values continue to come from P at runtime;
// these records make each purchased first-three-function rank legible rather
// than treating 48 distinct purchases as a generic stat increment.
const rank=(id:string,name:string,effect:string,downside:string,visibleChange:string,recurringCommitment='None until used'):SkillRankDefinition=>({
  id,name,prerequisite:'Previous rank in this branch',priceMultiplier:1,recurringCommitment,effectId:`skill:${id}`,effect,downside,visibleChange,
});
export const SKILL_RANKS:Partial<Record<Work,Record<Axis,readonly SkillRankDefinition[]>>>={
  demand:{
    craft:[rank('demand.craft.1','Sharper profile read','2 qualified work units per committed profile.','Finite market and Product buffer still cap output.','Profile receipt shows work units.'),rank('demand.craft.2','Signal clustering','4 units per committed profile.','A poor visible profile still spends its acquisition stake.','Opportunity stack grows in visible pairs.'),rank('demand.craft.3','Segment synthesis','8 units per committed profile.','Downstream Product capacity becomes the bottleneck.','Profile stack fills a full lane.'),rank('demand.craft.4','Market instrument','32 units per committed profile.','No extra market is invented once the finite pool is exhausted.','A single triage can fill the available buffer.')],
    scale:[rank('demand.scale.1','Second channel','2 Demand lanes and twice the autonomous triage capacity.','Extra lane adds upkeep and coordination load.','The room lane meter opens a second bay.'),rank('demand.scale.2','Signal rack','4 Demand lanes and fourfold autonomous triage capacity.','Idle lanes still cost runway.','Four intake bays are shown.'),rank('demand.scale.3','Market desk','8 lanes and an eightfold buffer.','Load can create strain without Operations.','The queue meter becomes an eight-lane rail.'),rank('demand.scale.4','Distribution floor','16 lanes and the largest finite buffer.','Capacity does not create qualified prospects.','Full-scale intake is visible in the capacity rail.')],
    automate:[rank('demand.automate.1','Profile assistant','An agent performs routine profile triage from the live market.','Compute upkeep and context rot begin.','A live assistant progress signal appears.','Compute upkeep per active lane'),rank('demand.automate.2','Signal operator','Faster autonomous triage consumes the same market and Product buffer.','More compute and rot per routine pass.','Agent telemetry moves faster.','Compute upkeep per active lane'),rank('demand.automate.3','Research loop','High-throughput triage works while you operate another room.','Can stall at a full downstream buffer.','The queue rail calls out the real stall.','Compute upkeep per active lane'),rank('demand.automate.4','Autonomous desk','Routine Demand workflow is fully automated.','A larger swarm amplifies coordination pressure.','The intake line remains visibly self-running.','Compute upkeep per active lane')],
    luck:[rank('demand.luck.1','Weak signal amplifier','Named seeded output variance begins after the visible profile resolver.','A favorable profile can yield less work.','Receipt names the Luck delta.'),rank('demand.luck.2','Pattern breaker','Wider seeded output distribution with a small positive raw mean.','Finite buffer caps upside first.','Capacity preview shows capped expected work.'),rank('demand.luck.3','Trend capture','Advanced variance can create larger qualified batches.','Shared market shocks affect every lane.','Luck stream is attributed in the work receipt.'),rank('demand.luck.4','Category moment','Largest candidate variance and slightly positive expected output.','Never bypasses finite market or queue caps.','Preview reports raw and capped distribution.')],
  },
  product:{
    craft:[rank('product.craft.1','Recipe templates','2 verified work units per cooked order.','Finite trials buffer can stop a completed recipe.','Recipe pass shows doubled portions.'),rank('product.craft.2','Component library','4 verified units per order.','Incorrect assembly remains incorrect.','The station batch readout increases.'),rank('product.craft.3','Build rig','8 verified units per order.','Quality is still bounded by the acquired lead.','Multiple trial portions leave one recipe.'),rank('product.craft.4','Release line','32 verified units per order.','No trial is duplicated past its real lead count.','The output stamp shows the full batch.')],
    scale:[rank('product.scale.1','Second station','2 stations and twice the Monetisation buffer.','Extra station adds upkeep and coordination load.','Station capacity reads 2 lanes.'),rank('product.scale.2','Build bench','4 stations and a larger trial buffer.','A filled pricing queue blocks further shipping.','Four station lanes are shown.'),rank('product.scale.3','Release bay','8 stations for parallel routine work.','Idle capacity remains a cash commitment.','The capacity rail opens eight bays.'),rank('product.scale.4','Product floor','16 stations, limited by actual qualified leads.','Scale never creates Demand.','The release rail marks 16 finite lanes.')],
    automate:[rank('product.automate.1','Assembly helper','Agent completes routine verified recipes from the real lead queue.','Compute upkeep and context rot begin.','Recipe queue gains an active helper signal.','Compute upkeep per active station'),rank('product.automate.2','Build worker','Faster agent uses the same lead-to-trial resolver.','Cannot take a founder-reserved recipe.','Reserved orders stay visibly founder-owned.','Compute upkeep per active station'),rank('product.automate.3','Release cell','Parallel routine cooking continues off-room.','Stops at a full Monetisation buffer.','Station rail shows a downstream stop.','Compute upkeep per active station'),rank('product.automate.4','Autonomous kitchen','Routine Product workflow runs fully through real finite jobs.','Swarm load and rot can slow it.','Completed trial count advances live.','Compute upkeep per active station')],
    luck:[rank('product.luck.1','Prototype spark','Named seeded work-output variance begins after verified assembly.','A correct recipe can yield less finite output.','Receipt separates base batch from Luck.'),rank('product.luck.2','Unexpected fit','Wider distribution with small positive raw expected work.','Trial-buffer cap limits upside.','Preview reports the capped expectation.'),rank('product.luck.3','Breakout build','Higher variance can produce larger trial batches.','Shared shocks cannot be diversified away.','The outcome names its seeded stream.'),rank('product.luck.4','Category release','Largest candidate output variance.','Never duplicates a lead or bypasses verification.','Raw versus capped output stays visible.')],
  },
  monetisation:{
    craft:[rank('monetisation.craft.1','Closing script','2 customers from one valid timed trial cohort.','Only real activated trials can be signed.','Closing receipt shows customers committed.'),rank('monetisation.craft.2','Deal desk','4 customers per valid timed cohort.','A miss still signs nobody at Luck zero.','The contract stamp shows the batch.'),rank('monetisation.craft.3','Pricing playbook','8 customers per valid timing window.','Finite trial count caps the batch.','The pricing rail reports remaining trial capacity.'),rank('monetisation.craft.4','Revenue line','32 customers from a valid finite cohort.','Cash remains deferred to billing and collection.','ARR receipt separates signed contracts from cash.')],
    scale:[rank('monetisation.scale.1','Second closing lane','2 closing lanes and a larger trial buffer.','Extra lane adds upkeep and coordination load.','Capacity meter opens a second pricing lane.'),rank('monetisation.scale.2','Contract desk','4 lanes can hold more activated trials.','Scale does not turn a missed timing hit into ARR.','Four pricing bays are visible.'),rank('monetisation.scale.3','Revenue pod','8 lanes support parallel routine contracts.','Finite trial cohorts still gate throughput.','The rail shows eight finite closers.'),rank('monetisation.scale.4','Commercial floor','16 lanes, capped by actual trials.','Capacity never creates Product output.','The right rail exposes the active capacity.')],
    automate:[rank('monetisation.automate.1','Pricing assistant','Agent resolves routine offers through the authoritative pricing resolver.','Compute upkeep, rot and any bought Luck variance apply.','A closing signal moves on the live timing rail.','Compute upkeep per active lane'),rank('monetisation.automate.2','Contract operator','Faster agent consumes the same finite trial cohorts.','Cannot steal a founder-held timed offer.','Founder-held contracts remain reserved.','Compute upkeep per active lane'),rank('monetisation.automate.3','Revenue loop','Routine pricing runs while you work another room.','Stops cleanly when no trials exist.','The lane meter identifies an empty pipeline.','Compute upkeep per active lane'),rank('monetisation.automate.4','Autonomous closer','Routine valid pricing is fully automated from real trials.','Cash still follows billing, not the agent action.','Signed ARR and collection timing remain separate.','Compute upkeep per active lane')],
    luck:[rank('monetisation.luck.1','Pricing instinct','Named seeded contract-price variance begins after a valid timed outcome.','A signed contract can price below its base.','The receipt names the Luck price delta.'),rank('monetisation.luck.2','Market read','Wider price distribution with positive candidate expected ARR.','Finite customer count caps output.','Preview reports expected ARR and variance.'),rank('monetisation.luck.3','Negotiation edge','Advanced variance can improve contract ARR.','The same stream can worsen a good contract.','Base and Luck-adjusted price stay visible.'),rank('monetisation.luck.4','Category pricing','Largest candidate contract-price variance.','Never introduces a hidden rank-zero timing rejection.','Distribution summary remains on the skill board.')],
  },
  retention:{
    craft:[rank('retention.craft.1','Support playbook','Each squash applies 2 intervention units to a real customer problem.','A problem still needs its finite response work.','The squash stamp shows stronger intervention.'),rank('retention.craft.2','Incident pairing','Each squash applies 4 units and restores more account health.','Capacity cannot invent a customer problem.','The response meter advances in larger segments.'),rank('retention.craft.3','Customer recovery','Each squash applies 8 units and resolves severe exposure faster.','Priority still belongs to the nearest deadline.','Critical targets visibly lose more damage per squash.'),rank('retention.craft.4','Trust intervention','Each squash applies 32 units with the strongest health recovery.','Existing ARR is protected, never rebooked.','A completed rescue shows its exact protected value.')],
    scale:[rank('retention.scale.1','Second service lane','2 concurrent customer problems can be active.','More lanes add upkeep and coordination load.','The problem shelf opens a second response lane.'),rank('retention.scale.2','Success desk','4 active service lanes and a wider visible queue.','Capacity does not defer a customer deadline.','Four active targets can be prioritised.'),rank('retention.scale.3','Recovery pod','8 active service lanes for simultaneous account pressure.','Idle capacity remains a cash commitment.','The urgency rail expands to eight finite cases.'),rank('retention.scale.4','Customer floor','16 active service lanes, limited by real active accounts.','Scale never creates ARR or removes churn consequences.','The service shelf exposes its full capacity.')],
    automate:[rank('retention.automate.1','Triage assistant','Agent squashes finite customer problems through the same resolver.','Compute upkeep and context rot begin.','An assistant reticle joins the active problem.'),rank('retention.automate.2','Response operator','Faster agent progresses the most urgent unreserved problem.','Cannot take a founder-reserved intervention.','Founder-held targets remain visibly reserved.'),rank('retention.automate.3','Customer loop','Parallel service continues while you work another room.','Stops when every active problem is covered.','The queue identifies when there is nothing to resolve.'),rank('retention.automate.4','Autonomous success','Routine problems are fully worked from their finite inputs.','Automation cannot save an already expired deadline.','The response reticle remains visibly active.')],
    luck:[rank('retention.luck.1','Empathy read','Named seeded recovery variance begins after the deterministic intervention.','A rescue can recover less health.','Receipt names the Luck health delta.'),rank('retention.luck.2','Save instinct','Wider response variance can reduce a severe-case concession.','Finite issue severity caps the upside.','The receipt exposes base and Luck recovery.'),rank('retention.luck.3','Escalation sense','Advanced variance can improve the recovered account health.','The same stream can require a larger concession.','The named response stream is attributed.'),rank('retention.luck.4','Customer intuition','Largest candidate recovery variance with a slightly positive mean.','Never creates ARR or hides rank-zero variance.','Protected ARR and any concession remain separate.')],
  },
  expansion:{
    craft:[rank('expansion.craft.1','Package proof','A served package applies 2× its base addon ARR to one real account slot.','Service cost rises; slots remain finite.','Receipt shows base and upgraded ARR.'),rank('expansion.craft.2','Solution bundle','A served package applies 4× base addon ARR.','Higher value does not add slots.','Target shows contract value.'),rank('expansion.craft.3','Platform edition','A served package applies 8× base addon ARR.','Account health and maturity still gate it.','Order becomes a platform package.'),rank('expansion.craft.4','Expansion line','A served package applies 32× base addon ARR.','Collection remains delayed.','Receipt separates ARR, service and cash timing.')],
    scale:[rank('expansion.scale.1','Second assembly rail','Opens 10 usable board cells.','Supply stays finite.','Two board sockets unlock.'),rank('expansion.scale.2','Package bench','Opens 12 usable board cells.','Wrong requests cannot be fulfilled.','A third rail appears.'),rank('expansion.scale.3','Solution floor','Opens 14 usable board cells.','Unmerged parts occupy real space.','Seven paired sockets unlock.'),rank('expansion.scale.4','Portfolio line','Opens all 16 usable board cells.','Capacity creates neither slots nor ARR.','The full board perimeter unlocks.')],
    automate:[rank('expansion.automate.1','Merge helper','Agent supplies and merges a live eligible package through this board.','Compute upkeep and rot begin.','Assembly lamp advances.'),rank('expansion.automate.2','Package operator','Agent uses the same finite board and slot checks faster.','Stops at missing customers or supply.','Board shows agent ownership.'),rank('expansion.automate.3','Expansion loop','Agent moves from a completed package to the next eligible account.','It cannot serve stale or full accounts.','Order queue advances.'),rank('expansion.automate.4','Autonomous packaging','Routine assembly and serving runs from finite customer needs.','Cash still waits for collection.','Service receipt remains visible.')],
    luck:[rank('expansion.luck.1','Account read','Named seeded package-value variance begins after a valid serve.','A package can add less ARR.','Receipt names Luck delta.'),rank('expansion.luck.2','Expansion instinct','Wider package value has a small positive candidate mean.','Finite slots cap upside.','Target shows base and adjusted ARR.'),rank('expansion.luck.3','Portfolio sense','Advanced variance can improve a real addon contract.','The same stream can reduce it.','Receipt attributes the seeded stream.'),rank('expansion.luck.4','Category expansion','Largest candidate package-value variance.','Never creates rank-zero serve failure.','Service load stays account-attached.')],
  },
  operations:{
    craft:[rank('operations.craft.1','Runbook margin','Positive ticket patches clear 25% more strain and rot.','It does not soften a negative patch or refund ticket price.','Scratch receipts show deeper finite repairs.'),rank('operations.craft.2','Root-cause map','Positive operational patches clear 50% more accumulated damage.','Repairs still cannot exceed real strain, rot, or incidents.','The revealed intervention names its actual target.'),rank('operations.craft.3','Recovery drill','Positive repairs carry 75% more finite recovery output.','A quiet system can waste repair upside.','Resolved pressure drops farther per claimed patch.'),rank('operations.craft.4','Reliability practice','Positive repairs apply twice the rank-zero operational output.','Cash patches and downside remain unchanged.','The strongest repair depth is visible on every patch.')],
    scale:[rank('operations.scale.1','Second vendor book','3 tickets per quarter with 5 patches each; Ops capacity rises through the real unit model.','More paid surface means more tail exposure and unit upkeep.','Ticket stock and scratch grid expand.'),rank('operations.scale.2','Audit bench','4 tickets per quarter with 6 patches each.','The larger book consumes more founder or agent time.','Six finite patches fill the active ticket.'),rank('operations.scale.3','Reliability desk','5 tickets per quarter with 7 patches each.','More Operations units add recurring upkeep.','Seven-patch tickets and capacity are shown together.'),rank('operations.scale.4','Operating floor','6 tickets per quarter with 8 patches each.','Maximum supply still resets only at the next quarter.','The full finite ticket book is visible.')],
    automate:[rank('operations.automate.1','Audit clerk','Buys from finite ticket stock and resolves every remaining patch.','Pays compute upkeep and accepts every negative patch.','Agent ownership and whole-ticket settlement are shown.','Compute upkeep per Operations unit'),rank('operations.automate.2','Incident operator','Resolves paid tickets faster through the same patch ledger.','Cannot cherry-pick positives or replay founder claims.','Mixed founder-to-agent handoffs retain exact claims.','Compute upkeep per Operations unit'),rank('operations.automate.3','Reliability loop','Works successive finite tickets while the founder runs another room.','Stops when stock or cash is exhausted.','Remaining quarterly stock visibly decreases.','Compute upkeep per Operations unit'),rank('operations.automate.4','Autonomous operations','Fully runs the finite ticket workflow at maximum candidate speed.','High upkeep and correlated Luck tails can still ruin an overextended company.','Whole-ticket returns remain attributed after upkeep.','Compute upkeep per Operations unit')],
    luck:[rank('operations.luck.1','Vendor uncertainty','Adds a named shared/local spread around already-random ticket outcomes.','Positive patches can flip negative and correlated tickets can sting.','Ticket terms show the wider modeled range.'),rank('operations.luck.2','Crisis arbitrage','Widens both upside and downside without rerolling an issued ticket.','Inspection cannot change the sampled patch set.','Reload preserves every signed patch.'),rank('operations.luck.3','Countercyclical bet','Larger shared shocks create fatter whole-ticket tails.','A swarm cannot diversify the ticket-level shock away.','Risk preview reports higher variance and tail loss.'),rank('operations.luck.4','Black-swan desk','Maximum candidate spread with unchanged named-stream expectation.','The worst tickets can overwhelm thin cash reserves.','The widest signed range is visible before purchase.')],
  },
};

export function skillRank(work:Work,axis:Axis,rankNumber:number):SkillRankDefinition|undefined {
  return SKILL_RANKS[work]?.[axis]?.[rankNumber-1];
}
export const SEGMENTS = ['Independent creators', 'Small teams', 'Enterprise operators'];
export const PARTS = ['Speed', 'Collaboration', 'Control'];
export const RECIPES = [[0,1,0], [1,0,2], [2,1,2]];
export const UPGRADES = [
  {id:'community', name:'Word of mouth', text:'Demand acquisition costs fall 35%. A distribution build that leaves more cash for capability.'},
  {id:'quality', name:'Do things properly', text:'Shipped product fit improves by 0.12. Better fit raises willingness to pay and customer health.'},
  {id:'care', name:'Customers talk back', text:'Retention care lasts two months. More time for expansion; no free ARR.'},
  {id:'lean', name:'Stay embarrassingly small', text:'Base overhead and unit upkeep fall 25%. Agent compute still costs money.'},
  {id:'maintenance', name:'Leave a paper trail', text:'Operations repair output increases 50%. A supervisor build for a larger swarm.'},
  {id:'terms', name:'Get paid sooner', text:'New invoice payment terms are 50% shorter. Revenue is unchanged; liquidity arrives earlier.'},
] as const;
