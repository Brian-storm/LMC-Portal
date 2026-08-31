# Design System — LMC Portal

> Last updated: 2026-09-01 | Built by: PS-007, PS-008, PS-009, PS-010

## 底層框架 (Foundation Framework)

### 框架與版本

| Layer | Choice | Version | Evidence |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.3.2 | `package.json` |
| Language | TypeScript | ^5 (strict, noEmit) | `package.json`, `tsconfig.json` |
| CSS Framework | Tailwind CSS v4 | ^4 | `package.json`, `postcss.config.mjs` (`@tailwindcss/postcss`) |
| Component Library | shadcn/ui | ^4.19.0 | `package.json`, `@import "shadcn/tailwind.css"` in `globals.css` |
| CSS Animation | tw-animate-css | ^1.4.0 | `package.json`, `@import "tw-animate-css"` in `globals.css` |
| Icon Set | lucide-react | ^1.33.0 | `package.json`, sole icon set for UI components |
| Animation | framer-motion | ^13.1.1 | `package.json` |
| Class Merging | tailwind-merge + clsx | ^3.6.0 / ^2.1.1 | `src/lib/utils.ts` — `cn()` utility |
| Variant API | class-variance-authority | ^0.7.1 | `package.json`, used with shadcn/ui components |
| Primitives | radix-ui | ^1.6.7 | `package.json`, underlies shadcn/ui |
| PostCSS Plugin | @tailwindcss/postcss | ^4 | `postcss.config.mjs` |

### 色彩空間

**oklch** is the exclusive color space for all design tokens in `globals.css`.

Rationale: oklch provides perceptually uniform lightness, predictable contrast ratios, and native browser support in Tailwind CSS v4. All theme variables — backgrounds, primary, accent, status colors, charts, sidebar, and dark mode variants — use `oklch(l c h)` notation.

Key color tokens (light mode):

