# Course Detail Page — Hardcoded Strings Audit

## Files scoped

- `src/components/courses/CourseDetailView.tsx`
- `src/app/[locale]/courses/[slug]/page.tsx`
- `src/lib/map-course-detail.ts`

---

## A. Organizer fallbacks (`CourseDetailView.tsx:86-87`)

| Line | String | Should come from |
|---|---|---|
| 86 | `LMC Management Consultancy Ltd. (德智管理顧問有限公司)` | `course.organizer` only (remove fallback) |
| 87 | `香港中文大學醫院 (CUHK Medical Centre)` | `course.coOrganizer` only (remove fallback) |

---

## B. Subtitle under course title (`CourseDetailView.tsx:162-166`)

| Line | String | Should come from |
|---|---|---|
| 163 | `Continuing Professional Development (CPD) for Licensed Insurance Intermediaries` | `dict.titleSubtitle` (new key needed) |
| 165 | `保险中介人持续专业培训计划` | `dict.titleSubtitle` (new key needed) |
| 166 | `保險中介人持續專業培訓計劃` | `dict.titleSubtitle` (new key needed) |

---

## C. Hardcoded venue / dates / hours / fee structure in Details table (`CourseDetailView.tsx:277-292`)

These are **course-specific values** under dict-driven labels (`dict.venue`, `dict.courseDates`, etc.).

| Line | String | Should come from |
|---|---|---|
| 277 | `香港新界沙田澤祥街9號 香港中文大學醫院9樓` | `course.venue` (new `DetailedCourse` field) |
| 281 | `9月22日、10月8日、10月14日下午（具體安排，後續公佈）` | `course.datesText` (new field) |
| 285 | `每個主題課程時數為 1.5 個小時，共 9 個小時` | `course.hoursText` (new field) or dict |
| 290 | `共 6 個主題` | `course.feeStructureLines` (new array field) + dict template with interpolation |
| 291 | `• 單個主題：HKD 250元 / 1.5 CPD 時數` | same as above |
| 292 | `• 一次過報讀 6 個主題優惠價：HKD 1,350元` | same as above |

---

## D. Hardcoded CPD hour lines in Certificates section (`CourseDetailView.tsx:369, 379`)

| Line | String | Should come from |
|---|---|---|
| 369 | `1.5 IA / MPFA Non-core CPD Hours` | `course.cpdHoursIa` + dict phrase pattern |
| 379 | `9 IA / MPFA Non-core CPD Hours` | `course.cpdHours` + dict phrase pattern |

---

## E. Inline acronyms / currency literals

| Line | String | Should come from |
|---|---|---|
| 151 | `"IA"` in `{course.cpdHoursIa} IA {dict.hours}{dict.perSession}` | `dict.iaShort` (new key) |
| 323 | `"HKD"` in `{dict.unitPrice} HKD {number}` | `dict.currency` (new key) |

---

## F. `map-course-detail.ts:194` — Fee string builder

| Line | String | Verdict |
|---|---|---|
| 194 | `fee: c.price === 0 ? "Free" : \`HKD ${...}\`` | Uses `"Free"` literal and `"HKD"` prefix. `"Free"` should reference `dict.free` (which already exists in courseView), but the mapper runs server-side. A locale-aware helper is needed. |

---

## G. `CourseDetailView.tsx:86-87` — Additional notes

The `||` fallback means these display even when the API returns `null` for organizer/coOrganizer. The mapper (`map-course-detail.ts`) already passes through `organizerZh/En`, so these fallbacks mask missing data.

---

## Summary of root cause

The Details table **labels** are dict-driven, but the **values** are hardcoded because `DetailedCourse` lacks fields for `venue`, `datesText`, `hoursText`, and `feeStructureLines`. The API presumably has this data (or it could be derived from `schedules` and `syllabus`), but the mapper never surfaces it, forcing inline hardcoding.

## Remediation priority

1. **High** — Inline venue/dates/hours/fee values (lines 277-292): these are course-specific content that break on every course except cpd-102
2. **High** — CPD hour lines (lines 369, 379): hardcoded values for this specific course
3. **Medium** — Subtitle (lines 162-166): purely cosmetic but blocks i18n
4. **Low** — Organizer fallbacks (lines 86-87), IA/HKD literals (lines 151, 323)