---
name: implementation-plan
description: Converts an approved feature spec into architecture notes and scoped, AI-ready task cards with verification contracts. Handles full-stack decomposition rules, Epic architecture foundation cards, and MECE verification. USE FOR: create task cards, plan implementation, decompose user story, architecture planning, before coding.
---
# Implementation Plan

Use after the product and UI gates are both approved. Takes an approved feature spec + context pack → produces architecture notes + task cards.

**Canonical rules**: `.github/skills/monstrare/ai/skills/implementation-plan.md`

## Process

1. Read the approved feature spec and context pack.
2. Identify files likely to change.
3. Define API, data, and state contracts.
4. Assign a risk level (low/medium/high).
5. Decompose work into small task cards using `tools/kanban/cards/<card-id>.json` (see `tools/kanban/README.md` for schema), output to `tools/kanban/cards/`.
6. Ensure every card is independent, well-scoped, and has explicit verification criteria.
7. For medium/high risk: stop and wait for human approval before implementation.

## Full-Stack Decomposition Rule

If a User Story touches both frontend and backend, default to 3 cards (not 1 mega-card):
1. **Frontend** — screens, interactions, state management
2. **Backend** — API, data model, business logic
3. **Integration** — actual API wiring, loading/error states, end-to-end verification

Pure frontend or pure backend stories don't need this split.

## Epic Architecture Foundation Rule

Before decomposing an Epic's User Stories, check: do multiple stories share the same layout shell, route guards, or data models?

- **If yes** AND no task card has yet built this shared foundation → create an "architecture foundation" card that builds the shared scaffolding once. All subsequent cards in the Epic must `dependsOn` this foundation card.
- **If no** → skip this rule.

## Mandatory Dependency on Project Setup

Every functional Epic's first task card MUST `dependsOn` ALL cards from the "Project Setup" Epic. This prevents any functional card from reaching `ready` before the project skeleton is complete.

## MECE Check (after decomposition)

- **Completely Exhaustive (CE)**: All task cards together must cover the full acceptance criteria of the User Story. If the spec mentions something no card covers, create a missing card or fix an existing card's scope.
- **Mutually Exclusive (ME)**: No overlapping responsibilities between cards (e.g., two cards both modifying the same API or the same component's core logic). Each card's boundary must be explicit.

## Output

- Architecture notes
- Task cards (with `dependsOn` referencing prerequisite card IDs)
- Verification plan
- Required review gates