| Token | Value | Description |
|---|---|---|
| `--background` | `oklch(0.985 0.003 140)` | Near-white with green tint |
| `--foreground` | `oklch(0.18 0.01 140)` | Dark slate |
| `--primary` | `oklch(0.28 0.05 160)` | Deep emerald (#1b4332 equivalent) |
| `--accent` | `oklch(0.72 0.11 85)` | Amber highlight |
| `--muted` | `oklch(0.94 0.01 140)` | Soft slate background |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Rose red |

Dark mode re-maps all tokens using `@custom-variant dark (&:is(.dark *))`.

### 字型策略 (Typography)

| Role | Font | Delivery |
|---|---|---|
| Primary | **Montserrat** | `next/font/google` in `src/app/layout.tsx`, loaded as `--font-montserrat` CSS variable, `display: swap`, `subsets: ["latin"]` |
| Fallback stack | Arial → Helvetica Neue → Helvetica → PingFang HK → Microsoft JhengHei → sans-serif | Defined in `--font-sans` (globals.css line 12, 46) |
| Monospace | ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas | `--font-mono` (globals.css line 47) |
| Heading | Same fallback stack as body | `--font-heading` (globals.css line 48), serif headings used per PROMPT.md convention |

Note: Montserrat is loaded and available via `--font-montserrat` CSS variable. The current `--font-sans` fallback stack starts with Arial; full Montserrat-first wiring pending in a later design token pass (PS-009).

### shadcn/ui Component Inventory

Installed components live in `src/components/ui/` and are added via `npx shadcn@latest add`. Current inventory:

- button, card, badge, dialog, input, select, table, dropdown-menu, checkbox, radio-group, toast, form

All follow shadcn/ui conventions: `cn()` utility for className merging, radix-ui primitives, CVA variant patterns. Checkbox, radio-group, toast, and form added in PS-010.

### 輔助函式庫

| Library | Purpose |
|---|---|
| `next-auth` v5 beta | Authentication (planned, not yet wired to real auth) |
| `@auth/prisma-adapter` | Auth persistence adapter |
| `prisma` / `@prisma/client` | ORM (planned, not yet connected) |
| `bcryptjs` | Password hashing (planned) |
| `@phosphor-icons/react` | Secondary icon set (available, not primary) |
| `@vercel/analytics` + `@vercel/speed-insights` | Observability |

### 準則

1. **Tailwind-first**: All styling through Tailwind utilities; no separate CSS modules or styled-components.
2. **shadcn/ui first**: New UI primitives added via `npx shadcn@latest add`, not custom from scratch.
3. **lucide-react exclusive**: No other icon libraries for component icons; phosphor-icons available as fallback.
4. **oklch only**: All new design tokens must use oklch color space.
5. **cn() for merging**: Always use `cn()` from `@/lib/utils` when composing classNames.
6. **Montserrat variable**: Font loaded in root layout; available site-wide via `var(--font-montserrat)`.

## 風格方向 (Style Direction)

> Selected: **Variant A — Institutional Slate/Emerald** | 2026-09-01 | Recorded in `ai/artifacts/專案設置/mockup-decision-style-tile.md`

### 色彩調性 (Color Mood)

| Role | Token | Hex Equivalent | Description |
|---|---|---|---|
| Primary | `oklch(0.28 0.05 160)` | `#1b4332` | Deep emerald — institutional authority |
| Primary Dark | `oklch(0.22 0.05 160)` | `#0d2118` | Hover/active states |
| Secondary | `oklch(0.48 0.03 160)` | — | Medium green for supporting text |
| Accent | `oklch(0.72 0.11 85)` | `#c4920a` | Amber pop for CTAs and highlights |
| Accent Hover | `oklch(0.66 0.10 85)` | — | Darker amber on hover |
| Background | `oklch(0.985 0.003 140)` | — | Near-white with green tint |
| Foreground | `oklch(0.18 0.01 140)` | `#1a202c` | Dark slate text |
| Surface | `oklch(1 0 0)` | `#ffffff` | Pure white cards |
| Muted | `oklch(0.94 0.01 140)` | — | Soft slate gray background |
| Destructive | `oklch(0.577 0.245 27.325)` | — | Rose red for errors/warnings |

### 字型個性 (Typography Personality)

- **Montserrat** primary (400/500/600/700 weights) via `next/font/google`
- 12px body text, tight institutional tracking on labels
- Monospace (`Courier New`) for CPD metadata and IA reference codes
- Fallback: Arial → Helvetica Neue → PingFang HK → Microsoft JhengHei

### 深度策略 (Depth Strategy)

- **Border + Shadow stacked** — current approach. Cards use `border` (1px) + `shadow-xs/sm` for layered depth
- Cards: 1px border + subtle shadow
- Navbar: 1px bottom border + backdrop blur
- Future consideration: evaluate border-only vs shadow-only to comply with design-craft depth principle

### 圓角傾向 (Radius Tendency)

- Default: `rounded-xs` (2px) — sharp, institutional corners
- Buttons/inputs: 2px radius
- Cards: 2px radius with accent pillar bar

### 密度 (Density)

- **Compact** — card padding 12px, section gaps 6-8px, body text 12px
- Optimized for information-dense CPD course cards with statutory metadata grids
- Future consideration: increase to 16px card padding for accessibility (from Variant B inspiration)

## Design Token 清單

> Built by: PS-009 | All values conform to design-craft discipline: 4px spacing grid, type scale 11-48px, oklch color, 9-10 shades per scale.

### 一、色彩 (Color)

#### 1.1 灰階系統 (Grey Scale) — 10 階

| Shade | Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|---|
| 50 | `grey-50` | `oklch(0.99 0.002 140)` | — | Subtle page tint |
| 100 | `grey-100` | `oklch(0.96 0.004 140)` | — | Background alternate |
| 200 | `grey-200` | `oklch(0.92 0.006 140)` | — | Section dividers |
| 300 | `grey-300` | `oklch(0.86 0.008 140)` | — | Disabled bg, subtle borders |
| 400 | `grey-400` | `oklch(0.72 0.008 140)` | — | Placeholder text |
| 500 | `grey-500` | `oklch(0.56 0.008 140)` | — | Secondary text |
| 600 | `grey-600` | `oklch(0.42 0.008 140)` | — | Body text alternate |
| 700 | `grey-700` | `oklch(0.30 0.008 140)` | — | Subheadings |
| 800 | `grey-800` | `oklch(0.22 0.008 140)` | — | Primary text |
| 900 | `grey-900` | `oklch(0.14 0.006 140)` | — | High-emphasis text |

The grey scale uses neutral hues (h=140) with near-zero chroma. Not individually mapped to CSS variables — Tailwind's built-in `slate` scale approximates this. Mapped semantic tokens (`--muted`, `--border`, `--foreground`, etc.) are the primary usage in `globals.css`.

#### 1.2 翡翠主色 (Emerald/Primary Scale) — 10 階

| Shade | Token | Light Mode | Usage |
|---|---|---|---|
| 50 | `emerald-50` | `oklch(0.97 0.012 155)` | Tinted backgrounds |
| 100 | `emerald-100` | `oklch(0.91 0.025 158)` | Light highlight bg |
| 200 | `emerald-200` | `oklch(0.83 0.035 158)` | Selected state bg |
| 300 | `emerald-300` | `oklch(0.72 0.05 160)` | Focus rings, decorative |
| 400 | `emerald-400` | `oklch(0.58 0.06 160)` | Progress bars, indicators |
| 500 | `emerald-500` | `oklch(0.46 0.06 160)` | Medium emphasis |
| 600 | `emerald-600` | `oklch(0.36 0.055 160)` | `--secondary` mapped |
| 700 | `emerald-700` | `oklch(0.28 0.05 160)` | `--primary` mapped |
| 800 | `emerald-800` | `oklch(0.20 0.045 158)` | `--primary-hover` equivalent |
| 900 | `emerald-900` | `oklch(0.12 0.03 155)` | Darkest accent |

Mapped CSS variables: `emerald-700` → `--primary`, `emerald-600` → `--secondary`, `emerald-800` equivalent to current `#0d2118` hover color.

#### 1.3 琥珀輔色 (Amber/Accent Scale) — 10 階

| Shade | Token | Light Mode | Usage |
|---|---|---|---|
| 50 | `amber-50` | `oklch(0.97 0.03 88)` | Tinted backgrounds |
| 100 | `amber-100` | `oklch(0.92 0.06 87)` | Warning low bg |
| 200 | `amber-200` | `oklch(0.86 0.09 86)` | Highlight borders |
| 300 | `amber-300` | `oklch(0.80 0.11 86)` | Focus rings |
| 400 | `amber-400` | `oklch(0.76 0.12 85)` | Active states |
| 500 | `amber-500` | `oklch(0.72 0.11 85)` | `--accent` mapped |
| 600 | `amber-600` | `oklch(0.62 0.10 84)` | Accent hover |
| 700 | `amber-700` | `oklch(0.50 0.08 83)` | Strong emphasis |
| 800 | `amber-800` | `oklch(0.38 0.06 82)` | Text on amber bg |
| 900 | `amber-900` | `oklch(0.26 0.04 80)` | Darkest accent |

Mapped CSS variables: `amber-500` → `--accent`, `amber-600` → `--accent-hover`, `amber-900` → `--accent-foreground`.

#### 1.4 語意色彩 (Semantic Colors)

| Role | CSS Variable | Light Mode | Dark Mode | Usage |
|---|---|---|---|---|
| Success | `--success` | `oklch(0.55 0.10 155)` | `oklch(0.60 0.10 155)` | Positive actions, confirmed |
| Success FG | `--success-foreground` | `oklch(0.99 0.001 0)` | `oklch(0.12 0.02 155)` | Text on success bg |
| Warning | `--warning` | `oklch(0.75 0.12 82)` | `oklch(0.78 0.12 82)` | Alerts, low quota |
| Warning FG | `--warning-foreground` | `oklch(0.22 0.04 80)` | `oklch(0.16 0.03 80)` | Text on warning bg |
| Danger | `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Errors, full, delete |
| Danger FG | `--destructive-foreground` | `oklch(0.99 0.001 0)` | `oklch(0.99 0.001 0)` | Text on danger bg |
| Info | `--info` | `oklch(0.65 0.08 230)` | `oklch(0.68 0.08 230)` | Informational, neutral |
| Info FG | `--info-foreground` | `oklch(0.99 0.001 0)` | `oklch(0.12 0.02 230)` | Text on info bg |

Danger reuses existing `--destructive`. Success/Warning/Info are **new** tokens added in PS-009.

#### 1.5 導覽列/側邊欄 (Navbar & Sidebar Tokens)

| Region | Token | Light Value | Dark Value |
|---|---|---|---|
| Navbar | `--navbar-bg` | `oklch(0.985 0.003 140)` | `oklch(0.18 0.02 160)` |
| Navbar | `--navbar-brand-start` | `oklch(0.22 0.04 160)` | `oklch(0.14 0.02 160)` |
| Navbar | `--navbar-brand-mid` | `oklch(0.28 0.05 160)` | `oklch(0.20 0.03 160)` |
| Navbar | `--navbar-brand-end` | `oklch(0.33 0.05 160)` | `oklch(0.26 0.04 160)` |
| Navbar | `--navbar-accent-hover` | `oklch(0.66 0.10 85)` | `oklch(0.80 0.12 85)` |
| Sidebar | `--sidebar` | `oklch(0.24 0.05 160)` | `oklch(0.15 0.02 160)` |
| Sidebar | `--sidebar-foreground` | `oklch(0.98 0.01 140)` | `oklch(0.98 0.005 140)` |
| Sidebar | `--sidebar-primary` | `oklch(0.72 0.11 85)` | `oklch(0.72 0.11 85)` |
| Sidebar | `--sidebar-accent` | `oklch(0.32 0.05 160)` | `oklch(0.26 0.03 160)` |

#### 1.6 圖表色彩 (Chart Colors)

| Index | Token | Light | Dark |
|---|---|---|---|
| 1 | `--chart-1` | `oklch(0.28 0.05 160)` | `oklch(0.72 0.11 85)` |
| 2 | `--chart-2` | `oklch(0.72 0.11 85)` | `oklch(0.48 0.03 160)` |
| 3 | `--chart-3` | `oklch(0.48 0.03 160)` | `oklch(0.85 0.05 140)` |
| 4 | `--chart-4` | `oklch(0.85 0.05 140)` | `oklch(0.60 0.08 150)` |
| 5 | `--chart-5` | `oklch(0.38 0.04 150)` | `oklch(0.38 0.04 150)` |

---

### 二、字型 (Typography)

#### 2.1 字級 Scale (Type Size)

| Token | px | rem | Tailwind Class | Usage |
|---|---|---|---|---|
| `text-3xs` | 11px | 0.688rem | `text-[11px]` | Micro-labels, monospace metadata |
| `text-2xs` | 12px | 0.75rem | `text-xs` | Body text (default), secondary labels |
| `text-xs` | 13px | 0.8125rem | `text-[13px]` | Emphasis body (planned upgrade) |
| `text-sm` | 14px | 0.875rem | `text-sm` | Subheadings, lead text |
| `text-base` | 16px | 1rem | `text-base` | Card titles |
| `text-lg` | 18px | 1.125rem | `text-lg` | Section headings |
| `text-xl` | 20px | 1.25rem | `text-xl` | Page subtitles |
| `text-2xl` | 24px | 1.5rem | `text-2xl` | Major section headings |
| `text-3xl` | 30px | 1.875rem | `text-3xl` | Hero subheadings |
| `text-4xl` | 36px | 2.25rem | `text-4xl` | Hero headings (mobile) |
| `text-5xl` | 48px | 3rem | `text-5xl` | Hero headings (desktop) |

Per design-craft: scale uses `11/12/13/14/16/18/20/24/30/36/48`. No 15px, 17px, or 19px.

#### 2.2 字重 (Font Weight)

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `font-normal` | 400 | `font-normal` | Body text, descriptions |
| `font-medium` | 500 | `font-medium` | Emphasis within body |
| `font-semibold` | 600 | `font-semibold` | Subheadings, card labels |
| `font-bold` | 700 | `font-bold` | Headings, buttons, CTAs |

Four weights minimum (design-craft requires ≥3). Montserrat supports all four weights via `next/font/google`.

#### 2.3 行高 (Line Height)

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `leading-tight` | 1.2 | `leading-tight` | Hero headings |
| `leading-snug` | 1.3 | `leading-snug` | Card titles, section headings |
| `leading-normal` | 1.5 | `leading-normal` | Body text (default) |
| `leading-relaxed` | 1.7 | `leading-relaxed` | Long-form content, descriptions |

Per design-craft: heading 1.2-1.3, body 1.5-1.7.

#### 2.4 字距 (Letter Spacing)

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `tracking-normal` | 0 | `tracking-normal` | Body text, Chinese text |
| `tracking-wide` | 0.025em | `tracking-wide` | Labels, metadata |
| `tracking-wider` | 0.05em | `tracking-wider` | Uppercase labels, buttons |
| `tracking-widest` | 0.1em | `tracking-widest` | Section overlines, badges |

Chinese text: letter-spacing = 0. English labels follow institutional wide-tracking convention.

#### 2.5 字體棧 (Font Stack)

| Token | Value |
|---|---|
| `--font-sans` | `Arial, "Helvetica Neue", Helvetica, "PingFang HK", "Microsoft JhengHei", "微軟正黑體", sans-serif` |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` |
| `--font-heading` | `Arial, "Helvetica Neue", Helvetica, "PingFang HK", "Microsoft JhengHei", sans-serif` |
| Montserrat | Loaded via `next/font/google` → `--font-montserrat` CSS variable (future: wire as `--font-sans` primary) |

---

### 三、間距 (Spacing)

#### 3.1 4px 間距網格 (Spacing Grid)

All spacing values are multiples of 4. Never use: 7, 13, 19, or any non-multiple-of-4.

| Token | px | Tailwind Class | Usage |
|---|---|---|---|
| `1` | 4px | `p-1`, `gap-1` | Tight icon spacing |
| `2` | 8px | `p-2`, `gap-2` | Compact internal padding |
| `3` | 12px | `p-3`, `gap-3` | Card body padding (compact) |
| `4` | 16px | `p-4`, `gap-4` | Standard section padding |
| `5` | 20px | `p-5`, `gap-5` | Moderate section gaps |
| `6` | 24px | `p-6`, `gap-6` | Comfortable card padding |
| `8` | 32px | `p-8`, `gap-8` | Major section separation |
| `10` | 40px | `p-10` | Page-level padding |
| `12` | 48px | `p-12` | Hero section padding |
| `16` | 64px | `p-16` | Maximum section separation |

#### 3.2 元件間距慣例 (Component Spacing Conventions)

| Context | Default | Tailwind |
|---|---|---|
| Card internal padding | 12px | `p-3` |
| Card section gap | 8px | `gap-2` |
| Page section gap | 32-48px | `py-8` to `py-12` |
| Navbar height | 56px | `--navbar-height: 3.5rem` |
| Portal subheader height | 48px | `--subbar-height: 3rem` |
| Button internal | 8px 16px | `py-2 px-4` |

---

### 四、圓角 (Radius)

#### 4.1 基準圓角 Scale

Base `--radius` = `0.625rem` (10px) — the shadcn/ui default. All derived radii use `calc(var(--radius) * multiplier)`.

| Token | Multiplier | Approx px | Tailwind Class | Usage |
|---|---|---|---|---|
| `--radius-sm` | ×0.6 | 6px | `rounded-sm` | Subtle rounding |
| `--radius-md` | ×0.8 | 8px | `rounded-md` | Standard rounding |
| `--radius-lg` | ×1.0 | 10px | `rounded-lg` | Cards, dialogs |
| `--radius-xl` | ×1.4 | 14px | `rounded-xl` | Large containers |
| `--radius-2xl` | ×1.8 | 18px | `rounded-2xl` | Hero cards |
| `--radius-3xl` | ×2.2 | 22px | `rounded-3xl` | Modals |
| `--radius-4xl` | ×2.6 | 26px | `rounded-4xl` | Full-width banners |

#### 4.2 專案圓角慣例

Per approved style direction (Variant A):

| Element | Radius | Tailwind Class |
|---|---|---|
| Buttons | 2px | `rounded-xs` |
| Inputs | 2px | `rounded-xs` |
| Cards | 2px | `rounded-xs` |
| Badges | 2px | `rounded-xs` |
| Dropdown menus | 0px | `rounded-none` |
| Dialogs | 0px | `rounded-none` |
| Language switcher tabs | 2px | `rounded-xs` |
| Cookie consent | 2px | `rounded-xs` |

Note: The shadcn/ui `--radius` = 10px exists for shadcn component compatibility. The project convention overrides it per-element with explicit `rounded-xs` / `rounded-none` classes.

---

### 五、陰影 (Shadow)

#### 5.1 陰影層級 (Elevation Levels)

Per design-craft: "Shadows simulate overhead light: y-offset > x-offset, blur > y-offset."

| Level | CSS Value | Tailwind Class | Usage |
|---|---|---|---|
| `none` | `none` | `shadow-none` | Flat surfaces |
| `xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `shadow-xs` | Subtle card elevation, inputs |
| `sm` | `0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)` | `shadow-sm` | Navbar, small cards |
| `md` | `0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)` | `shadow-md` | Dropdown menus, CTAs |
| `lg` | `0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)` | `shadow-lg` | Modals, dialogs |
| `xl` | `0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.06)` | `shadow-xl` | Cookie consent, tooltips |
| `2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.15)` | `shadow-2xl` | Full-screen overlays |

#### 5.2 深度策略慣例

Per approved style direction (Variant A): **Border + Shadow stacked**. This is the current approach; it's documented as-is. Future refinements (PS-009 open question: move to border-only or shadow-only per design-craft depth principle) are deferred.

| Element | Depth Strategy |
|---|---|
| Cards | 1px border + `shadow-xs` |
| Navbar | 1px bottom border + `shadow-xs` + backdrop-blur |
| Dropdown menus | 1px ring + `shadow-md` |
| Dialogs | 1px ring + `shadow-lg` + backdrop |
| Buttons (primary) | `shadow-xs` + border |
| Language switcher | `shadow-xs` + border |

---

### 六、Z-Index 分層 (Layer Stack)

| Layer | z-index | Tailwind Class | Component |
|---|---|---|---|
| Base content | 0 | (default) | Page body |
| Dropdown overlay | 10 | `z-10` | Carousel overlays, select chevrons |
| Content overlay | 20 | `z-20` | Hero content overlay |
| Sticky sub-header | 30 | `z-30` | Portal sub-header, sidebar mobile |
| Fixed navbar | 50 | `z-50` | Main Navbar, select/dropdown/dialog content, cookie consent |
| (reserved) | 60 | `z-60` | Future: toast notifications |

Current usage verified by codebase search:
- `z-10`: Hero carousel content overlay, select chevrons
- `z-20`: Hero slide text overlay
- `z-30`: Portal sub-header (sticky), mobile sidebar overlay, slide indicators
- `z-50`: Navbar (sticky), dropdown menus, select popover, dialog overlay/dialog, cookie consent, accessibility menu

---

### 七、動態 (Motion)

#### 7.1 持續時間 (Duration)

| Token | Value | Tailwind Class | Usage |
|---|---|---|---|
| `duration-100` | 100ms | `duration-100` | Instant feedback (dropdown open) |
| `duration-150` | 150ms | `duration-150` | Hover states, micro-interactions |
| `duration-200` | 200ms | `duration-200` | Standard transitions (default) |
| `duration-300` | 300ms | `duration-300` | Page transitions, navbar effects |
| `duration-500` | 500ms | `duration-500` | Dashboard chart animations |

#### 7.2 緩動曲線 (Easing)

| Token | CSS Value | Tailwind Class | Usage |
|---|---|---|---|
| `ease-linear` | `linear` | `ease-linear` | Indeterminate progress |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | `ease-in` | Enter animations |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | `ease-out` | Exit animations, cookie consent |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | `ease-in-out` | Sidebar transitions, carousel |

#### 7.3 常用轉場組合 (Common Transitions)

| Pattern | Tailwind Classes | Usage |
|---|---|---|
| Color only | `transition-colors` | Link hovers, button hovers, nav links |
| All properties | `transition-all duration-200` | Card hover lifts, feature cards |
| Transform only | `transition-transform duration-300` | Logo scale on hover, image zoom |
| Opacity only | `transition-opacity duration-1000 ease-in-out` | Hero carousel crossfade |

---

### 八、互動狀態 (Interactive States)

Per design-craft: 5 states per interactive element. Documented here as the canonical behavior contract for all components.

| State | Visual Treatment |
|---|---|
| **Default** | Element at rest with its base styling |
| **Hover** | Primary: darken by 1 shade. Accent: brighten. Ghost: add background tint |
| **Focus** | `ring-2 ring-ring` with `ring-offset-2` (Tailwind default). Inputs: border color → primary |
| **Disabled** | `opacity-50` + `cursor-not-allowed` + `pointer-events-none` |
| **Loading** | Spinner/skeleton for >200ms operations. Use `animate-spin` or `animate-pulse` |

Data display regions additionally need: **Loading** (skeleton/spinner), **Empty** (message + CTA), **Error** (message + retry), **Unauthorized** (friendly message, no raw 403).

---

### 九、Tailwind v4 Theme Mapping (globals.css)

All tokens declared above map to Tailwind v4's `@theme inline` block in `src/app/globals.css`. The mapping uses CSS custom properties as the single source of truth:

| CSS Variable | Tailwind Utility |
|---|---|
| `--primary` | `bg-primary`, `text-primary`, `border-primary` |
| `--secondary` | `bg-secondary`, `text-secondary` |
| `--accent` | `bg-accent`, `text-accent` |
| `--muted` | `bg-muted` |
| `--destructive` | `bg-destructive`, `text-destructive` |
| `--success` | `bg-success`, `text-success` (new in PS-009) |
| `--warning` | `bg-warning`, `text-warning` (new in PS-009) |
| `--info` | `bg-info`, `text-info` (new in PS-009) |
| `--navbar-bg` | `bg-navbar-bg` |
| `--sidebar` | `bg-sidebar` |
| `--border` | `border-border` |
| `--ring` | `ring-ring` |
| `--radius` | `rounded-lg`, `rounded-md` (shadcn/ui derived) |

The `@theme inline` block in `globals.css` uses `--color-*` syntax: `--color-primary: var(--primary)` etc., enabling Tailwind utilities like `text-primary`.

---

### 十、Token 對照現有元件 (Token-to-Component Mapping)

| Component | Colors Used | Spacing | Radius | Shadow | Typography |
|---|---|---|---|---|---|
| Navbar | `navbar-bg`, `navbar-brand-*`, `accent`, `primary` | `px-4/6`, `py-1.5-3.5` | `rounded-xs` | `shadow-xs` + border | 12px uppercase |
| Hero Carousel | `slate-900`, `emerald-950`, `accent` | `py-40-56` | `rounded-xs` | bg overlay | 30-48px bold |
| Feature Cards | `card`, `primary/10`, `border/80` | `p-6`, `gap-8` | `rounded-xs` | `shadow-xs→md` hover | 18px bold title |
| Course Card | `white`, `slate-*`, `emerald-*`, `amber-*` | `p-3`, `gap-2` | `rounded-xs` | border + `shadow-2xs` | 12-14px, mono meta |
| Sidebar | `sidebar-*`, `accent` | `px-3`, `py-2` | `rounded-md` | none | 12px medium |
| Buttons (primary) | `primary`, `primary-fg` | `py-2 px-3-6` | `rounded-xs` | `shadow-xs/md` | 11-12px bold uppercase |
| Badges | context-dependent | `py-0.5 px-2` | `rounded-xs` | none | 9-12px bold uppercase |
| Inputs | `surface`, `border`, `ring` | `py-2 px-3` | `rounded-xs` | none | 12px |
| Dialogs | `popover`, `foreground/10` ring | `p-4`, `gap-4` | `rounded-none` | `shadow-lg` + ring | 12px |

---

### 十一、已知缺口 (Known Gaps)

| Gap | Status | Plan |
|---|---|---|
| Montserrat not wired as `--font-sans` primary | Open | Future task: update `--font-sans` to start with `var(--font-montserrat)` |
| Hex `#1b4332` scattered in components | Open | Future task: replace with `text-primary` / `bg-primary` |
| Border+shadow stacked violates design-craft depth principle | Deferred | Evaluate in future — consider moving to border-only |
| No semantic `success`/`warning`/`info` in globals.css | ✅ Fixed in PS-009 | Added to `:root` and `.dark` |
| Missing Checkbox/Radio/Toast/Form components | ✅ Fixed in PS-010 | Added to `src/components/ui/` |
| Body text at 12px (below 13px accessibility recommendation) | Open | Deferred — evaluate bump to 13px in future |

