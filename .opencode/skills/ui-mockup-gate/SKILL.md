---
name: ui-mockup-gate
description: Produces multiple UI mockup variants and screen state specifications before implementation, then stops for human selection. Enforces design system token/component reuse. USE FOR: design UI, create mockups, screen design, layout variants, UI review gate, style tile (for design system phase).
---
# UI Mockup Gate

Use when a task involves changing screens, components, interaction flows, or visual states. This gate manages **process** (variants, states, approvals). Visual **quality** is enforced by `design-craft`.

**Canonical rules**: `.github/skills/monstrare/ai/skills/ui-mockup-gate.md`

## Pre-Flight: Design System Check

**Always read `ai/context/design-system.md` first** (except during Epic 0 when the design system doesn't exist yet):

- Mockups MUST be built from approved design tokens and the component library inventory. No inventing new colors, spacing, or component styles on the fly.
- If a needed component is missing from inventory: **look up → build in existing style → register back** before continuing. Don't create one-off, unregistered components.
- If existing tokens/components truly can't serve the need: stop and confirm with the human before expanding the design system.

## Process

1. Read `ai/context/design-system.md`, list tokens/components this screen will use. Identify any missing components.
2. Create/update `ai/artifacts/<Epic>/screen-spec-<screen>.md` using `ai/templates/screen-spec.md` as template.
3. List all required states: default, loading, empty, error, disabled, unauthorized, mobile.
4. Produce 2-3 mockup variants (all built from existing tokens/components), save to `ai/artifacts/<Epic>/mockups/`.
5. Compare variants by clarity, information density, implementation complexity, and risk.
6. Record decision in `ai/artifacts/<Epic>/mockup-decision-<screen>.md` using `ai/templates/mockup-decision.md`.
7. **Stop before implementation** until the human picks a variant.

## Style Tile Variants (Epic 0 S2 Only)

During Epic 0's "visual style direction" phase, this gate produces 2-3 style tiles (not full layouts). Each variant shows color mood, typography personality, radius/shadow tendency, density, light/dark mode, and reference products. This is the only exception where "no existing tokens yet" applies — the goal is to produce the direction from which tokens will later be extracted.

## Design Craft Integration

Every mockup variant must apply `design-craft`'s 10 core disciplines before being presented:
- Start from features, not layout
- Hierarchy via contrast (size/weight/color)
- Over-generous whitespace (start at 24px, shrink only if needed)
- 4px spacing grid only
- Type scale + at least 3 font weights
- Color is a system (grayscale first, then semantic colors)
- Borders are visual noise — prefer spacing > background > shadow
- Depth: pick ONE of shadow/background/border, don't stack
- 5 states per interactive element (default/hover/focus/disabled/loading)
- Polish: check against `design-review-checklist.md`

## Output

- Screen spec
- List of reused tokens/components + newly registered components (if any)
- Variant comparison table
- Recommended variant
- Open questions
- Human approval request