# Web / desktop context handoff

Status: IMPLEMENTATION COMPLETE; review and CI results live in the PR.

## Lane and goal

Primary: build/infra, agent workflow.

Bridge the user's reported gap between ChatGPT web and desktop understanding by grounding each session in the same repository sources and preserving corrections with provenance.

## Resume checkpoint

- Updated: 2026-09-05 UTC.
- Repository: `timbresociety/solounicorn`.
- Working branch: `context/web-desktop-handoff`.
- Source revision: `5af16faeea0643b4222e739b8d7a0ec669f94284` on `main`, the merge of PR #3.
- Remote freshness: source revision verified through GitHub and the local clone at task start, and `main` rechecked unchanged before preparing the PR.
- Current request: bridge the gap in how ChatGPT web and desktop understand the project after the user corrected the repository from web.
- Baseline evidence: repository contract, balance validation, simulation smoke and determinism checks run directly with Node before edits; passed.
- Completed: source audit; session grounding, correction write-back and resume workflow; diff review; local checks and isolated rejection cases.
- Remaining: PR review and desktop adoption. Full dependency-backed validation/build are reported by the repository CI on the PR; do not infer their result from this document.
- Next step for a receiving agent: inspect the PR state/checks, use the intended branch, and follow automation §15. No subsequent gameplay implementation task is implied by this handoff.

## Authorities read

- `AGENTS.md`.
- `docs/automation/AUTOMATION.md`.
- `docs/BUILD.md`, particularly §19–20.
- `ARCHITECTURE.md`.
- `docs/SKILLS.md` and `$opu-build-guardian`.
- `docs/exec-plans/TEMPLATE.md` and the completed context-consolidation plan.
- `balance/v2/registry.json` for status only.
- PR #3 for recent correction provenance.
- Official OpenAI documentation for memory separation and instruction discovery.

## Scope

Update the existing agent map, automation protocol, task/PR templates, README entry route and instruction topology checker. Preserve the consolidated source hierarchy. No new product/design canon, skill tree, memory-sync service or global configuration.

Product, balance, gameplay, visual assets and deployment are outside this task. The current v0 implementation remains to be rebuilt through a separate requested task.

## Decisions / deviations

| Decision | Status | Source | Rationale | Owning authority |
|---|---|---|---|---|
| Use repository sources and task records for cross-client continuity | Implementation decision within the requested workflow repair | Current user request; OpenAI memory/instruction documentation | Separate memory stores cannot establish identical current project context | `AGENTS.md`; automation §15–18 |
| Preserve the consolidated domain authorities | Accepted repository constraint | Merged PR #3; automation §2–3 | Another standalone context package would recreate competing guidance | Existing domain authorities |
| Reject local instruction overrides and nested skill scopes | Implementation decision | Existing single-entrypoint contract; documented Codex override precedence | An override can hide the root map even when the existing checker passes | Repository contract checker |
| Keep proposals distinct from explicit user decisions | Implementation decision within the requested workflow repair | Current user request to prevent hallucinated understanding | Assistant summaries and completed tasks do not establish product-owner approval | Automation §16–17 |

## Acceptance and validation

- Fresh sessions identify their source revision and read the relevant current authority.
- Startup readback does not introduce a routine confirmation stop.
- Handoffs preserve the current request, source provenance, verification state and next step.
- Existing instruction topology passes; root/nested overrides, case-variant maps and nested skill trees are rejected.
- Canonical product/design/balance and runtime files remain unchanged.
- Run `npm run validate` where available; record any execution limits explicitly.
- Check the repository PR workflow against the final proposed revision before claiming CI passes.

## Completion record

Prepared on `context/web-desktop-handoff` against source revision `5af16faeea0643b4222e739b8d7a0ec669f94284`. These are workflow/checker changes only; no deployment was requested or performed. Merge and desktop adoption are separate from preparing the change.

Local validation on the proposed working tree:

- `git diff --check`: passed.
- `node --check scripts/check-repo-contract.mjs`: passed.
- Repository contract, balance validation, simulation smoke and determinism scripts: passed when executed directly with Node.
- Six isolated negative cases: root override, nested override, case-variant root map, nested map, nested `.agents/skills`, nested `.codex/skills` were each rejected; the valid root structure remained accepted.
- Balance remained `runtimeReady: false`, with 41 required unresolved entries; no status was changed.

Local dependencies were not installed. TypeScript, lint and the production build are not claimed as local passes. The existing PR workflow executes `npm ci` and `npm run ci`; its result for the proposed commit is recorded in the PR, alongside the final source SHA. Required CI must pass before this is represented as fully validated.
