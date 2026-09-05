# ONE PERSON UNICORN
## Canonical Product Context V2

Status: CURRENT PRODUCT TRUTH FOR V2 SYSTEM DESIGN

This file supersedes prior product-direction discussions where they conflict.

Do not silently preserve older V1 mechanics if they contradict this file.

Balance numbers explicitly marked `PROVISIONAL` are design starting points that must be validated by simulation and human playtests before implementation lock.

---

# 1. Product thesis

A roguelike business simulation about building a one-person AI company from a tiny founder-led startup into a unicorn.

The fantasy is:

```text
DO THE WORK YOURSELF
-> GROW
-> CREATE MORE WORK THAN ONE PERSON CAN HANDLE
-> BUY TOOLS
-> ADD AGENTS
-> AUTOMATE FUNCTIONS
-> CREATE COMPLEXITY
-> CREATE CONTEXT ROT
-> BUILD SYSTEMS TO CONTROL THE MACHINE
-> TAKE CAPITAL OR STAY INDEPENDENT
-> KEEP GROWING
-> SURVIVE THE COMPANY YOU BUILT
-> REACH $1B VALUATION
```

The game is not primarily about vibe coding.

The larger premise is:

> People increasingly believe AI makes a one-person unicorn simple. The game shows that AI makes scale possible, but replaces employee-management problems with agent-management problems, coordination load, context rot, capital pressure, operational failures and founder attention overload.

The player starts as the worker.

The player ends as the operator of an increasingly autonomous machine.

---

# 2. Primary objective and score

Primary score:

```text
VALUATION
```

Primary checkpoint:

```text
REACH $1,000,000,000 VALUATION
```

The player may continue after unicorn.

Valuation should remain explainable.

Canonical:

```text
ENDING_ARR
=
STARTING_ARR
+ NEW_CUSTOMER_ARR
+ EXPANSION_ARR
- CHURNED_ARR
```

```text
NET_NEW_ARR
=
NEW_CUSTOMER_ARR
+ EXPANSION_ARR
- CHURNED_ARR
```

```text
VALUATION
=
ENDING_ARR
x LOCKED_GROWTH_MULTIPLE
```

```text
FOUNDER_STAKE_VALUE
=
FOUNDER_OWNERSHIP
x VALUATION
```

Do not directly multiply valuation by:

- autonomy
- AI usage
- founder history
- investor prestige
- cash
- debt
- Operations score
- upgrade rarity
- luck
- brand
- random events

Those systems affect the player's ability to generate or protect ARR and therefore affect valuation indirectly.

A company can increase ARR but fall in valuation if growth decelerates enough to move into a lower multiple band.

---

# 3. Game hierarchy

The full game is organized into three layers.

## 3.1 MICRO

Moment-to-moment work.

Seven active work functions:

```text
MARKETING
PRODUCT
MONETIZATION
RETENTION
EXPANSION
OPERATIONS
FINANCE
```

Each is a tactile one-pointer minigame with its own skill tree.

Every function matters.

No function should be safely ignorable for an entire successful run unless the player has explicitly built systems that replace its manual role.

## 3.2 MACRO

Founder mayhem.

This layer decides most long-term outcomes:

```text
founder attention
context switching
quarterly growth goal
company strategy
skill-tree investment
agent architecture
cash reserves
debt
funding decisions
complexity
strain
context rot
cross-function interactions
quarterly permanent upgrades
```

## 3.3 SIGNALING

The competitive and dopamine layer:

```text
valuation number go up
time to unicorn
quarter reached
growth difficulty
founder ownership
bootstrap achievements
debt-free runs
automation percentage
build labels
daily seeds
leaderboards
secret endings
game-breaking strategies
```

---

# 4. Work-function economic bridge

The seven functions are connected.

```text
MARKETING
-> creates Demand

PRODUCT
-> converts Demand into Activation

MONETIZATION
-> converts Activation into New Customer ARR

RETENTION
-> prevents Churned ARR

EXPANSION
-> creates Expansion ARR from existing customers

OPERATIONS
-> protects Cash, agent reliability, context integrity and operating capacity

FINANCE
-> acquires and manages capital
```

Marketing does not directly create ARR.

Product does not directly create ARR.

Retention cannot create positive ARR.

Operations does not directly create ARR.

Finance does not directly create ARR or valuation.

The player should be able to visually follow economic cohorts through this chain.

---

# 5. Economic cohorts

The company should operate on visible cohorts rather than abstract disconnected points.

## 5.1 Demand Cohort

Created by Marketing.

Contains:

```text
source
segment
quality
growth-unit value
acquisition context
```

## 5.2 Activated Cohort

Created when Product successfully serves Demand.

Contains Product-quality and implementation information.

## 5.3 Customer Cohort

Created by Monetization.

Contains:

```text
original ARR
current ARR
health
acquisition quality
product quality
expansion potential
pricing model
customer segment
```

This customer then becomes input for:

```text
RETENTION
+
EXPANSION
```

A run should naturally produce stories such as:

```text
Marketing finds a qualified fintech cohort
-> Product ships required workflow
-> Monetization closes $X ARR
-> customer later suffers an outage
-> Retention saves the customer
-> Expansion later cross-sells analytics
-> the same cohort grows in ARR
```

---

# 6. Manual founder scaling rule

The founder must not scale linearly with company size.

A max-Craft founder should become extremely capable but still unable to manually sustain unicorn-scale growth because one founder can only directly operate one function at a time.

The earlier linear Growth Unit model should not be preserved if it allows an identical manual action to remain worth the same percentage of ARR at every scale.

Canonical direction:

```text
economic value per work unit scales sublinearly with ARR
```

A suggested starting curve is:

```text
GU
=
$5,000
x
(STARTING_ARR / $100,000)^(2/3)
```

with a $5K minimum.

Status:

```text
PROVISIONAL FORMULA
```

