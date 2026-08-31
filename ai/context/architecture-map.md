# Architecture Map — LMC Portal

> Last updated: 2026-08-31 | Built by: project-search

## Request Flow

```
Browser Request
     │
     ▼
middleware.ts (locale redirect)
     │  / → /en/ , /about → /en/about
     │  Locale cookie-aware
     ▼
Root Layout (src/app/layout.tsx)
     │  Montserrat font, Providers (AccessibilityProvider), Analytics
     ▼
Locale Layout (src/app/[locale]/layout.tsx)
     │  getDictionary(locale) → dict
     │  Renders: Navbar → children → Footer → CookieConsent
     ▼
Page Component (server or client)
     │
     ├── Public Pages (no auth)
     │   ├── / → HomePage (server) → HeroCarousel + CredentialsBar + FeatureCards + NewsletterForm
     │   ├── /courses → CoursesView (client) → CourseHeader + CourseFilters + CourseList + CourseCard
     │   ├── /courses/[slug] → CourseDetailView (client)
     │   ├── /courses/[slug]/enroll → 3-step wizard (client)
     │   ├── /about → hardcoded HTML (server, no i18n)
     │   ├── /privacy → hardcoded HTML (server, no i18n)
     │   ├── /terms → hardcoded HTML (server, no i18n)
     │   ├── /login → mock auth form (client)
     │   └── /test → sandbox page (server)
     │
     ├── Portal Pages (would need auth — currently unprotected)
     │   └── Portal Layout (src/app/[locale]/(portal)/layout.tsx)
     │       ├── /dashboard → mock learner dashboard (client)
     │       ├── /dashboard/enrolments → placeholder (client)
     │       └── /dashboard/enrolments/[id]/confirmation → mock receipt (client)
     │
     └── Admin Pages (would need admin auth — currently unprotected)
         ├── /admin → mock admin dashboard (client)
         ├── /admin/courses → (TBD)
         └── /admin/enrolments → placeholder (client)
```

## Component Tree (Key Relationships)

```
RootLayout
└── Providers (AccessibilityProvider)
    └── LocaleLayout
        ├── Navbar
        │   ├── LanguageSwitcher (EN/繁/簡)
        │   └── AccessibilityMenu (text size + high contrast)
        ├── [Page Content]
        │   ├── HomePage (server)
        │   │   ├── Breadcrumbs
        │   │   ├── HeroCarousel
        │   │   ├── CredentialsBar
        │   │   ├── FeatureCards
        │   │   └── NewsletterForm
        │   │
        │   ├── CoursesView (client) ← Course Catalog
        │   │   ├── CourseHeader
        │   │   ├── CourseFilters (search, category, CPD hours)
        │   │   └── CourseList
        │   │       └── CourseCard (×N)
        │   │
        │   ├── CourseDetailView (client) ← Single Course
        │   │   ├── Breadcrumbs
        │   │   ├── CourseHeader (statutory layout)
        │   │   ├── Syllabus modules
        │   │   ├── Schedule & Location
        │   │   ├── Instructors
        │   │   ├── Reviews
        │   │   ├── FAQ accordion
        │   │   └── Enrollment sidebar (status badge + CTA + fee)
        │   │
        │   ├── PortalLayout (client) ← Dashboard shell
        │   │   ├── Sub-bar (verification status)
        │   │   └── Sidebar + content area
        │   │
        │   └── AdminDashboard (client)
        │       ├── KPI cards (enrolments, pending, CPD hours, courses)
        │       └── Audit table (approve/flag/receipt)
        │
        ├── Footer
        └── CookieConsent
```

## Data Flow (Current — All Mock)

```
Page Component
  ├── Server pages: call getDictionary(locale) → await dict
  │     Pass dict.* slice to child components as props
  │     Hardcoded course data returned from inline functions
  │     Example: courses/[slug]/page.tsx → Promise.all([getDict, getCourseBySlug])
  │
  └── Client pages: useParams() to get locale, hardcoded useState() for mock data
        Example: dashboard/page.tsx → const [enrolments] = useState([...mock data...])
```

## i18n Architecture

```
src/dictionaries/
  en.json       ← Canonical, used to infer Dictionary type
  zh-hk.json
  zh-cn.json

types.ts:       type Dictionary = typeof en
                 export NavDict = Dictionary["nav"]
                 export CourseViewDict = Dictionary["courseView"]
                 ...etc

get-dictionary.ts:
  import "server-only"        ← Prevents client-side bundle inclusion
  const dictionaries: Record<Locale, () => Promise<Dictionary>>
  Uses dynamic import() → avoids bundling all locale JSON on every page

Component pattern:
  Server page: const dict = await getDictionary(locale)
               <Component dict={dict.section} currentLocale={locale} />

  Client component: receives dict + currentLocale as props
```

## CSS Architecture

```
globals.css (208 lines)
  ├── @import "tailwindcss"
  ├── @import "tw-animate-css"
  ├── @import "shadcn/tailwind.css"
  ├── @theme { --font-sans, etc. }
  ├── Accessibility: .text-size-md/lg/xl, .high-contrast
  ├── @custom-variant dark (&:is(.dark *))
  ├── @theme inline { all shadcn color vars mapped to CSS vars }
  ├── :root { light mode vars (oklch) }
  │     Primary: oklch(0.28 0.05 160) ≈ #1b4332 deep emerald
  │     Accent: oklch(0.72 0.11 85) ≈ amber
  │     Background: oklch(0.985 0.003 140) ≈ near-white
  │     Navbar tokens: bg, brand-start/mid/end, accent-hover
  ├── .dark { dark mode vars }
  └── @layer base { border, body, html defaults }
```

## Routing Conventions

| Pattern | Example | Purpose |
|---|---|---|
| `[locale]/page.tsx` | `/en` | Home page |
| `[locale]/<section>/page.tsx` | `/en/courses` | Section index |
| `[locale]/<section>/[slug]/page.tsx` | `/en/courses/cpd-101` | Detail page |
| `[locale]/<section>/[slug]/<action>/page.tsx` | `/en/courses/cpd-101/enroll` | Action page |
| `[locale]/(portal)/dashboard/page.tsx` | `/en/dashboard` | Route group (shared layout, no URL segment) |
| `api/<resource>/route.ts` | `api/courses` | API endpoint |

## Key Architectural Decisions

1. **`server-only`** in `get-dictionary.ts` — dictionary JSON never leaks to client bundles
2. **`(portal)` route group** — shares a layout (sidebar + sub-bar) without adding a URL segment
3. **No layout groups for admin** — admin pages under `[locale]/admin/` share the public locale layout
4. **Middleware redirects** only handle locale — no auth checks in middleware yet
5. **All client state is useState()** — no global state management (no Redux, Zustand, etc.)
6. **shadcn/ui components** in `components/ui/` — installed via `npx shadcn@latest add`