---

## 元件庫 Inventory

> Built by: PS-010 | All components in `src/components/ui/` use S3-approved design tokens exclusively. shadcn/ui 4.x conventions with project-specific overrides.

### Inventory Summary

| # | Component | File | States | Tokens Used |
|---|---|---|---|---|
| 1 | **Button** | `ui/button.tsx` | default/hover/focus/disabled/loading | `--primary`, `--secondary`, `--destructive`, `--border`, `--muted` |
| 2 | **Input** | `ui/input.tsx` | default/hover/focus/disabled/error | `--input`, `--border`, `--ring`, `--destructive`, `--muted-foreground` |
| 3 | **Select** | `ui/select.tsx` | default/focus/disabled/error | `--input`, `--popover`, `--accent`, `--border`, `--ring`, `--muted-foreground` |
| 4 | **Checkbox** | `ui/checkbox.tsx` | unchecked/checked/disabled/focus | `--input`, `--primary`, `--primary-foreground`, `--ring`, `--destructive` |
| 5 | **RadioGroup** | `ui/radio-group.tsx` | unchecked/checked/disabled/focus | `--input`, `--primary`, `--primary-foreground`, `--ring`, `--destructive` |
| 6 | **Card** | `ui/card.tsx` | default/sm size, header/content/footer/action/title/description slots | `--card`, `--card-foreground`, `--foreground`, `--muted-foreground` |
| 7 | **Badge** | `ui/badge.tsx` | default/secondary/destructive/outline/ghost/link | `--primary`, `--secondary`, `--destructive`, `--border`, `--muted` |
| 8 | **Dialog** | `ui/dialog.tsx` | open/closed, overlay, escape/click-outside close, focus trap via radix | `--popover`, `--background` |
| 9 | **Table** | `ui/table.tsx` | header/row hover/sortable columns | `--muted`, `--border`, `--foreground` |
| 10 | **DropdownMenu** | `ui/dropdown-menu.tsx` | open/closed, items with checkbox/radio, sub-menus | `--popover`, `--accent`, `--destructive`, `--border`, `--muted-foreground` |
| 11 | **Toast** | `ui/toast.tsx` | default/success/warning/danger/info, auto-dismiss, manual close | `--success`, `--warning`, `--destructive`, `--info`, `--border`, `--card` |
| 12 | **Form** | `ui/form.tsx` | label/input/error grouping, submit handling, required indicator | `--destructive`, `--foreground` |
| 13 | **Navbar** | `components/Navbar.tsx` | default/sticky/mobile, dropdown menus, backdrop blur | `--navbar-bg`, `--navbar-brand-*`, `--accent`, `--primary` |

