# lmc-portal

Continuing Professional Development (CPD) course management platform for financial and insurance professionals in Hong Kong.

## Getting Started

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build
npm run start      # Run production server
npm run lint       # Run ESLint
npm run typecheck  # Verify types (tsc --noEmit)
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values. Required for backend integration (API, AWS S3, SES).

## Architecture

- **Framework**: Next.js 16 App Router
- **i18n**: Three locales (en, zh-hk, zh-cn) via `app/[locale]/...` dynamic routing
- **Styling**: Tailwind CSS v4 with shadcn/ui components
- **Typography**: Montserrat via `next/font`, with PingFang HK / Microsoft JhengHei fallbacks
- **Icons**: lucide-react

## Project Structure

```
src/
  app/                  # App Router — all routes under [locale]/
    [locale]/           # i18n routes (courses, about, admin, checkout, dashboard, etc.)
  components/           # Shared UI (Navbar, Footer, CourseCard, Providers, etc.)
  dictionaries/         # i18n dictionaries (en.json, zh-hk.json, zh-cn.json)
  lib/                  # Utilities
```

## Key Conventions

- **Dictionary-driven i18n**: Never hardcode UI text — components receive a `dict` prop. See `src/dictionaries/types.ts`.
- **Locale routes only**: All user-facing pages live under `src/app/[locale]/...`. Never add routes outside this pattern.
- **Lint is the quality gate**: No CI or test scripts — `npm run lint` is the only check.