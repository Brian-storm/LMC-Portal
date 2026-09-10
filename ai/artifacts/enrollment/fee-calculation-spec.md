# Enrollment Fee Calculation Spec

## Source of Truth

**`unitPrice`** is the sole source of truth for per-session pricing.  
**Never fall back to `course.price`** — `price` is the full-course total for display only and must not participate in fee computation.

## Files That Need `unitPrice`-Only Logic

| File | What to change |
|---|---|
| `src/components/enrollment/EnrollmentWizard.tsx:443` | Remove `|| course.price` fallback. Require `unitPrice` or treat as 0. |
| `src/app/api/enroll/route.ts:206` | Remove `?? course.price` fallback. Reject if `unitPrice` is missing. |
| Prisma schema `prisma/schema.prisma:110` | `unitPrice` is already `Decimal?` — consider making it required. |

## Fee Formula

```
subtotal  = unitPrice × selectedCount × registrantMultiplier
discount  = subtotal × 0.1  (only when isAllSelected === true)
total     = subtotal × (isAllSelected ? 0.9 : 1)
```

Where:
- `unitPrice` = per-session unit price (Decimal, from DB)
- `selectedCount` = number of schedule IDs the user checked
- `isAllSelected` = `selectedCount === totalActiveSchedules && totalActiveSchedules > 0`
- `registrantMultiplier` = `totalRegistrants` for ORGANIZATION, `1` for INDIVIDUAL

## ORGANIZATION Enrollment

- Each registrant pays the **full fee individually** — the total shown is `feePerPerson × registrantCount`.
- The enroller (organization) pays the sum of all registrants' fees.
- Server stores `feePerRegistrant` on each registrant record (no headcount division).

## Edge Cases

| Scenario | Expected Behavior |
|---|---|
| `unitPrice` is `null` in DB | API should return 400: "Course pricing not configured" |
| `selectedCount === 0` | Total should show `HK$ 0` formatted with `toLocaleString()`, not raw `unitPrice` string |
| Single-session course with no `unitPrice` | Reject — every course must have `unitPrice` set |

## UI Strings (dictionary keys)

All from `dict.summary.*`:
- `subtotal` → "Subtotal:"
- `discount` → "Bulk Discount (10%):"
- `totalFee` → "Total Fee:"
- `sessionsLabel` → "Sessions: X/Y"
- `registrants` → "Registrants:"

## Verification

1. Navigate to `/zh-hk/courses/cpd-102/enroll`
2. Select sessions — verify subtotal = `unitPrice × count`
3. Select ALL sessions — verify 10% discount appears
4. Deselect all — verify total shows `HK$ 0`
5. In Prisma, set `unitPrice = null` for a course — verify API returns 400 error