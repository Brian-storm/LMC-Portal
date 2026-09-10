# Admin Enrolments — Group View Redesign (V2)

## Background

For ORGANIZATION enrollment, the enroller (organization representative) is **not a registrant**.
The enroll API creates N registrant rows for the N group members, but the enroller has
**no registrant row** — they exist only as `enrollerUserId` on each member row.

The current admin enrolments page incorrectly:
- Treats the first registrant as the "enroller" parent (there is no enroller registrant row)
- Shows the first registrant's personal name as the parent
- Sums fees excluding the enroller's own (works by accident, but for wrong reasons)

## Requirements

1. **Parent row = Organization** — show the organization name (from `User.organization`), not a person's name.
2. **Registrants count = `members.length`** — enroller has no registrant row, so count = number of member rows.
3. **Total fee = sum of all members' individual fees** — no enroller fee to include.
4. **Warning text** — tell the admin that the organization row represents the paying enroller, not a registrant.
5. **Member rows** — show each registrant's credentials (name, ID doc, IA license, email) + individual fee.
6. **Fee column padding** — member fees must be right-aligned consistently with parent fee.

## Data Model

```
User (enroller)            User (registrant 1)   User (registrant 2)
  id: "user-1"               id: "user-2"           id: "user-3"
  organization: "ABC Ltd."   nameEn: "John Doe"     nameEn: "Jane Smith"
  nameEn: "Org Rep"          idDocNumber: "A123"     idDocNumber: "B456"

Registrant (N rows, NO row for enroller)
  ┌──────────────────────────────────────────────────────────────┐
  │ id: "reg-1"      userId: "user-2"   enrollerUserId: "user-1"│
  │ id: "reg-2"      userId: "user-3"   enrollerUserId: "user-1"│
  └──────────────────────────────────────────────────────────────┘
```

## Files to Change

### 1. `src/app/api/admin/enrolments/route.ts`

**What changes:**

After grouping registrants by `groupId`, fetch enroller org info from the `User` table:

```ts
// Gather unique enroller user IDs from the group members
const enrollerUserIds = [...new Set(groupRows.filter(r => r.enrollerUserId).map(r => r.enrollerUserId!))];
// Fetch enroller user records to get organization name
const enrollers = enrollerUserIds.length > 0
  ? await prisma.user.findMany({
      where: { id: { in: enrollerUserIds } },
      select: { id: true, organization: true, nameEn: true, nameZh: true },
    })
  : [];
const enrollerOrgMap = new Map(enrollers.map(e => [e.id, e]));
```

**New parent row shape for ORGANIZATION:**

```ts
{
  id: groupId,                            // synthetic — groupId as identifier
  enrollmentType: "ORGANIZATION",
  groupId: string,
  registrantCount: members.length,        // enroller NOT counted
  paymentStatus,                          // from first member (all share same status)
  paymentMethod,                          // from first member
  fee: members.reduce(...),               // TOTAL = sum of members' individual fees
  isThirdPartyPay,                        // from first member
  payerFullName,                          // from first member
  paymentProofUrl,                        // from first member
  receiptNumber,                          // from first member
  submittedAt,                            // from first member
  course,                                 // from first member (same for all)
  user: {                                 // ENROLLER user info (for org name)
    id: enrollerUserId,
    organization: enrollerOrg.organization,  // "ABC Ltd." — the org name
    nameEn: enrollerOrg.nameEn,              // fallback if org is null
    nameZh: enrollerOrg.nameZh,              // fallback if org is null
  },
  members: [{                              // ALL registrant rows
    id, fee, user: { name, idDocNumber, iaLicense, email, organization }
  }],
}
```

**Key fixes:**
- `registrantCount` = `members.length` (not `members.length + 1`)
- `fee` = sum of `members[].fee` (not enroller's non-existent fee)
- `user` on parent = enroller's user record (has `organization` field)
- No `user.idDocNumber`, `user.iaLicense` on parent — those are registrant-only

**For INDIVIDUAL:** no change — stays flat.

### 2. `src/app/[locale]/admin/enrolments/page.tsx`

**Parent row for ORGANIZATION:**

| Column | Before | After |
|---|---|---|
| Enrollee | Enroller's personal name + IA/ID doc | **Organization name** in bold, with `Users` icon. Sub-line shows `"Enroller: <email>"` |
| ID Doc | Enroller's ID doc number | **Empty** — enroller is not registrant |
| Fee | Enroller's individual fee (wrong) | **Total** = sum of all members' fees, in `text-primary` |
| Registrants | Count includes enroller | Count = `members.length` |

**Warning text:**
- Replace the "Registrants" column content for ORGANIZATION rows with something like:
  `<span class="font-bold">{members.length}</span>` + a small muted note `"(by enroller)"`

Actually, the user said "add a warning in frontend to tell them enroller is not counted towards registrants". Best place:
- Add a subtle note below the "Registrants" column header: `"(excl. enroller)"` or a tooltip
- Or in the parent row, below the registrants count, add a `text-[10px] text-slate-400` note: `"Enroller: <org email>"`

**Member rows — fee column padding:**
- Current: `<td className="py-2 px-3 whitespace-nowrap">`
- Fix: change to match parent's fee column: `whitespace-nowrap text-right` or remove `text-right` but ensure consistent alignment.

Since other columns on member rows are empty, the fee column needs to be in the same position as the parent's fee column. Use `colSpan` to ensure alignment:
- Member row first `td` has `colSpan={2}` for name + ID doc
- Then empty `<td/>` for Course, Type, Registrants, Payment
- Then `<td className="py-2 px-3 whitespace-nowrap text-right">` for fee (matches parent Fee column alignment)

### 3. `tools/kanban/cards/AD-002.json`

- Reset `stage` from `"done"` to `"backlog"`
- Link to this new plan

## Verification

1. Admin enrolments page loads — ORGANIZATION rows show **organization name** as parent
2. Fee column on parent = **total** = sum of members' fees, in primary color
3. Registrants column = `members.length` (not including enroller)
4. Member rows show individual name, ID doc, IA license, email, individual fee
5. Member fee column is right-aligned, matching parent fee column
6. Approve/Reject on parent row batch-updates all members via `groupId`
