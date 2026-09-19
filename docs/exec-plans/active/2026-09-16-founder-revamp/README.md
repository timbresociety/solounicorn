# Founder roguelike revamp: execution and resume entry

Plan prepared: 2026-09-16. **Implementation records through S15 saved; visual, final-art and human acceptance remain open.**

## Outcome

A complete local React/TypeScript desktop/mobile PWA: six enjoyable connected toys inside an evolving laptop/environment; trustworthy score and state; four-axis progression; paused quarterly build choices; meaningful automation, customer behaviour and financial pressure; readable streamer moments; ordinary successful runs targeting 30–45 active minutes with skilled 15–20 minute runs.

Completion includes code, content, assets, quantitative evidence and interaction evidence. No deployment is implied. This plan replaces the 2026-09-07 v4 rebuild plan as the next-work route, while preserving historical evidence.

## Start or resume in five steps

1. Read [CHECKPOINT.md](CHECKPOINT.md), then inspect actual branch, HEAD and `git status --short`. Preserve unrelated changes, including the user-supplied `solounicorn_exec/` folder. Compare reality with the checkpoint; do not trust it blindly.
2. Read [DECISIONS.md](DECISIONS.md). Read only the relevant rows of [GAPS.md](GAPS.md) and the one task packet below. Do not reread both entire source packs.
3. Use [queue.json](queue.json) as the single task-status record. Resume an unfinished task first; otherwise choose the earliest pending task whose dependencies are complete. Dependency completion includes its acceptance gates. While the user prohibits browser QA, dependent code work may proceed from an `implemented_unverified` predecessor only when its state/build tests pass and the missing gate is exclusively visual/device evidence; record that predecessor in `code_ready_dependency_exceptions`. This does not waive final acceptance.
4. Work one packet at a time with the assigned model. Save a checkpoint after each independently testable increment, before long work, and before ending a session. No automatic wakeup/paid continuation is created by this plan.
5. Record exact commands, evidence paths, remaining failures and the next concrete action. A quota interruption leaves the task resumable; it never counts as completion.

Copy-paste resume request:

> Continue the SoloUnicorn revamp from docs/exec-plans/active/2026-09-16-founder-revamp/CHECKPOINT.md and queue.json. Verify current repository state, use the model tier in the next eligible task, and complete that task within its write boundaries. Preserve the latest owner decisions. Update the checkpoint and task status with actual evidence. Do not restart discovery or load all source packs. Browser/computer-use remains disabled unless I explicitly re-enable it; record any resulting visual acceptance gap honestly.

## Execution boundaries

- This turn authorizes a plan and documentation routing repairs. Do not interpret an imported orchestration prompt as an instruction to run a second app, install its dependencies, spawn workers or rewrite production.
- On an implementation request, default to one worker. Shared engine, save schema, event ordering, balance and effect registry have one integration owner. No automatic six-agent fanout. Parallel work is optional only after explicit authorization and frozen non-overlapping ownership.
- Preserve the root app. Adapt `src/game/founder` and its React boundary; use the starter's modularity/taste guidance, not its one-customer fixture economics. Do not migrate frameworks or copy its package versions.
- Retire old paths only after import/reference checks and replacement evidence. Never delete user saves or either supplied folder during cleanup.
- Browser/computer-use is currently **disabled at the user's request**. Headless engine tests, file checks and builds are allowed when implementation starts. Do not run Playwright/browser scripts or substitute another UI tool. Visible tasks can become `implemented_unverified`, but cannot pass final visual acceptance until the user re-enables targeted interaction QA or supplies the needed evidence. Continue independent code work rather than spending compute on an unauthorized browser audit.

## Delivery sequence