This formula must be simulated before final lock.

Required outcome:

- manual Craft is powerful early
- manual Craft becomes increasingly insufficient
- Scale and Autonomy become necessary for fast growth
- the game never needs an arbitrary "manual ARR cap"

Target Craft-only behavior:

```text
perfect manual play
+ heavily maxed Craft
+ good upgrades
+ minimal automation
```

should still find $1B valuation extremely difficult.

Provisional target:

```text
Craft-only unicorn by Q16: <5%
```

---

# 7. Founder attention

The founder has no stamina bar.

The real resource is attention.

Canonical:

```text
ONE ACTIVELY CONTROLLED WORK FUNCTION AT A TIME
```

Other functions continue running.

The core pressure is context switching.

Early:

```text
Founder can personally keep up.
```

Mid:

```text
Founder can no longer cover all queues.
```

Late:

```text
Agents perform most throughput.
Founder configures systems, handles exceptions, manages capital and fights operational rot.
```

---

# 8. The seven work-function interactions

All interactions must work on:

```text
touch
mouse
trackpad
```

No core interaction may require:

```text
hover
right-click
keyboard shortcut
multi-touch
```

---

# 9. Marketing

## Interaction

```text
SWIPE / TRIAGE
```

Reference grammar:

card-sorting and swipe-based hypercasual judgement games.

The player reads partially visible market signals.

Core signals:

```text
Audience Fit
Purchase Intent
Trend Velocity
Saturation
Acquisition Cost
```

Base player sees only part of the information.

Core action:

```text
LEFT  = Ignore
RIGHT = Pursue
UP    = Aggressively Pursue
```

The player is not rewarded for maximizing raw demand.

The skill is identifying demand worth feeding into a constrained company.

### Correct pursue

Creates qualified Demand.

### Aggressive pursue

Creates more Demand but costs Cash and creates larger downstream workload.

### Poor pursue

Creates Low-Quality Demand.

Low-Quality Demand can still convert but produces more Retention pressure later.

### Marketing fantasy

```text
signal detection
+
portfolio judgement
+
trend timing
+
capacity awareness
```

---

# 10. Product

## Interaction

```text
ASSEMBLE / RECIPE
```

Reference grammar:

recipe games and merge/assembly interactions.

Product Requests use deterministic feature recipes.

Examples:

### Enterprise SSO

```text
AUTH
+
IDENTITY PROVIDER
+
ADMIN CONTROL
+
TEST
+
DEPLOY
```

### AI Search

```text
DATA
+
RETRIEVAL
+
MODEL
+
EVAL
+
DEPLOY
```

### Usage Billing

```text
METER
+
BILLING
+
ANALYTICS
+
TEST
+
DEPLOY
```

Components enter a tray.

The player drags the correct pieces into a recipe.

Correct pieces combine into increasingly complete feature objects.

Wrong pieces bounce and create rework delay.

The player may:

```text
TEST -> VERIFIED -> SHIP
```

or:

```text
SHIP EARLY
```

Shipping early creates Activation sooner but deterministically creates additional Churn and/or Operations pressure.

The core skill is:

```text
requirements understanding
+
assembly
+
queue management
+
risk judgement
```

---

# 11. Monetization

## Interaction

```text
TIME YOUR TAP
```

Reference grammar:

quick-time timing meters such as penalty-shot timing.

A moving cursor crosses a customer-specific pricing band.

Baseline zones:

```text
TOO CHEAP
GOOD
PERFECT
GOOD
TOO EXPENSIVE
```

One tap resolves the pricing opportunity.

Customer archetypes move and resize the bands.

Later upgrades may introduce pricing-model selection:

```text
FLAT
PER SEAT
USAGE
```

The room evolves from pure timing into:

```text
pricing-model judgement
+
segment understanding
+
timing execution
```

Monetization is the primary converter of Activation into New Customer ARR.

---

# 12. Retention

## Interaction

```text
DRAG CURSOR
+
AIM
+
AUTO-FIRE
```

Reference grammar:

Whack-a-Mole urgency and Bills Must Be Paid-style automatic action on prioritized targets.

Customer threats enter the board and move toward:

```text
CHURN
```

Examples:

```text
FAILED PAYMENT
BROKEN WORKFLOW
SUPPORT ESCALATION
OUTAGE
BAD ONBOARDING
MISSING FEATURE
```

The founder moves the pointer to prioritize threats.

Founder intervention fires automatically.

The skill is not click speed.

The skill is prioritization.

Example decision:

```text
save several small cohorts
or
save one large enterprise cohort
```

Threat severity controls:

```text
required intervention
ARR at risk
time to churn
```

Retention prevents Churned ARR.

It never directly creates positive ARR.

---

# 13. Expansion

## Interaction

```text
MERGE
+
CREATE CUSTOM PACKAGE
```

Reference grammar:

Gossip Harbor-like generators and merge chains combined with account-fit packaging.

Existing customers have needs.

Example modules:

```text
Seats
Analytics
Automation
Security
Integrations
Support
Data
```

Merge progression examples:

```text
Analytics + Analytics
-> Reporting

Reporting + Reporting
-> Intelligence
```

```text
Automation + Automation
-> Workflow

Workflow + Workflow
-> Autonomous Workflow
```

The player then creates a custom package matching customer needs.

The game combines:

```text
merge-board management
+
package quality
+
semantic fit
+
account timing
+
hidden customer needs
```

Excellent package:

```text
large Expansion ARR
```

Poor package:

```text
low or zero Expansion ARR
+
possible churn pressure
```

Expansion requires a natural cap or other limit so existing customers cannot become an infinite ARR exploit.

The old 8% base quarterly Expansion cap may remain a calibration reference but is not automatically locked for V2.

---

# 14. Operations

Operations is redesigned.

It is not primarily a guaranteed "scratch -> correct diagnosis -> reward" system.

