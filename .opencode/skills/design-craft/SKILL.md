---
name: design-craft
description: Enforces visual-quality discipline on any UI work. Applies Refactoring UI principles (type scale, 4px spacing grid, layered color systems, depth rules, five interactive states) plus a curated reference list of high-quality open-source projects. USE FOR: design review, UI quality, visual polish, design system, component design, styling.
---
# Design Craft

Applies to ANY task that produces UI mockups or frontend visual implementation. `ui-mockup-gate` manages process (how many variants, which states, who approves); this skill manages **quality** — without it, process-compliant work can still look bad.

Principles adapted from *Refactoring UI* (Adam Wathan & Steve Schoger).

**Canonical rules**: `.github/skills/monstrare/ai/skills/design-craft.md`

## When to Use

- All stages of Epic 0's 5-stage design process (S2–S5)
- Before `ui-mockup-gate` produces any mockup variant
- During implementation of any frontend task
- Design review — or when user complains "ugly," "looks off," "misaligned"

## 10 Core Disciplines

1. **Start from features, not layout** — identify 1-3 primary actions on the page, make them prominent. Don't draw sidebar/header first and fill the middle.
2. **Hierarchy via contrast** — pick ONE tool: size, weight, or color. Weaken secondary info (smaller + grayer + lighter weight). Anti-pattern: all text same size/weight/color.
3. **Start with excessive whitespace** — card padding from 24px (`p-6`), shrink only if it feels too spacious. Cramped = cheap, spacious = premium.
4. **4px spacing grid only** — use `4/8/12/16/20/24/32/40/48/64`. Never 7, 13, 19px — makes things feel "off" without knowing why.
5. **Type scale + weight variety** — sizes: `11/12/13/14/16/18/20/24/30/36/48`. Weights: at least 3 (400 body / 500 emphasis / 600 subheading / 700 heading+buttons). Chinese projects: font stack MUST include `'PingFang TC', 'Microsoft JhengHei'` fallback. Heading line-height 1.2-1.3, body 1.5-1.7. Chinese letter-spacing = 0.
6. **Color is a system, not hex values** — grey scale (most important) + primary scale + semantic colors (success/warning/danger/info), 9-10 shades each. Hover/active/disabled use adjacent shades. **Grayscale the entire layout first, color last** — if grayscale hierarchy works, color is enhancement.
7. **Borders are visual noise** — preference order: spacing → background color → shadow → border (last resort). Use borders only for table rows, inputs, and other hard-boundary needs.
8. **Depth: pick ONE** — shadow (floating), background color (layered sections), border (sharp division). Don't stack them. Shadows simulate overhead light: y-offset > x-offset, blur > y-offset.
9. **5 states per interactive element** — default / hover / focus / disabled / loading. Data regions need: loading / empty / error / unauthorized. Default-only is half-done.
10. **Polish check** — compare against the design review checklist (spacing grid, type scale, 5 states, depth rule, grayscale-first, no one-off values) before delivery. Every ❌ is a fix opportunity.

## Reference-First Design

Don't design from memory. Before visual work, ask:
1. What type is this feature? (calendar / dashboard / form / list / detail / settings)
2. Which reference below is closest? Open it, find the matching page.
3. Copy its type sizes, spacing, colors, interactions. When unsure, copy the reference — don't guess.

| Type | Reference |
|---|---|
| Admin dashboard | [shadcn-admin](https://github.com/satnaing/shadcn-admin), [TailAdmin](https://github.com/TailAdmin/free-nextjs-admin-dashboard) |
| Booking/scheduling | [Cal.com](https://github.com/calcom/cal.com), [open-salon](https://github.com/clawnify/open-salon) |
| SaaS full-stack | [SaaS-Boilerplate](https://github.com/ixartz/SaaS-Boilerplate) |
| Component examples | [shadcn/ui examples](https://ui.shadcn.com/examples), [Tremor](https://github.com/tremorlabs/tremor), [Radix](https://www.radix-ui.com/primitives), [Mantine](https://ui.mantine.dev/) |
| Design inspiration | [Mobbin](https://mobbin.com/), [Dribbble](https://dribbble.com/) |

## Fixed Implementation Order

Don't skip the order. Complete each stage before moving on:
1. **Hierarchy** — define primary/secondary/tertiary info levels
2. **Layout & Spacing** — all from 4px scale
3. **Typography** — type scale sizes, varied weights, Chinese fallback + lang attribute
4. **Color** — grayscale first, then design token colors
5. **Depth** — pick ONE of border/shadow/background
6. **Polish** — fill in 5 interactive states + empty/loading/error screens

## Common Fixes (When User Says "Ugly")

- Font stack missing Chinese fallback → add PingFang TC / Microsoft JhengHei
- `lang="en"` on Chinese text → change to `zh-Hant`
- Hex values scattered across files → consolidate to design tokens
- All weights at 500 → primary 700, secondary 500, hint 400
- Spacing at 7/13/19px → change to 8/12/16/20
- Border + shadow + background stacked → remove two
- No empty/loading state → add them