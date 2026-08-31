# Design System — LMC Portal

> Last updated: 2026-09-01 | Built by: PS-007, PS-008

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

- button, card, badge, dialog, input, select, table, dropdown-menu

All follow shadcn/ui conventions: `cn()` utility for className merging, radix-ui primitives, CVA variant patterns.

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

### 參考產品 (Reference Products)

- **PEAK (VTC Hong Kong)** — Professional education portal, institutional green, compact metadata tables
- **CII Hong Kong** — Chartered Insurance Institute HK, authoritative navy/emerald, amber CTA highlights