Its late-game fantasy is:

```text
the autonomous machine has created increasingly strange operational problems
```

Operations has two types of incoming cards.

## 14.1 Obligations

Problems already happening.

Examples:

```text
Cloud bill
API spike
Agent retry storm
Rate limit
Bad deployment
Security warning
Duplicate workflow
Context overflow
Model regression
Recursive automation
```

Ignoring them creates ongoing consequences.

Scratching reveals evidence.

The goal is minimizing damage.

## 14.2 Optimization Scratchers

Optional high-risk cards.

Reference:

Lucky Cat-like high-risk trap-card behavior in Scritchy Scratchers.

Examples:

### One-Line Fix

Potential outcomes:

```text
large cost saving
small saving
nothing
new incident
production failure
context corruption
```

### Black Box Optimizer

Let an agent rewrite a workflow.

### Unlimited Permissions

Remove approval requirements.

### Context Compact

Compress agent context aggressively.

### Switch Model Globally

Change the model across multiple agent systems.

These are not guaranteed rewards.

They are high-variance operational bets.

---

# 15. Variance / Luck

Every work function receives a fourth skill-tree branch:

```text
VARIANCE
```

Variance offers:

```text
slightly positive expected value
+
much larger upside
+
much larger downside
```

Internal balance may use an expected utility / RTP-like metric.

This is a game-balancing concept only.

Target illustrative EV:

```text
Tier I   ~102%
Tier II  ~103%
Tier III ~104%
Tier IV  ~105%
```

Status:

```text
PROVISIONAL
```

The important rule is not the exact number.

The important rule is:

> Higher Variance tiers should increase both tails much more than they increase average value.

Tier IV should occasionally create:

```text
run-defining jackpot
```

or:

```text
run-threatening disaster
```

The player should feel like Variance is a massive unlock even though long-run EV remains only slightly favorable.

---

# 16. Universal skill-tree grammar

Each of the seven work functions contains four branches:

```text
CRAFT
SCALE
AUTONOMY
VARIANCE
```

Each branch contains:

```text
4 subbranches
```

Each subbranch contains:

```text
4 tiers
```

Therefore:

```text
4 branches
x
4 subbranches
x
4 tiers
=
64 skill ranks per work function
```

Across seven functions:

```text
448 total skill ranks
```

The breadth is intentional.

A player should only explore a fraction of the full catalogue in one run.

---

# 17. Meaning of each branch

## Craft

Question:

> How good is the founder personally at this job?

Craft usually improves:

```text
information
precision
manual throughput
manual risk judgement
manual interaction quality
```

Craft creates little or no Complexity.

Craft alone must not scale to easy unicorn status.

## Scale

Question:

> How much work can this function process?

Scale improves:

```text
queues
concurrency
workspace size
generators
coverage
throughput
```

Scale adds Complexity.

## Autonomy

Question:

> How much of this function can operate without the founder?

Autonomy adds:

```text
agents
agent policies
automated routing
closed-loop execution
```

Autonomy creates:

```text
recurring Cash cost
+
Complexity
+
Context Rot exposure
```

## Variance

Question:

> How much volatility will the player accept for asymmetric outcomes?

Variance adds:

```text
rare jackpots
rare disasters
unusual opportunities
high-risk shortcuts
higher mayhem
```

---

# 18. Marketing skill-tree structure

## Craft

### Signal Reading
T1 reveal additional signal  
T2 reveal confidence  
T3 flag conflicting signals  
T4 show strongest positive and negative clue

### Qualification
T1 show segment  
T2 show likely quality  
T3 preview Retention sensitivity  
T4 preview downstream workload

### Swipe Control
T1 larger tolerance  
T2 faster recovery  
T3 streak forgiveness  
T4 premium perfect-swipe feedback / timing advantage

### Portfolio Sense
T1 show Product backlog  
T2 show Monetization backlog  
T3 predicted capacity warning  
T4 cross-room pursuit recommendation

## Scale

### Channels
T1-T4 progressively add parallel opportunity sources

### Queue
T1-T4 progressively increase visible backlog capacity

### Repurposing
T1-T4 increase follow-up opportunity generation

### Campaign Burst
T1-T4 improve burst acquisition capability

## Autonomy

### Agent Core
Worker -> Specialist -> Swarm -> Closed Loop

### Perception
reads partial signals -> full signals -> interactions

### Quality Policy
avoids junk -> quality optimization

### Routing
queue-aware -> Product-aware -> autonomous GTM routing

## Variance

### Virality
small viral procs -> rare massive viral event

### Trend Surfing
emerging-trend bets -> quarter-defining trend

### Creator Bet
creator experiments -> breakout channel

### Controversy
high-output / low-quality upside -> potential backlash engine

---

# 19. Product skill-tree structure

## Craft

### Requirement Reading
increasing recipe visibility

### Assembly
improved snapping, recovery and multi-piece control

### Verification
better test/eval visibility

### Ship Judgement
increasingly clear downside previews

## Scale

### Workspaces
more concurrent requests

### Component Supply
faster and more targeted pieces

### Parallel Build
more simultaneous recipes

### Release System
faster and more automated release handling

## Autonomy

### Agent Core
Worker -> Specialist -> Swarm -> Closed Loop

### Builder
simple -> complex recipe completion

### QA
basic testing -> adaptive eval policy

### Release Policy
verified deploy -> end-to-end autonomous shipping

## Variance

### Weekend Ship
speed for operational risk

### Model Upgrade
experimental model progression

### Prototype Lottery
shortcut from demo to production

### Moonshot Feature
rare huge Activation result or major failure

---

# 20. Monetization skill-tree structure

## Craft

### Customer Signals
increasing willingness-to-pay information

### Timing
improved manual timing windows

### Segmentation
deeper customer economics

### Pricing Models
flat -> seats -> usage -> contextual model selection

## Scale

