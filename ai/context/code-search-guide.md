# Code Search Guide — LMC Portal

> Last updated: 2026-08-31 | Built by: project-search

## Quick Searches

### "Where is X?"

| What | Command |
|---|---|
| Any route/page | `glob [locale]/**/page.tsx` |
| All API routes | `glob api/**/route.ts` |
| All components | `glob components/**/*.tsx` |
| All shadcn/ui components | `glob components/ui/*.tsx` |
| Dictionary keys used | `grep 'dict\.' --include='*.tsx'` |
| Mock data | `grep 'useState\|hardcoded\|mock\|DEMO-\|demo_' --include='*.tsx'` |
| Hardcoded English strings | `grep '[A-Z][a-z]{3,}.*[A-Z]' --include='*.tsx'` (in pages without dict prop) |
| Links missing locale | `grep 'href=.*/[a-z]' --include='*.tsx'` (check for missing `${locale}`) |
| CSS variable usage | `grep 'var(--' --include='*.css'` |

### Framework Conventions

| Convention | Search |
|---|---|
| Server component | Files WITHOUT `"use client"` — check with `grep -L '"use client"'` |
| Client component | Files WITH `"use client"` — `grep -l '"use client"' --include='*.tsx'` |
| Dictionary-driven page | Uses `getDictionary(locale)` → `dict.xxx` |
| Non-i18n page | Hardcoded text visible in JSX (check about, privacy, terms, login, portal, admin) |
| Page with mock data | `useState([...` with hardcoded objects |
| Locale-aware link | `href={`/${locale}/...`}` |
| Bug: no locale prefix | `href="/courses"` (should be `href={`/${locale}/courses`}`) |

### Component Signature Patterns

| Component | Props Signature |
|---|---|
| Server page | `{ params: Promise<{ locale: string }> }` or `{ params: Promise<{ locale: string; slug: string }> }` |
| Dict-aware component | `{ dict: XxxDict; currentLocale: string }` |
| Pure UI component | `{ course: Course }` or `{ children: React.ReactNode }` |
| shadcn/ui | Follow their docs — `asChild`, `variant`, `size`, etc. |

## File Ownership

### Core Infrastructure (touch carefully)

| File | Role |
|---|---|
| `src/middleware.ts` | Locale redirect. Add auth checks here when implemented |
| `src/app/layout.tsx` | Root: font, Providers, Analytics. Rarely changes |
| `src/app/[locale]/layout.tsx` | Locale wrapper: Navbar, Footer, dict loading |
| `src/app/globals.css` | All styling. Add new design tokens here |
| `src/dictionaries/get-dictionary.ts` | `server-only` loader. Add new locales here |
| `src/dictionaries/types.ts` | Dict type definitions. Add slice types for new modules |
| `src/app/context/AccessibilityContext.tsx` | Accessibility state. Stable |

### Feature Modules (active development)

| Module | Files |
|---|---|
| Courses | `components/courses/*`, `app/[locale]/courses/**`, `app/[locale]/checkout/**` |
| Home | `components/home/*`, `components/HomePage.tsx`, `app/[locale]/page.tsx` |
| Portal | `app/[locale]/(portal)/**` |
| Admin | `app/[locale]/admin/**` |
| Auth (planned) | `app/[locale]/login/**`, `src/auth.ts`, `src/middleware.ts` |

### Pages Not Using i18n (need migration)

- `src/app/[locale]/about/page.tsx`
- `src/app/[locale]/privacy/page.tsx`
- `src/app/[locale]/terms/page.tsx`
- `src/app/[locale]/login/page.tsx`
- `src/app/[locale]/admin/page.tsx`
- `src/app/[locale]/(portal)/dashboard/**`

## Verification Commands

```bash
npm run lint        # ESLint — catches TypeScript, React, Next.js issues
npm run typecheck   # tsc --noEmit — full type checking
npm run build       # Production build — catches build-time errors
npm run dev         # Dev server on :3000
```