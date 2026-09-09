# Course Modules — Status

## ✅ Resolved (answers provided, cards moved to backlog)

| Card | Decision |
|---|---|
| **CD-002** | Single Text field `cpdRulesZh`/`cpdRulesEn`. Experiment, adjust later. |
| **CD-003** | Store in dictionary, unify with terms page. Not DB. |
| **CD-004** | Shared across courses. Dictionary keys for confirmation message (brochure link, email, WhatsApp). |
| **CD-005** | Fixed text in dict: "如需退款，請聯絡我們的職員。" Show in Step 4. |
| **CD-006** | `cpdHoursIa Decimal` per session. `cpdHours` kept but redefined as total attended hours (computed later). |
| **CD-007** | **CANCELLED** — no language split needed. |
| **CD-008** | `unitPrice` = HK$250/session. Price computed = unit × sessions. 10% off all 6 (EN-011 done). |
| **CD-009** | ScheduleTopic join table. Two separate Schedule records per date. |
| **CD-010** | **Option A** — each slot = separate Schedule record. No schema change. |
| **CD-011** | **Proposal sent** — layout draft in card, awaiting user review. |
| **CD-012** | Yes → `idDocType` on both User and Registrant models. |
| **EN-015** | Localhost test only, no staging deploy. |

## 🔴 Still Blocked

| Card | What's needed |
|---|---|
| **CD-001** | Certificate actual values (issuer name, title, per-course or global). Not yet answered. |



CD002: use one text field first. let's experiement it. will change later if it does not look good.
CD003: in dictionary. yes all terms should be in same source, including terms page
CD004: course shared. what are current hardcoded links?
CD005: fixed: refund must contact our staff directly
CD006: no one cpd hours is enough. use cpdHoursIa Decimal. and the cpdHours is calculated by the total number of hours the student attends
CD007: no need to split language. this is minor, no need a central language control
CD008: each session $250, and calcualte the total payment using unit * number. Additioally, if all 6 lessons are selected, give a 10% off discount
CD009: two schedule records, even in the same day
CD010: A
CD011: you decide first, i will update you later
CD012: yes id needed
EN015: no need to deploy, i will check on localhost first.


Now i have resolved the questions. you should mark and update the cards and design the implmentation plan for them one by one in the cards by updating the details. Do not implmenet them first.