### Opportunity Queue
more concurrent pricing opportunities

### Quote Speed
higher pricing throughput

### Packaging
more package choices

### Collections
annual/prepay and contract systems

## Autonomy

### Agent Core
Worker -> Specialist -> Swarm -> Closed Loop

### Segmenter
basic -> predictive segmentation

### Pricing Policy
safe -> portfolio-optimized pricing

### Contracting
quotes -> renewals -> closed-loop revenue desk

## Variance

### Whale Hunt
rare large accounts

### Usage Spike
variable usage economics

### Annual Prepay
large immediate Cash outcomes

### Premium Packaging
very narrow high-value outcomes

---

# 21. Retention skill-tree structure

## Craft

### Cohort Value
increasing customer-value visibility

### Aim
improved manual targeting

### Root Cause
deeper cause identification

### Save Streak
clutch-save and combo mechanics

## Scale

### Fire Rate
higher intervention throughput

### Coverage
more simultaneous threats

### Early Warning
more lead time

### Recovery
winback and faster recovery

## Autonomy

### Agent Core
Worker -> Specialist -> Swarm -> Closed Loop

### Targeting
nearest -> ARR-aware -> portfolio-aware

### Billing
retry -> automated dunning

### Health
reactive -> proactive churn prevention

## Variance

### Hero Save
rare dramatic rescue

### Advocacy
saved customers may generate Demand

### Winback
churned cohorts may return

### Refund Gambit
Cash sacrifice for uncertain Retention outcome

---

# 22. Expansion skill-tree structure

## Craft

### Need Reading
reveal account requirements

### Merge Control
improve merge interaction

### Packing
improve spatial/package fitting

### Conflict Sense
better package-fit visibility

## Scale

### Generators
additional feature generators

### Board
larger inventory / workspace

### Merge Depth
deeper package tiers

### Accounts
more simultaneous account opportunities

## Autonomy

### Agent Core
Worker -> Specialist -> Swarm -> Closed Loop

### Merge Bot
basic -> inventory-optimized merging

### Package Agent
simple -> fully fit-aware package creation

### Account Router
single account -> autonomous expansion portfolio

## Variance

### Whale Expansion
rare major expansion

### Seat Surge
sudden seat-growth events

### Partner Jackpot
partner-driven account expansion

### Bundle Bet
high-risk custom packaging

---

# 23. Operations skill-tree structure

## Craft

### Scratch Control
improved reveal control

### Evidence
more useful clues

### Diagnosis
better root-cause reasoning

### Risk Reading
increasingly clear upside/downside distributions

## Scale

### Inbox
larger incident capacity

### Observability
logs -> traces -> causal graph

### Ops Capacity
increases organizational capacity

### Recovery
faster restart / remediation

## Autonomy

### Agent Core
Scratch Bot -> Diagnostic Agent -> Remediation Swarm -> Self-Healing Loop

### Evidence
automatic reveal and correlation

### Remediation
S1 -> S3 automation

### Rot Maintenance
automatic context hygiene

## Variance

### One-Line Fix
high-risk shortcut

### Black Box Optimizer
workflow optimization gamble

### Vendor Roulette
provider credit / cost / reliability gamble

### Permission Roulette
broader agent permissions for more autonomous upside and catastrophic risk

---

# 24. Finance

Finance becomes the seventh active work function.

It is not confined to quarter-end.

Finance handles:

```text
VC offers
debt
interest payments
runway
capital timing
treasury
future DLC finance events
```

Future Finance DLC may eventually include:

```text
acquisitions
board politics
acquisition offers
competitor threats
structured financing
```

These are not V2 core requirements.

---

# 25. Finance active interaction

## Investor offers

Funding appears as a time-sensitive event during active gameplay.

The founder may:

```text
open Finance
and respond
```

or:

```text
ignore / dismiss
and keep operating
```

A successful bootstrap founder may repeatedly receive offers and repeatedly decline them.

A struggling indebted founder may receive very little investor interest.

A previously funded company whose growth has decelerated should find future raises harder.

### Investor interest

Growth is the dominant input.

Other inputs may include:

```text
ARR stage
growth acceleration
cash health
existing debt
prior financing
recent growth trend
```

Canonical direction:

```text
FUNDING_CHANCE
is strongly positively related to growth
and negatively related to poor financial health / debt stress / growth deceleration
```

Exact probability formula:

```text
NOT YET LOCKED
```

---

# 26. Finance QTE

When an investor offer arrives:

```text
FUND INBOUND
```

The player has a short response window.

Opening the event reveals terms such as:

```text
CHECK SIZE
VALUATION / SAFE CAP
DILUTION
CONTROL / COVENANT
```

Core choices:

```text
ACCEPT
COUNTER
PASS
```

Counter success depends on investor interest.

High-growth companies gain negotiating power.

Weak companies do not.

Funding adds Cash and dilution.

Funding does not directly add ARR or Valuation.

---

# 27. Debt active interaction

Debt should feel dangerous and present.

Drawing debt gives:

```text
+CASH
+DEBT
```

Interest then arrives as time-sensitive Finance obligations.

Example choices:

```text
PAY INTEREST
PAY + PRINCIPAL
REFINANCE
IGNORE
```

Ignoring interest:

```text
capitalizes unpaid interest
+
increases future financing pressure
+
increases Debt Stress
```

Exact APR step-ups:

```text
NOT YET LOCKED
```

Debt Stress should affect the company through visible consequences, particularly Retention and Cash pressure.

Do not directly subtract ARR because debt exists.

---

# 28. Emergency Growth-Mandate bridge

Missing the Growth Mandate is normally lethal.

The player receives one emergency debt save per run.

Example:

```text
Target ARR:  $10.0M
Actual ARR:   $9.3M
Shortfall:    $0.7M
```

Normally:

```text
GROWTH MANDATE MISSED
```

Once per run, the player may:

