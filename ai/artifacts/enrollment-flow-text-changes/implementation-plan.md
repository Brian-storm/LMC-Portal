# Implementation Plan: Enrollment Flow Text & Display Changes

## Architecture Notes

### Change summary (MECE)

| # | Change | Scope | Files |
|---|--------|-------|-------|
| 1 | Remove module numbering from summary sidebar topic labels | Summary sidebar only | `EnrollmentWizard.tsx` |
| 2 | Add instructor info to schedule cards in Step 2 | Schedule card rendering + CourseData interface | `EnrollmentWizard.tsx` |
| 3 | Ascending order by time | ✅ Already done | — |
| 4 | Replace summary `invoiceNotice` with "完成課程後將發出出席證書。" | Dictionary texts + summary rendering | All 3 dictionary files, `EnrollmentWizard.tsx` |
| 5 | Show immediate receipt+certificate notice in both summary sidebar and confirmation page | Two locations | All 3 dictionary files (new keys), `EnrollmentWizard.tsx`, `PaymentSlipUploader.tsx` |
| 6 | Change validation message: 時段→主題 | Dictionary only | All 3 dictionary files |

### Data contract — CourseData schedule type

Current interface lacks `instructor`:

```typescript
// Current (EnrollmentWizard.tsx:38-55)
schedules: {
  id: string;
  dateAndTime: string;
  venue: string;
  quotaRemaining: number;
  topics: { syllabusItem: SyllabusModule }[];
}[];
```

Need to add `instructor`:

```typescript
schedules: {
  id: string;
  dateAndTime: string;
  venue: string;
  quotaRemaining: number;
  // NEW
  instructor?: { name: string; title: string; bio: string };
  topics: { syllabusItem: SyllabusModule }[];
}[];
```

This requires the API (`/api/courses/${slug}`) to already include instructor data on each schedule. If not, the rendering will silently show nothing — safe to merge.

### Dictionary key changes

| Key | Action |
|-----|--------|
| `enrollPage.step2.selectAtLeastOne` | Edit text (時段→主題) |
| `enrollPage.summary.invoiceNotice` | Edit text (#4 replacement) |
| `enrollPage.summary.receiptAndCertNotice` | **New key** (#5 for summary sidebar) |
| `enrollPage.confirmation.receiptNotice` | Edit text (#5 for confirmation page) |

### Risk level: Low
All changes are in presentation layer (dictionary texts + component rendering). No API, DB, or migration changes. If the API doesn't return instructor data yet, the instructor section simply won't render (safe null check).

---

## Task Cards

### Card 1: Update dictionary texts (3 files)

**Scope:** Pure dictionary edits — no component changes.

| Key | en | zh-hk | zh-cn |
|-----|----|-------|-------|
| `step2.selectAtLeastOne` | `"Please select at least one topic to continue."` | `"請選擇至少一個主題以繼續。"` | `"请选择至少一个主题以继续。"` |
| `summary.invoiceNotice` | `"Certificate of Attendance will be issued upon course completion."` | `"完成課程後將發出出席證書。"` | `"完成课程后将发出出席证书。"` |
| `summary.receiptAndCertNotice` (NEW) | `"Official Tax Invoice & Attendance Certificate issued immediately upon course completion."` | `"完成課程後將即時發出正式收據及出席證書。"` | `"完成课程后将即时发出正式收据及出席证书。"` |
| `confirmation.receiptNotice` | `"Official Tax Invoice & Attendance Certificate issued immediately upon course completion."` | `"完成課程後將即時發出正式收據及出席證書。"` | `"完成课程后将即时发出正式收据及出席证书。"` |

**Verification:** `npm run typecheck` passes.

---

### Card 2: Remove numbering from summary sidebar topic labels

**File:** `src/components/enrollment/EnrollmentWizard.tsx`

**Location:** Lines 1249-1254 (summary sidebar schedule item rendering)

**Change:** Remove module number prefix. Instead of:

```typescript
const topicAbbr = si
  ? (locale === "en"
    ? `Topic ${si.moduleNumber}`
    : si.titleZh)
  : "";
```

Use just the title (or a concise abbreviation):

```typescript
const topicAbbr = si
  ? (locale === "en" ? si.titleEn : si.titleZh)
  : "";
```

**Verification:** Summary sidebar shows topic names without "Topic 1", "Topic 2", etc.

---

### Card 3: Add instructor info to schedule cards (Step 2)

**File:** `src/components/enrollment/EnrollmentWizard.tsx`

**Changes:**

1. **CourseData interface** (lines 38-55): Add `instructor?: { name: string; title: string; bio: string }` to schedule type.

2. **Schedule card rendering** (around lines 947-957, before the schedule info section): Add instructor display block, following the same visual pattern as `CourseDetailView.tsx` (lines ~209-235):
   - `User` icon + "講師/Instructor" label
   - Instructor name (bold)
   - Instructor title (if present)
   - Instructor bio (if present, in smaller text)

**Verification:** Schedule cards in Step 2 show instructor name/title/bio when data is available; gracefully hide when absent.

---

### Card 4: Update summary sidebar with both certificate messages

**File:** `src/components/enrollment/EnrollmentWizard.tsx`

**Location:** Lines 1310-1317 (the bottom info section of the summary sidebar)

**Changes:**

1. Replace the current `invoiceNotice` rendering with the new text from #4 (already done in Card 1's dictionary edit).
2. Add a **second info line** below the first using the new `summary.receiptAndCertNotice` key (already added in Card 1).

The ShieldCheck section becomes two lines:

```tsx
<div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1.5">
  {/* Line 1: Attendance certificate notice (#4) */}
  <div className="flex items-start space-x-1.5">
    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
    <span>{dict.summary.invoiceNotice}</span>
  </div>
  {/* Line 2: Receipt + certificate notice (#5) */}
  <div className="flex items-start space-x-1.5">
    <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
    <span>{dict.summary.receiptAndCertNotice}</span>
  </div>
</div>
```

**Verification:** Summary sidebar shows both certificate messages below the total fee.

---

### Card 5: Update confirmation page text

**File:** `src/components/PaymentSlipUploader.tsx`

**Location:** Line 180: `{confirmationDict.receiptNotice}`

**Change:** No code change needed — the `confirmationDict.receiptNotice` key is already rendered. The dictionary update from Card 1 will automatically update this text.

**Verification:** Confirmation page shows "委託課程後將即時發出正式收據及出席證書" instead of "電子收據將於 5 個工作天內發送至您的電郵" for zh-hk.

---

## Verification Plan

1. `npm run typecheck` — confirm no type errors
2. `npm run lint` — confirm no lint errors
3. `npm run build` — confirm production build succeeds
4. Manual visual check of each locale (en, zh-hk, zh-cn) on:
   - Step 2 schedule cards (instructor info visible when available)
   - Summary sidebar (no numbering, two certificate notices)
   - Confirmation page (updated receipt notice)
   - Validation error (shows "主題" not "時段")

## Dependency Graph

```
Card 1 (Dictionary edits) ──┬── Card 4 (Summary sidebar messages) 
                            └── Card 5 (Confirmation page) ── no code change needed
Card 2 (Remove numbering) ── independent of Card 1
Card 3 (Instructor info) ── independent of Card 1
```

Cards 1-3 are independent and can be done in any order. Card 4 and 5 depend on Card 1's dictionary keys being present.