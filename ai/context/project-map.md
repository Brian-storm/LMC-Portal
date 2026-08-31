# Project Map — LMC Portal

> Last updated: 2026-08-31 | Built by: project-search

## What This Is

A CPD course management platform for financial/insurance professionals in Hong Kong. Institutional slate/emerald aesthetic (PEAK x CII HK style). Next.js 16 App Router frontend demo — all data is hardcoded mock data. No database, no auth, no backend integration yet.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.3.2 (App Router) |
| Language | TypeScript 5 (strict, noEmit) |
| Styling | Tailwind CSS v4 + shadcn/ui + tw-animate-css |
| Icons | lucide-react |
| Animation | framer-motion |
| Font | Montserrat (next/font), fallback: Arial/Helvetica/PingFang HK/Microsoft JhengHei |
| i18n | Dictionary-driven (en, zh-hk, zh-cn), `[locale]` dynamic routing |
| Lint | ESLint 9 + eslint-config-next |
| Quality gates | `npm run lint` + `npm run typecheck` |
| Deployment target | AWS Amplify (planned), currently Vercel dev |

## Directory Map

```
src/
  app/
    layout.tsx                          # Root layout: Montserrat font, Providers, Analytics
    globals.css                         # Tailwind v4 config, CSS vars, accessibility styles
    error.tsx                           # Global error boundary (stub)
    loading.tsx                         # Global loading state (stub)
    api/
      checkout/route.ts                 # Dummy handler (returns {message: "OK"})
      courses/route.ts                  # Dummy handler (returns {message: "OK"})
    context/
      AccessibilityContext.tsx          # Text size (md/lg/xl) + high-contrast mode context
    [locale]/
      page.tsx                          # Home page → HomePage component
      layout.tsx                        # Locale layout: Navbar + Footer + CookieConsent
      login/page.tsx                    # Mock login with role tabs (NO REAL AUTH)
      about/page.tsx                    # About page (hardcoded English, NO i18n)
      privacy/page.tsx                  # Privacy policy (hardcoded English, NO i18n)
      terms/page.tsx                    # Terms & conditions (hardcoded English, NO i18n)
      courses/
        page.tsx                        # Course catalog → CoursesView (2 mock courses)
        [slug]/page.tsx                 # Course detail → CourseDetailView (2 mock courses)
        [slug]/enroll/page.tsx          # 3-step enrollment wizard (hardcoded)
      checkout/
        confirmation/page.tsx           # Payment slip uploader
      (portal)/
        layout.tsx                      # Portal shell: sidebar, mock user, sign-out
        dashboard/
          page.tsx                      # Learner dashboard (mock data)
          enrolments/
            page.tsx                    # Placeholder "Under Development"
            [enrolmentId]/
              page.tsx                  # DUPLICATE of enrolments page
              confirmation/page.tsx     # Enrolment confirmation/receipt (mock)
      admin/
        page.tsx                        # Admin dashboard: KPIs, audit table (mock data)
        courses/page.tsx                # (Not checked — likely exists)
        enrolments/page.tsx             # Placeholder "Under Development"
      test/page.tsx                     # Style sandbox/testing page
      contact/                          # NOT YET CREATED
  components/
    Providers.tsx                       # Client Providers wrapper (AccessibilityProvider)
    HomePage.tsx                        # Home page composition (server component)
    Navbar.tsx                          # Main sticky navbar + mobile drawer
    Footer.tsx                          # 4-column footer with legal bar
    LanguageSwitcher.tsx                # EN/繁/簡 toggle, sets NEXT_LOCALE cookie
    AccessibilityMenu.tsx               # Text size + high-contrast dropdown
    CookieConsent.tsx                   # Floating consent banner (localStorage)
    CourseCard.tsx                      # Generic course card (⚠ links missing locale prefix)
    PaymentSlipUploader.tsx             # FPS proof upload component
    home/
      HeroCarousel.tsx                  # 3-slide auto-rotating hero (Unsplash images)
      CredentialsBar.tsx                # 3-column credential badges
      FeatureCards.tsx                  # 3-column feature CTAs
      NewsletterForm.tsx                # Mocked subscription form
    courses/
      types.ts                          # All course module TypeScript interfaces
      CoursesView.tsx                   # Catalog orchestrator (search/filter state)
      CourseList.tsx                    # Course listing + empty state
      CourseCard.tsx                    # HK statutory-style course card
      CourseHeader.tsx                  # Catalog page heading
      CourseFilters.tsx                 # Sidebar: keyword, category, CPD hours slider
      CourseDetailView.tsx              # Full course detail page + enrollment sidebar
      CourseSyllabus.tsx                # ⚠ DUPLICATE of CoursesView.tsx (bug)
    common/
      Breadcrumbs.tsx                   # Breadcrumb nav component
    ui/                                 # shadcn/ui components (button, card, badge, dialog, etc.)
  dictionaries/
    en.json                             # English UI strings (175 lines)
    zh-hk.json                          # Traditional Chinese UI strings
    zh-cn.json                          # Simplified Chinese UI strings
    types.ts                            # Dictionary type exports (NavDict, CourseViewDict, etc.)
    get-dictionary.ts                   # Server-only dictionary loader
  lib/
    utils.ts                            # cn() tailwind-merge utility
  middleware.ts                         # Locale redirect middleware (en/zh-hk/zh-cn)
```

## What's Real vs. Mock

| Component | Status |
|---|---|
| Course catalog + detail pages | ❌ Mock (2 hardcoded courses inline) |
| Course enrollment wizard | ❌ Mock (simulated API call, hardcoded redirect) |
| Admin dashboard | ❌ Mock (hardcoded stats, in-memory state) |
| Login page | ❌ Mock (simulated auth, sets cookie `session_token=demo_token_{role}`) |
| Portal/dashboard | ❌ Mock (hardcoded user/profile/enrolment data) |
| Payment slip uploader | ❌ Mock (fetch to nonexistent `/api/upload-slip`) |
| API routes (`api/courses`, `api/checkout`) | ❌ Dummy (return `{message: "OK"}`) |
| Navbar, Footer, Breadcrumbs | ✅ Real (fully functional) |
| i18n dictionary system | ✅ Real (`server-only` imports, dynamic locale) |
| Accessibility (text size, high contrast) | ✅ Real (context provider, CSS classes) |
| Language switcher | ✅ Real (cookie-based) |
| Cookie consent banner | ✅ Real (localStorage) |
| shadcn/ui component library | ✅ Real (button, card, badge, dialog, input, select, table, dropdown-menu) |
| About/Privacy/Terms pages | ⚠ Half-done (rendered but hardcoded English, no i18n) |

## Known Issues

1. **`CourseSyllabus.tsx`** is a near-duplicate of `CoursesView.tsx` — exports wrong component
2. **`enrolments/[enrolmentId]/page.tsx`** is a verbatim copy of `enrolments/page.tsx`
3. **About, Privacy, Terms pages** have hardcoded English — not using dictionary system
4. **Top-level `CourseCard.tsx`** links miss locale prefix (`/courses/` instead of `/en/courses/`)
5. **Contact page** doesn't exist yet
6. **No database, auth, S3, SES, or PDF generation** — all backend is pending
7. **alert() calls** for PDF downloads throughout dashboard pages