```text
BRIDGE THE MISS
```

This does not create fake ARR.

Instead:

```text
Run continues
+
Emergency Debt
+
Growth Arrears = $0.7M
```

Next quarter's required target becomes:

```text
NORMAL MANDATE TARGET
+
GROWTH ARREARS
```

The player deferred death rather than erased the miss.

---

# 29. Growth Mandate

Growth Commitment is renamed conceptually to:

```text
GROWTH MANDATE
```

The player chooses it once at the beginning of the run.

Options:

```text
10%
25%
50%
75%
100%
```

It is:

```text
difficulty
+
speedrun category
+
self-imposed challenge
```

It does not:

- increase upgrade quality
- change spawn rates
- add rewards
- grant economic bonuses
- alter RNG

Every quarter:

```text
ACTUAL_QUARTERLY_GROWTH
must meet or exceed
GROWTH_MANDATE
```

Missing it ends the run unless the one-time emergency bridge is used.

This makes runs directly comparable by Mandate.

---

# 30. Growth multiple

Growth remains the direct driver of valuation multiple.

The exact multiple table may preserve the earlier V1 calibration until V2 simulation replaces it.

The mechanic is canonical.

The exact band values remain:

```text
CALIBRATION-ELIGIBLE
```

The player must always understand:

```text
ARR
x
Growth Multiple
=
Valuation
```

---

# 31. Skill trees vs quarterly strategy vs Relics

These are three different progression systems.

## Skill trees

Predictable.

Purchased intentionally.

Paid with Cash.

Represent permanent operating capability for the current run.

## Quarterly Strategy

A deliberate founder-level operating decision.

Usually lasts:

```text
1-3 quarters
```

Changes company behavior and tradeoffs.

## Relics

Unexpected roguelike permanent run modifiers.

Internal system name:

```text
RELIC
```

The quarter-close UI should not say:

```text
PICK A RELIC
```

Instead, surface something semantic such as:

```text
WHAT CHANGED?
```

The player may later view owned Relics in a collection / build surface.

---

# 32. Quarterly epoch

Active quarter target:

```text
~150 seconds
```

Quarter-end interaction should be inspired by strong post-round roguelike flows.

Quarter close is not where Finance lives anymore.

Finance remains active during the quarter.

Quarter close handles:

## 32.1 Results

Show:

```text
STARTING ARR
+ NEW CUSTOMER ARR
+ EXPANSION ARR
- CHURNED ARR
= ENDING ARR
```

Then:

```text
ACTUAL GROWTH
vs
GROWTH MANDATE
```

Then:

```text
NEW MULTIPLE
NEW VALUATION
```

Also summarize:

```text
Cash
Debt
Interest
Founder Ownership
Complexity
Rot
Automation
```

## 32.2 What Changed?

Offer three contextual permanent run cards.

These are Relics internally.

## 32.3 Next Quarter Strategy

Offer contextual company-level strategic choices.

## 32.4 Invest

Spend Cash freely across skill trees.

There is no artificial "two purchases per quarter" limit.

The real constraints are:

```text
Cash
future burn
Complexity
opportunity cost
```

---

# 33. Quarterly Strategy catalogue

Quarterly Strategy is intentionally separate from Relics.

Target catalogue:

```text
~42 strategies
```

Examples:

```text
Enterprise Upmarket
Self-Serve Everything
Product-Led
Founder-Led Sales
Reliability Quarter
Blitzscale
Default Alive
Usage-Based
Annual Contracts
Verticalize
International
Open Source
Channel Partnerships
Cut Costs
Model Upgrade
Build vs Buy
Consolidate Stack
Go Viral
White Glove
Enterprise Security
```

Strategies should create explicit tradeoffs.

Example:

### Enterprise Upmarket

```text
larger cohorts
+
better Expansion potential
-
harder Product recipes
-
more Operations complexity
```

Quarterly strategy is one of the strongest Macro decision systems in the game.

---

# 34. Complexity

Complexity is not an anti-idle mechanic.

Complexity measures:

```text
COORDINATION LOAD
```

It comes from:

```text
agents
parallel workflows
additional channels
concurrent workspaces
advanced pricing systems
automated routing
complex packaging
cross-function integrations
high-risk systems
```

Complexity should not increase merely because ARR increased.

---

# 35. Ops Capacity

Ops Capacity represents:

```text
how much organizational complexity the company can safely coordinate
```

Derived:

```text
STRAIN
=
COMPLEXITY
/
OPS_CAPACITY
```

Strain affects:

```text
agent reliability
handoff latency
incident frequency
context-rot generation
retry behavior
```

It does not directly change ARR.

Provisional state table:

| Strain | State | Agent reliability | Handoff latency | Incident rate | Rot generation |
|---:|---|---:|---:|---:|---:|
| <=0.75 | Clean | no penalty | normal | normal | 1.0x |
| 0.75-1.00 | Busy | no penalty | +10% | +10% | 1.2x |
| 1.00-1.25 | Strained | -5pp | +20% | +30% | 1.5x |
| 1.25-1.50 | Overloaded | -12pp | +35% | +70% | 2.5x |
| >1.50 | Runaway | -20pp | +50% | +150% | 4.0x |

Status:

```text
PROVISIONAL NUMBERS
CANONICAL CONSEQUENCE CATEGORIES
```

---

# 36. Context Rot

Complexity and Rot are distinct.

## Complexity

Structural:

> How many moving pieces have I created?

## Rot

Dynamic:

> How far has the autonomous system drifted from what I intended?

Rot increases from:

```text
continuous autonomous operation
high Strain
agent-to-agent handoffs
unreviewed actions
risky Variance outcomes
stale workflows
contradictory instructions
```

Operations reduces Rot.

Provisional states:

