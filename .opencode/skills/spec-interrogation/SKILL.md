---
name: spec-interrogation
description: Transforms vague feature requests into human-reviewable feature specifications with explicit requirements, non-goals, edge cases, and acceptance criteria. USE FOR: clarify requirements, write feature spec, define acceptance criteria, scope a feature, before implementation planning.
---
# Spec Interrogation

Use before implementation. Scope is a single feature module (Epic). For brand new projects with no Epic list, run `project-kickoff` first.

**Canonical rules**: `.github/skills/monstrare/ai/skills/spec-interrogation.md`

## Process

1. Restate the request as a **problem**, not a solution.
2. Identify **users, goals, non-goals, and risks**.
3. Only ask **blocking** questions. If an assumption is reasonable and safe, document it and move on.
4. Produce `ai/artifacts/<Epic>/feature-spec.md` with the required sections below.
5. Write in **testable** requirement language.
6. **Stop and wait for human approval** before entering architecture planning.

## Required Sections

- **Problem** — what pain does this solve?
- **Users** — who benefits?
- **Goals** — what success looks like
- **Non-Goals** — explicitly out of scope (prevents scope creep)
- **User Stories** — one per independently verifiable outcome; each will later become task cards
- **User Journey** — flow from start to finish
- **Functional Requirements** — specific, testable statements
- **UI Screens** — list if UI is involved
- **Data & API Assumptions** — what endpoints, what shape
- **Security & Privacy Notes** — PII handling, auth boundaries, data at rest
- **Acceptance Criteria** — how we'll know it's done
- **Verification Plan** — what tests/checks prove it works

## What NOT to Do

- Don't jump to architecture or file names in the spec — that's `implementation-plan`'s job
- Don't ask clarifying questions the user already answered
- Don't proceed past the spec without human sign-off