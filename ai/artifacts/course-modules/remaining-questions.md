# Course Modules — Remaining Questions (Blocked Cards)

Cards below need your input before implementation. They are set to `blocked` in the kanban board.

---

## CD-001 — Certificate Fields

- `certificateIssuerZh` / `certificateIssuerEn` — actual value? (e.g. "香港中文大學醫院" / "CUHK Medical Centre")
- `certificateTitleZh` / `certificateTitleEn` — actual value? (e.g. "結業證書" / "Certificate of Completion")
- Is this per-course or global?

## CD-002 — CPD Rules Text

- Single `cpdRulesZh`/`cpdRulesEn` Text field, or split into multiple smaller fields?
- Are rules the same for all courses?

## CD-003 — Personal Data Notice

- Store in DB (course-specific) or dictionary (global)?
- Should the terms page source also come from here?

## CD-004 — Confirmation Message

- Course-specific or shared across all courses?
- Currently hardcoded in `PaymentSlipUploader` — move to DB?

## CD-005 — Refund Policy

- Course-specific or fixed text?
- Which wizard step should display it? (Step 3 declaration area? Step 4 payment area?)

## CD-006 — Dual CPD Hours

- Storage preference: replace `cpdHours Int` with `cpdHoursIa Decimal` + `cpdHoursMpfa Decimal?` ?
- Is `cpdHours` per-session or per-course total?

## CD-007 — Language Granularity

- `instructionLanguage`, `noteLanguage`, `qaLanguage` — all courses share same settings?
- Do dictionary `languageValues` keys need updates?

## CD-008 — unitPrice

- Keep `price` as manually entered total, or compute from `unitPrice × totalSessions`?
- Where does `totalSessions` come from? (`course.schedules.length`?)

## CD-009 — ScheduleTopic

- How to represent same date with two time slots (14:15-15:45 and 16:00-17:30)?
- Two separate Schedule records, or date + timeStart + timeEnd?

## CD-010 — Schedule Structure

- Option A: each slot = separate Schedule record
- Option B: split `dateAndTime` into `date` + `timeStart` + `timeEnd`
- Which one?

## CD-011 — CourseDetailView Display

- Where exactly on the detail page should each new field appear?
- Any layout mockup or reference?

## CD-012 — idDocType Enum

- Does `Registrant` model also need `idDocType` field?
- Should guest users have it too?

## EN-015 — E2E Integration

- Deploy to staging for manual testing?
- After CD-012 is resolved, need to verify: idDocType persistence, multi-schedule enrollment flow, discount calculation