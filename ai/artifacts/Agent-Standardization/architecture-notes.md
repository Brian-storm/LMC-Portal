# Architecture Notes — Agent Path Standardization

> 2026-09-01 | Risk: LOW

## Problem

The Monstrare AGENTS.md (located at `.github/skills/monstrare/AGENTS.md`) references paths like `ai/process/workflow.md`, `ai/skills/design-craft.md`, etc. — these resolve from the project root to `./ai/xxx`, which either doesn't exist or points to the wrong location.

Meanwhile, the actual runtime skills live in `.opencode/skills/`, and the Monstrare canonical files live in `.github/skills/monstrare/ai/`.

## Discovery Summary

| Category | Files Affected |
|---|---|
| **Monstrare AGENTS.md** | `.github/skills/monstrare/AGENTS.md` — 6 bare `ai/` references (process, templates, skills, checklists) |
| **OpenCode SKILL.md files** | All 8 skills in `.opencode/skills/` — chain of `ai/templates/`, `ai/process/`, `ai/checklists/` references |
| **Monstrare README / CLAUDE.md** | `.github/skills/monstrare/README.md`, `README.zh-TW.md`, `CLAUDE.md` |
| **Monstrare .codex/.claude stubs** | 16 stub files reference `ai/skills/xxx.md` — these are unused (legacy Claude Code / Codex) |
| **Project-root AGENTS.md** | `AGENTS.md` — no broken references (clean) |

## Resolution Strategy

### Principle: Single Source of Truth

- **Runtime skills** → `.opencode/skills/<name>/SKILL.md` (what opencode actually loads)
- **Canonical rules** → `.github/skills/monstrare/ai/skills/<name>.md` (the Monstrare kit's reference source)
- **Templates, process, checklists** → `.github/skills/monstrare/ai/<category>/`

All path references in both AGENTS.md and SKILL.md files must use absolute-from-project-root paths (e.g., `.github/skills/monstrare/ai/templates/screen-spec.md`) to work correctly when opencode resolves them.

### What NOT to Change

- Do NOT move or restructure the Monstrare kit files
- Do NOT delete the `.claude/` or `.codex/` stubs (they're inert but part of Monstrare)
- Do NOT change the project-root `ai/` directory (it holds project artifacts, correctly placed)

## Files to Change

| # | File | Type of Change |
|---|---|---|
| 1 | `.github/skills/monstrare/AGENTS.md` | Rewrite 6 path references to use `.github/skills/monstrare/ai/...` prefix |
| 2 | `.github/skills/monstrare/README.md` | Same path fix |
| 3 | `.github/skills/monstrare/README.zh-TW.md` | Same path fix |
| 4 | `.github/skills/monstrare/CLAUDE.md` | Same path fix |
| 5 | `.opencode/skills/design-craft/SKILL.md` | Fix 2 `ai/` relative references |
| 6 | `.opencode/skills/implementation-plan/SKILL.md` | Fix 2 `ai/` relative references |
| 7 | `.opencode/skills/project-kickoff/SKILL.md` | Fix canonical rules path |
| 8 | `.opencode/skills/project-search/SKILL.md` | Fix 1 `ai/process/` reference |
| 9 | `.opencode/skills/security-maintainability-review/SKILL.md` | Fix 1 `ai/checklists/` reference |
| 10 | `.opencode/skills/spec-interrogation/SKILL.md` | Fix 2 `ai/` references |
| 11 | `.opencode/skills/test-verification/SKILL.md` | Fix 4 `ai/` references |
| 12 | `.opencode/skills/ui-mockup-gate/SKILL.md` | Fix 2 `ai/templates/` references |
| 13 | `.github/skills/monstrare/tools/kanban/README.md` | Fix 3 `ai/` references |
| 14 | `.github/skills/monstrare/tools/kanban/screen-spec.md` | Fix 1 reference |
| 15 | `.github/skills/monstrare/tools/kanban/mockup-decision.md` | Fix 1 reference |

## Verification

After all changes:
- `rg 'ai/(process|templates|skills|checklists)/'` should return ZERO false positives
- All resolved paths should point to existent files under `.github/skills/monstrare/ai/`