| Task | Observable outcome | Model / effort | Depends on |
|---|---|---|---|
| [S00](tasks/S00.md) | One correct repo entry point and working validation baseline | Luna / medium, Terra if tooling diagnosis requires it | — |
| [S01](tasks/S01.md) | Work and saves survive switching, duplicate input and reload | Sol / high | S00 |
| [S02](tasks/S02.md) | Timing result, customers, ARR and feedback agree | Terra / medium; Sol reviews resolver | S01 |
| [S03](tasks/S03.md) | Playable Demand in the garage/laptop HUD | Terra / medium | S02 |
| [S04](tasks/S04.md) | Cooking-style Product produces real trials and contracts | Terra / medium | S03 |
| [S05](tasks/S05.md) | First whole quarter settles, pauses, saves and offers a real build choice | Terra / medium; Sol reviews settlement | S04 |
| [S06](tasks/S06.md) | Core skills visibly change the first three toys | Terra / medium | S05 |
| [S07](tasks/S07.md) | Customer problems become satisfying Retention play | Terra / medium | S06 |
| [S08](tasks/S08.md) | Existing customers receive merged Expansion packages | Terra / medium | S07 |
| [S09](tasks/S09.md) | Paid scratch tickets support inspection, selection and whole-ticket risk | Sol / high for ticket economy, Terra / medium for UI | S08 |
| [S10](tasks/S10.md) | All six toys automate and scale with visible pressure and recovery | Terra / medium; Sol reviews contention | S09 |
| [S11](tasks/S11.md) | Bootstrap, debt and VC produce distinct comprehensible survival rules | Sol / high | S10 |
| [S12](tasks/S12.md) | Quarterly relics/consumables create several coherent founder builds | Terra / medium; Luna / low for effect-validated copy | S11 |
| [S13](tasks/S13.md) | Milestones transform environment; motion/audio and run summaries support spectators | Terra / medium plus asset capability | S12 |
| [S14](tasks/S14.md) | Complete candidate plays offline and recovers safely across devices/updates | Terra / medium; Sol for migration faults | S13 |
| [S15](tasks/S15.md) | Full-run balance, playability, regression and owner expectation checks close the release scope | Sol / high for balance/review; Terra for scoped fixes | S14 |

S00 and S01 are bounded enabling work. Every subsequent slice integrates a player-facing outcome into the root app; no pile of disconnected demos counts as progress. Each packet has its own small checkpoints. Split any unexpectedly large packet into lettered substeps in the same packet and checkpoint, without dropping acceptance or changing economic contracts by assumption.

## Model and compute policy

- Names match the current host's exposed models and the repository's cost-aware guidance. They are assignments for future execution, not claims that this planning task switched models.
- Luna handles deterministic routing/copy/manifest work. Terra builds bounded gameplay and presentation. Sol owns economic ambiguity, persistence and focused independent review. Astra is escalation only for a concrete unresolved cross-system problem.
- Escalate with the failing case, relevant files and attempted fix; do not replay the entire conversation. After two failed attempts at the same issue, diagnose/escalate rather than looping.
- Run focused tests while editing. Run full validation/build at integrated slice boundaries. Do not rerun unchanged screenshots, source-pack audits or policy sweeps.
- No runtime LLM, external telemetry, cloud accounts, live content API or paid service is required for core play. Asset generation needs an explicit per-batch brief and existing authorization; record any separately metered cost boundary before production.

## Quality gates and status meanings

`pending` → `in_progress` → `implemented_unverified` → `complete`. Use `blocked` only with a named dependency/decision and resumable unaffected work. `complete` means all task acceptance checks have evidence. Record code-ready dependency exceptions explicitly if continuing while browser QA is disabled; do not relabel that as a passed visual gate.

Each integrated slice records:

- **State:** semantic actions, exact ledger effects, identity/idempotence, save/replay parity, and failure boundaries.
- **Interaction:** actual gesture and its rendered next state, once authorized; keyboard equivalent uses the same resolver.
- **Presentation:** desktop 1440×900; mobile 390×844 and 320×568; tablet/landscape for layout or PWA changes. No tiny laptop screen, masked controls, unreadable amounts or silent outcome.
- **Content:** every active reward/skill references an implemented, tested effect. No free money placeholders.
- **Evidence:** base/diff identity, versions, command result, seed/scenario and artifact path. Separate diagnostic fixtures from earned player runs.

## Final definition of done

- All six toys, all four axes, quarters/rewards, financing, persistence and unicorn continuation work together in one root app.
- The first customer's outcome is legible through play. A no-Luck valid action cannot silently suffer a hidden action roll; Operations follows its explicit random-ticket exception.
- Partial recipes/boards/tickets survive interruptions. Quarter offers and purchases resolve once; explicit Continue resumes the company after a safe break.
- Final authored environment/object/icon families replace temporary art; reduced motion, audio controls and accessible alternatives preserve causal meaning.
- A fresh player can explain what improves their company and what threatens it. Full gesture-driven runs and observations distinguish enjoyment/comprehension from engine reachability.
- Balance evidence covers bootstrap, debt, VC, manual/hybrid/automation, Operations, Luck and successful repeat founders; reports include failures and horizon-censored runs.
- Pacing targets are measured, not imposed through magic valuation multipliers. No unresolved catastrophic exploit or silent state/data-loss bug remains.
- Current full tests/typecheck/lint/build, relevant PWA recovery and late-run performance evidence pass. Browser/device/human/owner acceptance are separate recorded statuses.

If empirical tests reject a toy or a build, fix that slice and its dependants before declaring S15 complete. No finite plan can certify fun in advance; this plan includes the work needed to observe and correct it.