| Rot | State | Consequence |
|---:|---|---|
| 0-24 | Fresh | normal |
| 25-49 | Drift | agent mistakes increase |
| 50-74 | Context Rot | larger mistake + retry pressure |
| 75-99 | Agent Slop | severe mistakes increasingly likely |
| 100 | Corrupted | agent line must be reset |

Exact penalty values:

```text
NOT YET LOCKED
```

Canonical late-game loop:

```text
ADD AGENTS
-> GROW FASTER
-> ADD MORE AGENTS
-> MORE HANDOFFS
-> MORE COMPLEXITY
-> MORE STRAIN
-> FASTER ROT
-> AGENTS START DOING STUPID THINGS
-> FOUNDER RETURNS TO OPERATIONS
-> AUTONOMOUS COMPANY BECOMES A FULL-TIME JOB
```

---

# 37. Autonomy ladder

The earlier agent ladder remains a useful calibration reference.

Conceptual tiers:

```text
Worker
Specialist
Swarm
Closed Loop
```

Earlier baseline:

| Tier | Cumulative install | Monthly | Throughput vs founder | Reliability | Complexity |
|---|---:|---:|---:|---:|---:|
| Worker | 1 CU | .15 CU | .60x | 72% | 1 |
| Specialist | 3 CU | .30 CU | 1.30x | 84% | 1.5 |
| Swarm | 7 CU | .60 CU | 2.60x | 90% | 3 |
| Closed Loop | 14 CU | 1.00 CU | 4.50x | 94% | 5 |

Status:

```text
CALIBRATION REFERENCE
NOT FINAL V2 BALANCE
```

Agents must visibly perform the same underlying work interaction as the founder.

Do not make agents invisible percentage buffs.

---

# 38. Finance skill-tree structure

Finance has the same four branches.

## Craft

### Term Reading
T1 highlight dilution  
T2 highlight APR  
T3 highlight covenants  
T4 compare full economic cost

### Runway
T1 current runway  
T2 forward burn  
T3 scenario runway  
T4 live downside forecast

### Negotiation
T1 basic counter  
T2 better acceptance  
T3 term-specific counter  
T4 multi-term negotiation

### Timing
T1 longer response  
T2 investor-quality preview  
T3 momentum preview  
T4 optimal-timing signal

## Scale

### Investor Funnel
more investor access

### Lender Access
credit -> revenue financing -> venture debt -> structured credit

### Treasury
cash alerts -> reserves -> debt calendar -> capital planning

### Financing Options
pre-seed -> Seed -> A -> B+

## Autonomy

### Bookkeeper
cash -> bills -> forecast -> automated close

### Capital Scout
watch -> screen -> rank -> negotiate preliminary terms

### Debt Manager
remind -> schedule -> principal strategy -> refinance

### Treasurer
cash routing -> reserves -> risk limits -> autonomous treasury

## Variance

### Warm Intro
better investor outcomes

### Hot Round
competitive investor demand

### Credit Bet
volatile debt opportunities

### Bridge Gamble
high-risk emergency financing

---

# 39. Relic system

The earlier ~48-card scope is considered underscoped.

V2 target:

```text
224 Relics
```

Suggested catalogue architecture:

```text
84 function Relics
56 branch Relics
42 cross-function Relics
28 universal founder Relics
14 cursed / scar-tissue Relics
```

Status:

```text
TARGET CATALOGUE SIZE
NOT ALL CONTENT YET AUTHORED
```

Relics should be:

```text
funny
contextual
founder-relatable
immediately understandable
mechanically meaningful
```

Rare and high-tier Relics should primarily alter:

```text
rules
routing
timing
risk
capacity
probability
cross-function causality
```

Avoid a catalogue dominated by:

```text
+10%
+15%
+20%
```

---

# 40. Relic eligibility

The player's company architecture changes which Relics can appear.

This must be intuitive and visible.

Examples:

```text
Product Scale investment
-> Shipping Relics become eligible
```

```text
multiple Agents
-> Agent Management Relics
```

```text
Complexity > Ops Capacity
-> Orchestration / Scar Tissue Relics
```

```text
Debt > 0
-> Debt / Default-Alive Relics
```

```text
high Marketing Variance
-> Virality / Backlash Relics
```

```text
several Autonomy branches
-> Cross-Agent Relics
```

Every gated Relic should communicate why it entered the pool.

Example:

> Available because you built three autonomous revenue functions.

The company architecture becomes the player's class.

---

# 41. Relic naming and founder semantics

Relics may have funny founder-life names.

Examples:

```text
Warm Intro
Ramen Profitable
Design Partner
Launch Day
Cloud Credits
The Spreadsheet
Founder Mode
SOC 2 Binder
Default Alive
All-In-One Prompt
Five Parallel Terminals
Customer Slack
Annual Plan Discount
Zero Inbox
One More Agent
Ship Friday
Actually Read the Diff
The Rewrite
AWS Invoice
Customer Is Also an Investor
Open Source It
Enterprise Ready™
```

Each card needs:

```text
funny semantic name
+
one-sentence plain-English effect
+
optional detailed tooltip
```

No MBA-language soup.

No joke may require knowledge of a real SaaS logo or copied post.

---

# 42. Culture engine

The central culture is:

```text
ONE-PERSON AI COMPANY
```

not:

```text
VIBE CODING
```

Vibe-coding memes are one content source.

The game should draw from:

```text
AI can replace teams
agent sprawl
context windows
context rot
parallel agents
recursive automation
production failures
model changes
tool subscriptions
cloud costs
permissions
review bottlenecks
agent hallucination
support automation
AI-generated product sameness
funding hype
one-person unicorn discourse
autonomy optimism
autonomy failure
```

The emotional arc:

```text
AI is magic
-> AI saves enormous time
-> add more agents
-> agents need coordination
-> coordination needs systems
-> systems create more complexity
-> agents drift
-> founder becomes manager of machines
```

---

# 43. Cultural-content safety

Do not paste current memes or posts directly into the game.

