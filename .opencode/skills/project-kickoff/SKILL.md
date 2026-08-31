---
name: project-kickoff
description: Breaks down a new or existing project into Epics, User Stories, and task cards on the kanban board. Runs a structured 7-step process — tech stack confirmation, Project Setup (Epic 0), UI design system (5-stage), feature Epic proposal, User Story proposal, task card generation, kanban seeding. USE FOR: new project, project kickoff, create backlog, set up epics and stories, initialize design system, kanban setup.
---
# Project Kickoff

Applies to greenfield projects, or existing projects that need a full Epic → User Story → Task backlog. The goal is to decompose "what this project should do" layer by layer into kanban task cards, with human approval at every layer.

**Canonical rules**: `.github/skills/monstrare/ai/skills/project-kickoff.md` — read that first for full detail.

## Modes

| Situation | Action |
|---|---|
| Brand new project, no backlog | Full kickoff: steps 1–7 |
| Existing project, adding features | Skip to step 3 (propose Epics) or use `spec-interrogation` for a single feature |
| Project already has full backlog | Skip this skill, just use `implementation-plan` per User Story |

## Process Overview

### Step 1 — Tech Stack Clarification
Ask only: deployment target, language/framework/database/auth choice, known hard constraints (budget, deadline, integrations). Don't re-ask what's already stated.

### Step 2 — Project Setup (Epic 0)
Mandatory for every project. Always create an Epic called "Project Setup" with these User Stories (skip any that don't apply):
- **Tech skeleton init** — project scaffolding, directory structure, base dependencies, build/lint/test pipeline, deployment config
- **Env vars & secrets** — `.env.example`, secret storage convention
- **Core data model / auth foundation** — shared across-Epic tables or login mechanism
- **UI design system** — only if the project has a UI. Must follow the 5-stage design process below

### Step 2a — UI Design System: 5-Stage Process
*Applies `design-craft` discipline (type scale, 4px spacing grid, color system, depth rules, 5 interactive states) throughout stages S2–S5. Each stage gates on human approval before the next begins.*

| Stage | What | Gate |
|---|---|---|
| S1 | Framework & component library strategy (shadcn/ui, MUI, custom, etc.) | Human picks framework |
| S2 | 2-3 style tiles (color mood, typography personality, radius/shadow tendency, density, reference products) | Human picks direction |
| S3 | Design tokens — primitive (color scale, type scale, spacing, radius, shadow, z-index, motion) + semantic (`color.primary`, `color.surface`, etc.) | Human approves tokens |
| S4 | Core component library — at minimum: button, input, select, checkbox/radio, card, nav, modal/dialog, table, form, toast/alert. Each with default/hover/focus/disabled/loading/error states. Register each in `design-system.md` inventory. | Human approves components |
| S5 | Full layout mockups per interface (admin, customer, etc.). Use `ui-mockup-gate` with already-approved tokens/components. 2-3 layout variants per interface. | Human picks layout |

All decisions written to `ai/context/design-system.md` — the single source of truth for all subsequent Epics.

### Step 3 — Propose Feature Epics
Brainstorm a full candidate list of feature modules. Don't just list what the user mentioned — think like a product manager: what are the "standard modules" for this type of system?

- Must pass MECE check (Mutually Exclusive, Completely Exhaustive) before presenting
- If >4 candidates, split into multiple rounds of AskUserQuestion (max 4 options per question, max 4 questions per call)
- **Never truncate** the list because of the UI — present all candidates across multiple rounds

### Step 4 — Propose User Stories per Epic
For each selected Epic, brainstorm User Story candidates. Same MECE + multi-round rule as Step 3.

### Step 5 — Decompose into Task Cards
For each selected User Story, use `implementation-plan` skill to produce task cards. Full-stack features default to 3 cards (frontend, backend, integration). If an Epic shares common scaffolding across stories, create an "architecture foundation" card first — all subsequent cards `dependsOn` it.

### Step 6 — Seed the Kanban Board
Write every task card as a JSON file in `tools/kanban/cards/`. Set `epic` / `userStory` / `dependsOn` / `order` fields so the board sorts correctly. Project Setup cards always have the lowest `order` values.

### Step 7 — Implementation Loop
Process one `ready` card at a time. Front-end tasks must read `ai/context/design-system.md` first. Each card goes through: context discovery → mockup gate (if UI) → dependency check → implement → verify → done. Apply `security-checklist.md` on every card, not just high-risk ones.

## Output
- Confirmed tech stack & deployment target
- `tools/kanban/epics.json` with selected Epics & User Stories
- If UI: populated `ai/context/design-system.md`
- `tools/kanban/cards/` with task cards (epic/userStory/dependsOn set)
- Per-card implementation & verification records

## Candidate Presentation Rules (Steps 3 & 4)

- AskUserQuestion: max 4 options per question, max 4 questions per call → max 16 candidates per call
- If candidate count > 16: **must split into multiple rounds**, tell user "round N of M, ~X total candidates"
- Before each call: count your candidates, decide how many rounds needed
- After all rounds: verify total presented = total brainstormed
- Never truncate the list because of the tool limit