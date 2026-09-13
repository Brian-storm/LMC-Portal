# Schedule Ordering — Investigation Report

## Scope

Investigation into schedule ordering on two pages for course CPD26090103
(`http://localhost:3000/zh-hk/courses/CPD26090103`):
- Course Detail Page (課程詳情)
- Enrollment Page (報名頁面)

---

## Confirmed: API Layer Is Correct

Both API endpoints now apply compound ordering:

| Endpoint | File | Sort |
|---|---|---|
| `GET /api/courses` (list) | `route.ts:98` | `orderBy: [{ sessionDate: "asc" }, { dateAndTime: "asc" }]` |
| `GET /api/courses/[slug]` (detail) | `route.ts:44` | `orderBy: [{ sessionDate: "asc" }, { dateAndTime: "asc" }]` |

**Witnessed output** (`GET /api/courses/CPD26090103`):
```
1. 22/09/2026 14:15 - 15:45   → Module 5
2. 22/09/2026 16:00 - 17:30   → Module 1
3. 08/10/2026 14:00 - 15:30   → Module 3
4. 08/10/2026 15:45 - 17:15   → Module 4
5. 14/10/2026 14:15 - 15:45   → Module 2
6. 14/10/2026 16:00 - 17:30   → Module 6
```

Chronological order is correct (Sep 22 → Oct 8 → Oct 14, times ascending within each day).

**Caveat**: `sessionDate` is `DateTime?` (nullable). In the seed, `parseSessionDate()` sets time to `T00:00:00Z` (midnight), so same-day schedules rely on the secondary `dateAndTime` string sort. The string format `DD/MM/YYYY (weekday) HH:mm - HH:mm` sorts correctly within the same day because the date prefix is identical and comparison falls through to the time portion. If `sessionDate` were ever `NULL`, that record would sort to the top (SQL puts NULLs first in `ASC` order).

---

## Problem A: Course Detail Page — Schedule Display

### What shows

Schedules only appear **inside the Course Topics section**, grouped by module via `scheduleByModuleId` map (`CourseDetailView.tsx:48-57`).

Modules are rendered in `moduleNumber` order (1→6, from `syllabusItems orderBy: { sortOrder: "asc" }`). Since each CPD26090103 schedule links to exactly one module, the displayed dates jump around:

| Module | Schedule |
|---|---|
| 1 | 22/09 16:00 |
| 2 | 14/10 14:15 |
| 3 | 08/10 14:00 |
| 4 | 08/10 15:45 |
| 5 | 22/09 14:15 |
| 6 | 14/10 16:00 |

### What is missing

The dictionary defines `sections.scheduleAndLocation` ("Schedule & Location" / "上課日期及地點") but **no such section is rendered** in `CourseDetailView.tsx`. There is no flat chronological list of all schedules anywhere on the page.

### Root cause

`CourseDetailView.tsx` was designed to show schedules as sub-sections of syllabus modules rather than as an independent schedule list. The feature was either deprioritised or overlooked.

### Fix needed

Add a **Schedule & Location** section (between the Course Topics section and the sidebar, or as a new section in the left column) that renders `course.schedules` in their API-returned chronological order, showing dateAndTime, venue, instructor, and module reference.

---

## Problem B: Enrollment Page — Schedule Display

### What shows

`EnrollmentWizard.tsx:874` iterates `course.schedules.map((sch) => ...)` — a flat checkbox list preserving API chronological order. The API response is correct (verified above).

Each item shows the linked module title + sub-topics prominently, with dateAndTime as secondary info.

### What appears wrong

Module labels in the displayed order run: **Module 5 → Module 1 → Module 3 → Module 4 → Module 2 → Module 6** (non-sequential). To a user looking for module-number order, this looks like no order at all.

The same issue affects the summary section at line 1232, where selected schedules are filtered but preserve the same chronological array order.

### Root cause

The flat list is in correct chronological order, but module numbers appear non-sequential because each schedule links to a different module. There is no visual grouping or secondary label to indicate the chronological intent.

### Fix options

1. **No change needed** — if chronological order is the desired UX, this is already correct
2. **Add date-group headers** — show "22/09/2026", "08/10/2026", "14/10/2026" separators between schedules of different dates
3. **Add module-number label** — prefix each item with "Module X / 模塊X" so the non-sequential numbering is explained
4. **Client-side re-sort** — sort `course.schedules` once on mount as a safety net: `[...course.schedules].sort((a, b) => ...)`

---

## Summary

| Page | API order correct? | UI displays chronologically? | Fix status |
|---|---|---|---|
| Course Detail | ✅ | ✅ | Course Topics section now iterates `course.schedules` (API chronological order) instead of `course.syllabus` (module-number order). Removed `scheduleByModuleId` map. |
| Enrollment | ✅ | ✅ | Date-group separators added before each date group (including first). Separator shows `DD/MM/YYYY` between horizontal rules. |

## Files changed

- `src/app/api/courses/route.ts:98` — list API orderBy: `[{ sessionDate: "asc" }, { dateAndTime: "asc" }]`
- `src/app/api/courses/[slug]/route.ts:44` — detail API orderBy: `[{ sessionDate: "asc" }, { dateAndTime: "asc" }]`
- `src/lib/map-course.ts:28` — ApiCourse type (add `sessionDate`)
- `src/components/courses/CourseDetailView.tsx` — removed `scheduleByModuleId` map; Course Topics section now iterates `course.schedules` in chronological order, showing linked module info inline
- `src/components/enrollment/EnrollmentWizard.tsx` — added `import React`, date-prefix extraction, `isNewDateGroup` detection (fires for first schedule too), and date-group separator `<div>` before each date change
- `prisma/schema.prisma:196-214` — Schedule model (`sessionDate: DateTime?`)
- `prisma/seed.ts:12-22,328-337,576-610` — parseSessionDate + seed data for CPD26090103