Process:

```text
research current culture
-> extract recurring idea
-> map to authored deterministic archetype
-> write original fictional copy
-> human review
-> ship versioned culture pack
```

Runtime GenAI may generate:

```text
fictional names
fictional senders
surface wording
original jokes
company flavor
```

Runtime GenAI may not generate:

```text
probabilities
ARR effects
upgrade mechanics
valuation
financing math
agent reliability
debt terms
economic rewards
```

The authored game remains fully playable without GenAI.

---

# 44. Culture-pack examples

Useful recurring themes:

| Culture pattern | Game mechanic |
|---|---|
| Context Rot | agent mistakes increase |
| Agentic technical debt | conflicting Product recipes + Ops pressure |
| Parallel agent sprawl | throughput + Complexity |
| Works in the demo | fast Activation + later reliability problem |
| Tokenmaxxing | throughput + compute bill |
| Requirements engineering | better recipe visibility |
| Just One More Agent | free Agent + hidden operational cost |
| Self-healing everything | autonomy + recursive incident risk |
| Model price cut | temporary lower agent cost |
| Reward hacking | one room metric improves while downstream room suffers |
| AI can replace everyone | Closed Loop build with huge rot sensitivity |

---

# 45. Example Relic archetypes

### Autonomous SlopCo

Eligibility:

```text
high Marketing Autonomy
+
high Product Autonomy
+
high Operations capability
```

Effect:

```text
automated Marketing -> Product -> Monetization routing
```

Tradeoff:

```text
large Complexity
+
loop breaks when critical Rot occurs
```

### One More Agent

Effect:

```text
free Worker Agent
+
extra Complexity
```

### Five Parallel Terminals

Effect:

```text
Product throughput rises dramatically
+
Complexity rises dramatically
```

### Actually Read the Diff

Effect:

```text
manual Product becomes slower
+
verified outcomes become safer / stronger
```

### Default Alive

Effect:

```text
cash-efficiency benefit
while avoiding leverage
```

These are examples, not a complete catalogue.

---

# 46. Build families

The game should support many emergent strategies.

Initial target families include:

```text
Product-Led Machine
Distribution Goblin
NRR Fortress
Autonomous SlopCo
Enterprise Whale Hunter
Default Alive Bootstrapper
Leveraged Blitz
VC Hypergrowth
Variance Goblin
Operations Fortress
Founder Craft Max
Open-Source Growth
Usage-Based Machine
```

These are not selectable classes.

The player creates them through skill-tree allocation, strategy, capital structure and Relics.

---

# 47. Capital archetypes

## Bootstrap

```text
slowest capital access
highest founder ownership
highest strategic flexibility
```

A high-growth bootstrap founder may receive many VC offers but can ignore them.

## Debt

```text
preserves ownership
adds interest pressure
can rescue timing problems
creates active Finance obligations
```

## VC

```text
large Cash injection
dilution
future fundraising depends strongly on growth
```

VC is not simply "better debt."

A funded company that later slows should find future fundraising harder.

A struggling company buried in debt should not continue receiving attractive VC offers without extraordinary growth.

---

# 48. Quarterly strategy examples

Strategies should be contextual.

Examples:

### Enterprise Upmarket
bigger cohorts, harder Product and Operations.

### Product-Led
Product success improves organic Demand.

### Reliability Quarter
lower growth intensity, large Rot reduction.

### Usage-Based
more Monetization variance.

### Annual Contracts
more immediate Cash, harder closing.

### Verticalize
stronger fit in one segment, weaker outside it.

### Open Source
stronger Marketing, harder Monetization.

### Agent-First
Autonomy becomes cheaper or faster, Rot pressure increases.

### Default Alive
slower Scale, lower burn.

### Blitzscale
faster Scale, more Complexity.

These strategies should be simulated as part of Macro balance.

---

# 49. Hidden $1T ending

If a player reaches:

```text
$1,000,000,000,000 valuation
```

a hidden AI-takeover ending may trigger.

This should not be exposed in the normal achievement list beforehand.

Example tone:

> Your admin permissions have been revoked.

It is a secret joke about the endpoint of complete autonomy.

---

# 50. Meta progression

Prefer knowledge, options and challenge unlocks over permanent raw power.

Good meta unlocks:

```text
Founder Histories
new Relics
new Strategies
new culture packs
new challenge modes
daily seeds
Growth Mandate categories
cosmetics
company-shell themes
harder scenario packs
secret endings
```

Avoid permanent ranked bonuses like:

```text
+10% ARR every future run
```

---

# 51. Founder Histories

Founder History remains player-selected.

Never infer personal history from external accounts.

Histories may:

```text
unlock starting Relic
weight complementary trees
alter early Finance access
encourage off-meta builds
```

Histories must not directly multiply valuation.

Fresh Founder remains the standardized baseline for competitive comparison.

---

# 52. Cash

Cash is a survival and investment resource.

Cash is not score.

Cash pays for:

```text
skill-tree ranks
agents
agent upgrades
systems
incident resolution
debt service
selected strategic actions
```

Cash comes from:

```text
customer collections
annual prepayment
financing
debt
specific events
```

The player should be free to spend heavily during build phases.

The balancing constraint is economic consequence, not arbitrary purchase-count limits.

---

# 53. Complexity-cost design rule

Almost every strong scaling move should ask:

> What extra coordination burden did this create?

Examples:

```text
more Product workspaces
-> Complexity

more concurrent campaigns
-> Complexity

advanced pricing systems
-> Complexity

deeper Expansion automation
-> Complexity

agents
-> Complexity

swarms
-> more Complexity

cross-room closed loops
-> major Complexity
```

This ensures Scale and Autonomy never become pure linear improvement.

---

# 54. Variance design rule

Each Variance subbranch must clearly communicate:

```text
UPSIDE
DOWNSIDE
```

