# Context consolidation — completed plan

Date: 2026-09-06

## Goal

Eliminate competing repository context and leave one source-of-truth route for product, build, balance, design, content, skills and automation.

## Problems found

- root and nested agent instruction trees competed for authority;
- versioned design package contained a second `AGENTS.md`, `.codex/skills`, design canon and tooling docs;
- `CODEX_REBUILD_BRIEF.md` and `CODEX_RUNBOOK.md` created additional top-level implementation authority;
- design package contradicted product canon by calling Product `MERGE`, Expansion `DRAG/PACK`, and modeling only six functions while product canon contains Finance as the seventh;
- content had no substantive writing/culture/effect-boundary canon;
- no dedicated build or content project skill existed;
- repository contract did not prevent nested instruction scopes from returning.

## Resolution

Canonical topology:

```text
AGENTS.md
  -> ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md
  -> docs/BUILD.md + ARCHITECTURE.md
  -> docs/balance/BALANCE_SPEC_V2.md + balance/v2/registry.json
  -> docs/design/DESIGN.md + docs/design/REFERENCES.md
  -> docs/content/CONTENT.md
  -> docs/SKILLS.md + .agents/skills/
  -> docs/automation/AUTOMATION.md
```

Added:

- `docs/BUILD.md`;
- `docs/design/DESIGN.md`;
- `docs/design/REFERENCES.md`;
- `docs/content/CONTENT.md`;
- `docs/SKILLS.md`;
- `$opu-build-guardian`;
- `$opu-content-guardian`.

Updated existing design/visual/asset skills to route to consolidated authority.

Retired competing root rebuild/runbook files and nested agent/design/tooling scopes.

Kept founder visual assets, generated examples and research as non-authoritative legacy reference storage.

Updated repository contract so CI rejects nested `AGENTS.md`, nested `.codex/skills`, retired top-level context files, missing canonical docs, and stale legacy-design links in the active design skill.

## Product contradictions resolved

The design/build authority now uses the product-canonical interactions:

- Marketing: swipe / triage;
- Product: assemble / recipe;
- Monetization: time your tap;
- Retention: aim / auto-fire;
- Expansion: merge + create custom package;
- Operations: scratch / reveal + opt-in high-variance optimization;
- Finance: inspect / counter / commit capital/debt decisions.

Finance now has an explicit design role/accent and cannot disappear because an older six-function visual table is followed.

Attention architecture preserves central gameplay and routes routine urgency through an escalating, non-modal alert inbox.

## Validation

Local clone validation was unavailable in the ChatGPT container because outbound DNS to GitHub is disabled.

The repository's GitHub Actions workflow runs `npm ci` followed by `npm run ci` (`npm run validate` + build) on pull requests. Final validation is therefore delegated to the PR workflow and its result is checked before completion reporting.

## Balance impact

None. No product causal equation, registry status or numeric balance value was changed.
