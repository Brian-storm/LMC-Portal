# Feature Spec: Enrollment Wizard Schedule Card UI Improvement

## Problem

The schedule card UI in Step 2 of the enrollment wizard has three pain points:

1. **Venue shown in enrollment context** — the user is selecting a topic/session, not a location; venue information is irrelevant and adds clutter.
2. **Duration lacks i18n** — the raw numeric value (e.g. `"1.5"`) is displayed without a localized unit label (`"hours"` / `"小時"` / `"学时"`).
3. **General UI quality** — the card is visually busy: redundant icons, deep indentation, semantically awkward `<button>` with a read-only checkbox, and cramped font sizes.

## Users

- Enrolling students/staff who need to quickly scan available sessions and select one or more.
- Admins who want a clear, professional enrollment UI.

## Goals

1. Remove venue entirely from schedule cards in Step 2.
2. Show duration with the proper localized unit label (e.g., `"1.5 hours"`, `"1.5 小時"`, `"1.5 学时"`).
3. Show instructor info per schedule (matching CourseDetailView pattern: `User` icon + `"講師/Instructor"` label + name + title).
4. Increase all font sizes in the schedule card by one step (target: body text `text-sm`, labels `text-xs`, secondary `text-[11px]`).
5. Clean up the card layout: remove redundant nested `ml-5`, consolidate icons, simplify the DOM structure.

## Non-Goals

- Do not change the overall card layout (checkbox + content area + full badge remain).
- Do not change the date-group separator pattern.
- Do not touch other steps (Step 1, 3, 4) or the summary sidebar.
- Do not change the `CourseData` API shape.

## Functional Requirements

### 1. Remove venue
- **FR1.1**: The `MapPin` icon and `sch.venue` line must not appear inside schedule cards.
- **FR1.2**: The venue data remains in the API response; it is simply not rendered.

### 2. Duration with i18n unit
- **FR2.1**: A new dictionary key `step2.durationUnit` is added to `enrollPage` in all three locale files.
  - `en`: `"hours"`
  - `zh-hk`: `"小時"`
  - `zh-cn`: `"学时"`
- **FR2.2**: Duration renders as `{syllabusItem.duration} {dict.step2.durationUnit}` (e.g. `"1.5 hours"`).
- **FR2.3**: The existing standalone `Clock` icon + duration in the topic header (lines 933-935) is replaced by this i18n version.

### 3. Instructor info
- **FR3.1**: When `sch.instructor` is present, render it below the date+time line, following the same visual pattern as `CourseDetailView.tsx` (lines 209-234): `User` icon, `"講師/Instructor"` label, bold name, optional title on next line, optional bio in smaller text.
- **FR3.2**: When `sch.instructor` is absent, render nothing (no empty placeholder).

### 4. Larger font sizes
- **FR4.1**: Bump all schedule card text by one step:
  - Topic title: `text-xs` → `text-sm`
  - Duration/topics: `text-[11px]` → `text-xs`
  - Schedule info (date/time): `text-xs` → `text-sm`
  - Instructor lines: `text-[11px]` → `text-xs`, bio `text-[10px]` → `text-[11px]`
  - Full badge: keep at `text-[10px]`

### 5. Layout cleanup
- **FR5.1**: Remove duplicate `Clock` icon — keep it only in the schedule info section (date/time line), not in the duration line.
- **FR5.2**: Remove the redundant `ml-5` wrapper around the topic content area — use a single consistent padding structure.
- **FR5.3**: Keep the checkbox as a controlled input; ensure `pointer-events-none` + `readOnly` pattern is preserved (this is a safe pattern for button-click toggles).

## UI Screens

One screen: **Step 2 schedule card** (repeat per schedule).

Current layout (simplified):
```
[checkbox]  [BookOpen icon] Topic Title
                [Clock] 1.5
                • Subtopic 1
                • Subtopic 2

            [Clock] 10/11/2026 09:00-12:00
            [MapPin] Venue Name       ← REMOVE
```

Target layout:
```
[checkbox]  [BookOpen icon] Topic Title
                1.5 hours
                • Subtopic 1
                • Subtopic 2

            [Calendar] 10/11/2026 09:00-12:00
            [User] Instructor: Name — Title
                   Bio text
```

## Data & API Assumptions

- `sch.instructor?: { name: string; title: string; bio: string }` — already in the interface from the previous implementation.
- No API changes needed.
- `syllabusItem.duration` is always a string like `"1.5"` — safe to concatenate with `durationUnit`.

## Security & Privacy Notes

- No PII changes — instructor data is already public course metadata.

## Acceptance Criteria

1. Venue does not appear in any schedule card in Step 2.
2. Duration reads `"1.5 hours"` / `"1.5 小時"` / `"1.5 学时"` depending on locale.
3. Instructor name/title/bio appears when API provides the field; hidden otherwise.
4. Font sizes are visibly larger than current (one step up).
5. The card layout is less cramped — no double `Clock` icons, no double `ml-5` indentation.
6. TypeScript compiles cleanly (`npm run typecheck`).

## Verification Plan

1. `npm run typecheck` — no type errors.
2. `npm run lint` — no lint errors (pre-existing warnings excluded).
3. `npm run build` — production build succeeds.
4. Manual visual check on Step 2 for en, zh-hk, zh-cn:
   - Venue absent
   - Duration shows localized unit
   - Instructor renders when mocked in API
   - Font sizes are noticeably larger