The strongest Variance mechanics should be opt-in.

The player should never receive a catastrophic random punishment from a mechanic they had no reason to know was volatile.

Good:

> Unlimited Permissions  
> Much faster agent execution. Wrong actions can resolve without approval.

Bad:

> Luck +20%

---

# 55. Human skill vs company build

Moment-to-moment games should be satisfying but not mindless.

Each room must contain real judgement.

However:

```text
manual motor skill alone
must not determine the run
```

The real long-term difference comes from:

```text
skill-tree allocation
strategy
capital structure
Relics
automation design
Complexity management
Rot management
founder attention
```

This makes both action-game skill and strategic decision-making relevant.

---

# 56. Failure

Failure should remain attributable.

Primary failure types may include:

```text
GROWTH MANDATE MISSED
BANKRUPT
DEBT SPIRAL
AUTOMATION COLLAPSE
CHURN SPIRAL
CONTEXT CORRUPTION
```

The result screen must explain:

```text
what killed the company
when the failure began
which function became the bottleneck
which build the player created
which major decisions contributed
```

Failure attribution is a core replay mechanic.

---

# 57. Valuation signaling

Valuation should be continuously visible but not constantly cinematic.

Major valuation moments deserve strong presentation:

```text
$10M
$100M
$1B
$10B
$100B
$1T
```

The $1B crossing is a major checkpoint.

A rerating at quarter close should visibly communicate:

```text
ARR grew
but growth multiple changed
therefore valuation changed
```

Never let valuation appear arbitrary.

---

# 58. Onboarding direction

Progressively unlock systems.

First-run sequence should teach:

```text
Marketing
Product
Monetization
ARR
Cash
Retention
Operations
Scale
Agents
Complexity
Rot
Expansion
Finance
Debt
Funding
Founder Ownership
Quarter Strategy
Relics
```

Do not show all seven functions and all progression systems on the first screen.

Do not explain automation before the player feels overwhelmed.

---

# 59. Architecture

Maintain four conceptual layers:

```text
DETERMINISTIC SIMULATION
CONTENT
PRESENTATION
OPTIONAL GENAI
```

Simulation owns:

```text
ARR
Cash
cohorts
queues
agents
Complexity
Ops Capacity
Rot
Debt
equity
valuation
quarter timing
skill trees
strategies
Relic effects
seeded randomness
```

Content owns:

```text
recipes
customer archetypes
Relics
Strategies
Founder Histories
incident archetypes
culture packs
```

Presentation owns:

```text
HUD
room canvases
animation
audio
quarter close
Finance events
skill trees
result screens
```

GenAI owns only optional presentation.

---

# 60. Determinism

For a given:

```text
seed
+
starting state
+
player action log
+
balance version
+
content version
```

the economic outcome must be identical.

Never use live LLM output to determine balance.

Never use unseeded randomness in economic simulation.

---

# 61. Responsive / PWA

The game remains a responsive PWA.

The same simulation must work across:

```text
mobile portrait
mobile landscape
tablet
desktop
installed desktop window
```

Mobile should not be a shrunk desktop layout.

One active work function dominates the screen.

Other functions communicate:

```text
urgency
queue
agent status
incident state
Finance event
```

through compact navigation.

Core simulation rules must not change by viewport.

---

# 62. V2 content targets

Current target breadth:

```text
7 work functions
448 skill-tree ranks
~224 Relics
~42 quarterly Strategies
multiple Founder Histories
versioned culture packs
```

This is intentionally much broader than the earlier V1 scope.

Do not implement all content before validating the engine.

Recommended order:

```text
1. lock economic equations
2. lock work-function interactions
3. lock skill-tree schemas
4. lock Complexity / Rot
5. lock Finance
6. lock quarter loop
7. implement representative content
8. simulate
9. rebalance
10. expand catalogue
```

---

# 63. Required simulation work before build lock

The next quantitative pass must define and test:

```text
manual founder capacity
GU scaling
all seven work-function output equations
queue generation
customer cohort flow
churn generation
Expansion caps
448 rank costs
448 rank effects
Complexity contribution
Ops Capacity progression
Rot generation
Rot recovery
agent throughput
agent reliability
Finance offer probability
VC terms
debt interest
Debt Stress
emergency Growth bridge
42 Strategy effects
224 Relic eligibility graph
Growth multiple bands
run pacing
```

Target simulation:

```text
50,000-100,000+ seeded companies
```

Test:

```text
Growth Mandates
bootstrap
debt
VC
Craft-heavy
Scale-heavy
Autonomy-heavy
Variance-heavy
balanced builds
cross-function builds
adversarial exploits
```

Simulation is a regression and balance tool.

It cannot validate:

```text
fun
motor feel
humor
clarity
replay desire
```

Those require human playtests.

---

# 64. Balance goals

The game should produce many viable but unequal strategies.

Do not balance toward identical win rates.

Different builds should vary across:

```text
speed
risk
ownership
debt
manual-skill demand
automation
Complexity
Rot
Variance
founder attention
```

Required:

```text
at least 5 clearly distinct viable unicorn paths
```

No generalist should automatically dominate.

No single function should be safely ignorable.

Financing should accelerate builds without becoming mandatory.

Craft-only should be exceptional but structurally limited by founder attention.

Autonomy should be powerful but dangerous without Operations.

Variance should create stories, not deterministic superiority.

---

# 65. Product sentence

A one-person-company roguelike where you manually play the work of building a startup, invest the cash it earns into skill trees and AI agents, survive the complexity and context rot created by scaling automation, manage debt and investor attention in real time, make consequential company-level decisions every quarter, and race to a $1B valuation before the autonomous machine you built becomes impossible to control.

---

# 66. Core player fantasy in one line

```text
AI CAN REPLACE THE TEAM.
NOW YOU HAVE TO MANAGE THE AI.
```

This is the canonical V2 direction.
