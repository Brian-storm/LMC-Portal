# lmc-portal — Next.js App Router CPD Platform

## Commands

- `npm run dev` — start dev server (http://localhost:3000)
- `npm run build` — build for production
- `npm run start` — run production server
- `npm run lint` — run ESLint
- `npm run typecheck` — run `tsc --noEmit` to verify types

## Architecture

- **Framework**: Next.js 16.x App Router
- **i18n**: Dynamic routing via `app/[locale]/...` (en, zh-hk, zh-cn). All user routes live under `[locale]`. Never add routes outside this pattern.
- **Dictionary-driven i18n**: UI text comes from `src/dictionaries/` (en.json, zh-hk.json, zh-cn.json). Never hardcode static strings in components. Components receive a `dict` prop typed via `CourseViewDict` (or equivalent per-page dict type). See `src/dictionaries/types.ts` and `src/dictionaries/get-dictionary.ts`.
- **`server-only`**: Dictionary imports use `import "server-only"` + dynamic `import()` to avoid client-side bundle leakage (`src/dictionaries/get-dictionary.ts`).
- **Providers**: `src/components/Providers.tsx` wraps the app with `AccessibilityProvider`. Always ensure Providers are at the root (`src/app/layout.tsx`).
- **Tailwind CSS v4**: Config in `postcss.config.mjs`. Styling lives in `src/app/globals.css` with extensive CSS variable theme defined inline. Tailwind classes follow shadcn/ui patterns + `tailwind-merge` for `className` merging.
- **Color palette**: Institutional slate/emerald. Primary: deep emerald `#1b4332`. Status: amber (low quota), rose (full), emerald (open). See `src/app/globals.css` for the full CSS variable theme.
- **Icons**: `lucide-react` — use from that set only (Clock, User, MapPin, Award, etc. listed in `PROMPT.md`).
- **TypeScript**: `strict: true`, `noEmit: true`. Path aliases `@/*` → `src/*` (tsconfig.json).

## Key Conventions

- **Never hardcode UI text** in presentation components — always use the `dict` prop.
- **Course page dict keys** (from `PROMPT.md`): `dict.iaRef`, `dict.certificateBadge`, `dict.coreRegulatoryRequirement`, `dict.cpdHours`, `dict.deliveryMode`, `dict.language`, `dict.free`, `dict.quotaRemaining`, `dict.seats`, `dict.enrollCta`, `dict.downloadBrochure`.
- **Status badges**: `FEW_SEATS` → show remaining seats + "Enroll Now"; `FULL` → "Course Fully Booked" disabled; `CLOSED` → "Registration Closed" disabled.
- **Font**: `Montserrat` via `next/font` (optimized). Sans-serif fallback in globals.css is Arial/Helvetica/PingFang HK/Microsoft JhengHei.
- **Accessibility**: `high-contrast` CSS class; `accessibility-wrapper` utilities for text scaling (`text-size-md`, `text-size-lg`, `text-size-xl`).
- **No CI / no test scripts** in this repo. Lint + typecheck are the quality gates (`npm run lint && npm run typecheck`).

## Environment Variables

- `.env.example` lists expected env vars (site URL, API base, AWS, SES).
- Copy `.env.example` to `.env` and fill in values before connecting to any backend.

## Adding a New Page

1. Create `src/app/[locale]/<section>/page.tsx` (or `src/app/[locale]/<page>.tsx` for static routes).
2. Import and use the page-level dict type from `src/dictionaries/types.ts` (e.g., `CourseViewDict`).
3. Pass `dict` from a dictionary loader or page context.
4. Style with Tailwind classes matching the institutional slate/emerald aesthetic.
5. Add `dict` keys to the dictionary JSON files if new text is needed.

## Verifying Locale Routes

- Routes under `app/[locale]/...` auto-resolve for en/zh-hk/zh-cn.
- The `[locale]` segment is a dynamic segment — verify i18n by checking both the locale folder and any `locale` prop/state passed to components.
- See `src/app/[locale]/` for existing locale patterns (courses, about, admin, checkout, etc.).