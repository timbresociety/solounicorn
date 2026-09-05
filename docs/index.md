# ONE PERSON UNICORN — Repository Knowledge Map

This directory is the maintained source-of-truth map around the canonical product file.

| Need | Read |
|---|---|
| Product/system truth | `../ONE_PERSON_UNICORN_CANONICAL_CONTEXT_V2.md` |
| Build/runtime/PWA requirements | `BUILD.md` |
| Architecture/dependency boundaries | `../ARCHITECTURE.md` |
| Quantitative balance lifecycle | `balance/BALANCE_SPEC_V2.md` |
| Current machine-readable balance status | `../balance/v2/registry.json` |
| Visual/interaction design | `design/DESIGN.md` |
| Founder/generated reference interpretation | `design/REFERENCES.md` |
| Authored content/copy/culture | `content/CONTENT.md` |
| Agent skills + tooling | `SKILLS.md` |
| Agent automation protocol | `automation/AUTOMATION.md` |
| Active multi-step work | `exec-plans/active/` |
| Completed implementation plans | `exec-plans/completed/` |

## Authority topology

```text
PRODUCT CANON
├── BUILD + ARCHITECTURE
├── BALANCE -> SIMULATION
├── DESIGN -> PRESENTATION
└── CONTENT -> SIMULATION/PRESENTATION through approved contracts
```

`AGENTS.md` is the short agent entrypoint. It points here and to the relevant domain skills.

Do not create a second master PRD, second design canon, nested `AGENTS.md`, nested skill tree, or self-contained context package inside this repository.

The legacy `../one-person-unicorn-design-context-v2.2/` directory is reference storage only. Registered visual assets from it are interpreted through `design/REFERENCES.md`; its old Markdown is not authority.

Do not duplicate canonical rules into random implementation notes. Link to the authority instead.
