# Admin Enrolments — Group View Plan

## Problem

The admin enrolments table lists every `Registrant` as a flat row. For ORGANIZATION
enrollments with N registrants, N identical rows appear — each with its own
Approve/Reject buttons. The admin cannot see:

1. Who is the **enroller** (the person who paid)?
2. Which registrants belong to which group?
3. What is the **total fee** for the entire group?

## Requirements

- **Enroller row** shows the **total fee** = sum of all members' individual fees.
- **Under each group**, expanded registrant rows show **each registrant's
  credentials** (name, ID doc, IA license, organization, email).
- **Each registrant** has their own **individual fee** displayed.
- **Actions** (Approve/Reject) apply to the **entire group** at once.

## Data Model (already in schema)

```
Registrant {
  id              String
  courseId        String
  userId          String
  enrollmentType  EnrollmentType       // INDIVIDUAL | ORGANIZATION
  groupId         String?              // shared for all members of a group
  enrollerUserId  String?              // the user who submitted the enrolment
  fee             Decimal?
  paymentStatus   PaymentStatus
  paymentMethod   PaymentMethod?
  ...
  user            User @relation
  course          Course @relation
}
```

The **enroller** is the registrant whose `enrollerUserId` is NULL or equals their
own `userId` (the primary contact who filled out the form).

## Proposed Changes

### API: `src/app/api/admin/enrolments/route.ts`

| Aspect | Current | Proposed |
|---|---|---|
| Query | Flat `registrant.findMany()` — one row per registrant | Group by `groupId` for ORGANIZATION rows. Return enroller as parent + `members[]` children. |
| Pagination | Counts every registrant | Count **distinct enrollers** (or distinct groups). A group of 10 = 1 item. |
| Sorting | `submittedAt DESC` | Sort by enroller's `submittedAt` |
| Return shape | Flat `Enrolment[]` | `EnrolmentRow[]` with optional `members` |

**New return type:**

```ts
interface EnrolmentRow {
  id: string;                // enroller's registrant ID
  enrollmentType: "INDIVIDUAL" | "ORGANIZATION";
  groupId: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  fee: number | null;        // enroller's fee (= total for group)
  isThirdPartyPay: boolean;
  payerFullName: string | null;
  paymentProofUrl: string | null;
  receiptNumber: string | null;
  submittedAt: string;
  user: EnrolmentUser;       // enroller user
  course: EnrolmentCourse;
  registrantCount: number;
  members: {                 // only for ORGANIZATION
    id: string;
    user: EnrolmentUser;     // includes name, idDocNumber, iaLicense, email, organization
    fee: number | null;      // individual fee for this member
  }[];
}
```

**Query strategy:**
1. Fetch all registrants with their user + course data (current query).
2. Group by `groupId` on the server:
   - For each group, the registrant where `enrollerUserId IS NULL` (or
     `user.id === enrollerUserId`) is the **enroller** parent row.
   - All other registrants with the same `groupId` become `members[]`.
3. `fee` on the enroller = sum of `members[].fee`.
4. INDIVIDUAL rows stay flat (no `members`).

### API: `src/app/api/admin/enrolments/[id]/route.ts`

- Extend PATCH to accept `groupId` as an alternative to `id`.
- When `groupId` is provided, update `paymentStatus` for **all** registrants
  with that `groupId`.

### Frontend: `src/app/[locale]/admin/enrolments/page.tsx`

**Table rendering for ORGANIZATION:**

```
┌──────────┬──────────┬────────┬──────┬─────────────┬──────────┬──────────────┬────────┬──────────┬──────────┐
│ Enrollee           │ Course  │ Type  │ Registrants │ Payment  │ Fee (total)  │ Status │ Submitted │ Actions  │
├──────────┴──────────┴────────┴──────┴─────────────┴──────────┴──────────────┴────────┴──────────┴──────────┤
│ Enroller Name                                                      HK$2,700.00  Pending               [Approve]│
│   ├─ Registrant 1  (HKID: A123456(3), IA: LMC/1234)    HK$900.00                                           │
│   ├─ Registrant 2  (Passport: AB123456)                  HK$900.00                                           │
│   └─ Registrant 3  (HKID: B789012(4))                    HK$900.00                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Enroller row**: bold parent row with full credentials shown inline.
- **Member rows**: indented children with `├─` / `└─` prefix.
  - Show: name, ID doc number, IA license, email/organization.
  - Show individual fee.
  - No action buttons — actions are on the parent row only.
- **Fee column on parent**: shows **total** = sum of all members' fees, bold.
- **Actions**: Approve/Reject on the parent row updates the entire group.

### Fee Display

- Enroller row `fee` = `HK${members.reduce((sum, m) => sum + m.fee, 0).toLocaleString(...)}`
- Member rows show their individual `fee` as stored in the DB.
- The member fee column should be narrower / secondary styling to distinguish
  from the parent total.

### Approve/Reject Logic

Current flow:
- PATCH `/api/admin/enrolments/[id]` with `{ action: "approve" | "reject" }`
- Updates single registrant by `id`.

New flow for groups:
- PATCH `/api/admin/enrolments/[enrollerId]` with `{ action: "approve" | "reject", groupId: "..." }`
- Server finds **all** registrants with matching `groupId` and updates them in a
  transaction.
- For INDIVIDUAL: single update (no change).

## Files to Change

| File | Change |
|---|---|
| `src/app/api/admin/enrolments/route.ts` | Rewrite to group by `groupId`, return enroller + `members[]`. Update pagination to count enrollers. |
| `src/app/api/admin/enrolments/[id]/route.ts` | Accept `groupId` in PATCH body to batch-update all group members. |
| `src/app/[locale]/admin/enrolments/page.tsx` | Render parent+children rows. Show total fee. Remove individual action buttons for members. |

## Open Questions

1. **Status filter**: Should filtering by `PENDING_VERIFICATION` show groups where the enroller is pending, or where any member is pending? (Proposed: enroller's status is the group status.)
2. **Duplicate detection**: Currently checks `idDocNumber` across all registrants. After grouping, should duplicates be flagged across group members only?
3. **Sorting by registrant count**: After grouping, sorting by registrant count may be useful — out of scope for now.