### Detailed Component Specifications

#### 1. Button

- **Source**: `src/components/ui/button.tsx`
- **Underlying**: Custom + `radix-ui` Slot primitive for `asChild` support
- **Variants**: `default` (primary-filled), `outline` (bordered), `secondary` (muted bg), `ghost` (transparent), `destructive` (tinted red), `link` (underline)
- **Sizes**: `xs`, `sm`, `default`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`
- **States**:
  - Default: `bg-primary text-primary-foreground`
  - Hover: `hover:bg-primary/80` (default), `hover:bg-muted` (ghost)
  - Focus: `focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50`
  - Disabled: `disabled:pointer-events-none disabled:opacity-50`
  - Loading: `<Loader2>` spinner + auto-disabled
- **Tokens**: `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--destructive`, `--background`, `--muted`, `--foreground`, `--border`, `--input`, `--ring`

#### 2. Input

- **Source**: `src/components/ui/input.tsx`
- **Underlying**: Native `<input>`
- **States**:
  - Default: `border-input bg-transparent`
  - Hover: inherited border (no explicit hover — consumers may override)
  - Focus: `focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50`
  - Disabled: `disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-input/50`
  - Error: `aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20`
  - Placeholder: `placeholder:text-muted-foreground`
- **Tokens**: `--input`, `--border`, `--ring`, `--destructive`, `--muted-foreground`, `--foreground`

#### 3. Select

- **Source**: `src/components/ui/select.tsx`
- **Underlying**: `radix-ui` Select primitive
- **Sub-components**: `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`
- **States**:
  - Default: `border-input bg-transparent`
  - Focus: `focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50`
  - Disabled: `disabled:cursor-not-allowed disabled:opacity-50`
  - Error: `aria-invalid:border-destructive aria-invalid:ring-1`
  - Open content: `shadow-md ring-1 ring-foreground/10` with animate-in
- **Tokens**: `--input`, `--popover`, `--popover-foreground`, `--accent`, `--accent-foreground`, `--border`, `--ring`, `--muted-foreground`, `--foreground`

#### 4. Checkbox

- **Source**: `src/components/ui/checkbox.tsx` (new in PS-010)
- **Underlying**: `radix-ui` Checkbox primitive
- **Sub-components**: `Checkbox`, `CheckboxWithLabel`
- **States**:
  - Unchecked: `border-input bg-transparent`
  - Checked: `data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground`
  - Focus: `focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50`
  - Disabled: `disabled:cursor-not-allowed disabled:opacity-50`
  - Error: `aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20`
- **Radius**: `rounded-xs` (2px) — matches project convention
- **Tokens**: `--input`, `--primary`, `--primary-foreground`, `--ring`, `--destructive`

#### 5. RadioGroup

- **Source**: `src/components/ui/radio-group.tsx` (new in PS-010)
- **Underlying**: `radix-ui` RadioGroup primitive
- **Sub-components**: `RadioGroup`, `RadioGroupItem`, `RadioGroupItemWithLabel`
- **States**:
  - Unchecked: `border-input bg-transparent`
  - Checked: `data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground` (2px inner dot in `primary-foreground`)
  - Focus: `focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50`
  - Disabled: `disabled:cursor-not-allowed disabled:opacity-50`
- **Radius**: `rounded-full` (circular radio button)
- **Tokens**: `--input`, `--primary`, `--primary-foreground`, `--ring`, `--destructive`

#### 6. Card

- **Source**: `src/components/ui/card.tsx`
- **Underlying**: Plain `<div>` with compound slot pattern
- **Slots**: `Card` (container), `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`
- **Variants**: `default` (16px padding), `sm` (12px padding)
- **States**: Default ring-1 border; no hover state (consumers add via className)
- **Tokens**: `--card`, `--card-foreground`, `--foreground`, `--muted-foreground`
- **Note**: Uses `ring-1 ring-foreground/10` for border; project convention overrides with explicit `border border-border` in consumer components

#### 7. Badge

- **Source**: `src/components/ui/badge.tsx`
- **Underlying**: CVA + `radix-ui` Slot for `asChild`
- **Variants**: `default` (primary), `secondary`, `destructive`, `outline`, `ghost`, `link`
- **States**: Focus-visible ring; no explicit hover (link variant has underline)
- **Tokens**: `--primary`, `--primary-foreground`, `--secondary`, `--secondary-foreground`, `--destructive`, `--border`, `--muted`, `--muted-foreground`, `--foreground`

#### 8. Dialog

- **Source**: `src/components/ui/dialog.tsx`
- **Underlying**: `radix-ui` Dialog primitive
- **Sub-components**: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogOverlay`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`
- **Features**: Overlay backdrop, close on Escape, close on click-outside (radix default), focus trap (radix default)
- **Tokens**: `--popover`, `--popover-foreground`, `--background`
- **Note**: Uses `rounded-none` per project convention for dialogs. Close button uses `Button variant="ghost"`

#### 9. Table

- **Source**: `src/components/ui/table.tsx`
- **Underlying**: Native `<table>` with scroll wrapper
- **Sub-components**: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`
- **States**: Row hover (`hover:bg-muted/50`), selected (`data-[state=selected]:bg-muted`)
- **Tokens**: `--muted`, `--border`, `--foreground`, `--muted-foreground`
- **Note**: Table wrapper provides `overflow-x-auto` for horizontal scroll on mobile

#### 10. DropdownMenu

- **Source**: `src/components/ui/dropdown-menu.tsx`
- **Underlying**: `radix-ui` DropdownMenu primitive
- **Sub-components**: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`
- **States**: Focused item (`focus:bg-accent focus:text-accent-foreground`), destructive variant, disabled (`data-disabled:opacity-50`), inset layout
- **Tokens**: `--popover`, `--popover-foreground`, `--accent`, `--accent-foreground`, `--destructive`, `--border`, `--muted-foreground`

#### 11. Toast

- **Source**: `src/components/ui/toast.tsx` (new in PS-010)
- **Underlying**: React Context + useReducer (no external dependency)
- **Wired in**: `src/components/Providers.tsx` via `<ToastProvider>`
- **Variants**: `default`, `success`, `warning`, `danger`, `info`
- **Features**: Auto-dismiss (default 5s, configurable), manual close, icon per variant, slide-in animation, stacking (newest on top)
- **API**:
  - `useToast()` hook → `{ addToast, dismissToast }`
  - Helper: `toast(addToast, "Title", { description?, variant?, duration? })`
- **States**: All 5 variants + dismiss action
- **Tokens**: `--success`, `--warning`, `--destructive`, `--info`, `--border`, `--card`, `--card-foreground`, `--muted-foreground`
- **Z-index**: 50 (viewport)

#### 12. Form

- **Source**: `src/components/ui/form.tsx` (new in PS-010)
- **Underlying**: Native `<form>` + React.Children utilities
- **Sub-components**: `Form` (container), `FormField` (label + input + error grouping)
- **Features**: `noValidate` by default, preventDefault onSubmit, auto-id generation, `required` indicator (`*` in destructive color), error message with `role="alert"`
- **States**: FormField: default, required, error (red text + `aria-invalid` on child)
- **Tokens**: `--destructive`, `--foreground`

#### 13. Navbar

- **Source**: `src/components/Navbar.tsx`
- **Underlying**: Custom component (not shadcn)
- **Features**: Sticky top, backdrop blur, gradient logo panel with clip-path, desktop nav links + mobile drawer, language switcher + accessibility menu + sign-in in utility bar
- **Tokens**: `--navbar-bg`, `--navbar-brand-start/mid/end`, `--navbar-accent-hover`, `--primary`, `--accent`, `--accent-foreground`, `--foreground`, `--secondary`
- **States**: Sticky, mobile open/closed, nav link hover (border-bottom accent)
- **Z-index**: 50