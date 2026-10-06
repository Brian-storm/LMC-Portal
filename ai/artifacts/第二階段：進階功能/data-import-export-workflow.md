# Data Import and Export Workflow

**Audience:** developers and reviewers of the admin data import/export features
**Status snapshot:** 2026-10-07
**Scope:** shared CSV/XLSX utilities, student roster import, enrolment/payment exports, and planned course export.

## 1. Architecture at a glance

The workflow has three layers:

1. **Shared format utilities (AF-019):** serialize typed records as CSV/XLSX and parse uploaded files into either typed records or raw indexed tables.
2. **Feature APIs:** project database records for exports; parse, map, and validate files for student import.
3. **Admin UI:** initiates downloads or manages the four-step roster import while keeping the selected file and mapping in the browser.

```text
EXPORT
Admin page → GET /api/admin/{enrolments|payments}/export
           → ADMIN authorization → Prisma query/filter
           → reporting projection → exportCsv/exportExcel
           → Content-Disposition attachment → browser download

STUDENT IMPORT
Admin selects File → POST preview (file only; inspect)
                   → raw indexed table + sample + suggestions
                   → admin maps source indexes to User fields
                   → POST preview (same File + mapping; validate all rows)
                   → review capped rows + full error list
                   → POST confirm (same File + mapping; reparse/revalidate)
                   → serializable User-creation transaction
                   → all-batch result
```

The import has no server-side preview session or `importId`. The browser retains the `File` and re-uploads it for mapped preview and confirmation. The server treats each request as independent and does not trust rows or validation state supplied by the browser.

## 2. Shared CSV/XLSX library

### Export contract

`src/lib/data/types.ts` defines `ExportColumn<T>`: a record key, displayed header, optional Excel width, and optional Excel number format. Feature routes provide ordered column definitions and a normalized array of output rows.

- `exportCsv` in `src/lib/data/csv.ts` emits UTF-8 CSV with a BOM and quotes fields containing commas, quotes, or newlines.
- `exportExcel` in `src/lib/data/excel.ts` creates an ExcelJS workbook, worksheet, header row, widths, optional number formats, and an auto-filter.
- `downloadCsvResponse` / `downloadExcelResponse` use the shared response helper in `types.ts` to set MIME type, `Content-Disposition`, and content length.

### Import contracts

There are two parser styles:

- **Typed convenience import:** `parseCsv` / `parseExcel` match a caller-supplied `ExportColumn[]` against known headers. This remains useful when the input template is fixed.
- **Raw-table import:** `parseCsvTable` / `parseExcelTable` return `ImportTableResult` before feature-specific mapping. An `ImportTable` contains `columns: { index, header }[]` and `rows: { rowNumber, values }[]`.

Raw source indexes are zero-based and stable even when two columns share the same header. Source row numbers are one-based physical row numbers, so validation errors can identify the row in the uploaded file. Blank rows are omitted without renumbering later rows. Only the first nonblank row is considered the header candidate; the parser does not guess past a preamble.

The roster API uses the default XLSX sheet index (`0`, the first worksheet); the current wizard does not offer worksheet selection.

## 3. Student roster import (AF-021)

### Browser/API stages

| Stage | Request | Response/UI behavior |
|---|---|---|
| Inspect | `POST /api/admin/import/registrants/preview`, multipart `file` only | `sourceColumns`, up to 3 sample rows, unique exact-match `suggestedMapping`, `totalRows`. |
| Map | Browser-controlled `SourceColumnMapping[]`, each `{ sourceIndex, targetField }` | `RegistrantColumnMapper` shows source indexes as spreadsheet letters; duplicate headers remain distinguishable. |
| Mapped preview | Same preview route, multipart `file` + JSON `mapping` | Server validates the mapping and every row; response includes counts, first 20 mapped rows, and all row errors. No rows are written. |
| Confirm | `POST /api/admin/import/registrants/confirm`, multipart `file` + JSON `mapping` | Server reparses and revalidates, then creates the complete User batch atomically. Returns success or a full-batch failure. |

The mapping helper in `src/lib/data/import/mapping.ts` auto-suggests only unique exact matches after trimming and ignoring case. It does not fuzzy-match; an ambiguous duplicate header is left for manual selection. The server independently checks that source indexes exist, targets are allowed, neither source nor target is reused, and all required targets are assigned.

### Student-field validation and writes

`src/lib/data/import/registrants.ts` owns the business mapping and validation. The required destinations are Chinese name, English name, email, phone, and ID document number. ID type, IA license, and organization are optional. Validation checks required values, email and phone formats, document type/HKID format, and duplicate email/document/license values against both the database and the uploaded batch.

`User` is the identity/profile source of truth. Confirmation creates new `STUDENT` User rows; it does not create Registrant rows or overwrite existing users. `createUsersAtomically` repeats identity checks inside a serializable Prisma transaction. Any conflict aborts the complete transaction, and the confirm route returns zero imported records rather than partial success.

### Limits and privacy boundaries

- Both import POST routes require an authenticated `ADMIN` and a same-origin request.
- Server-side checks allow `.csv` and `.xlsx` extensions and enforce a 10 MB upload limit. The parser then verifies that the bytes are readable.
- Mapping input is size-limited and validated on the server; the client’s disabled buttons are usability checks, not a security boundary.
- Inspection samples are capped at 3 rows; mapped preview rows are capped at 20. The validation error collection covers the complete file and can be downloaded as CSV.
- Mapped sample email, phone, and identity values are masked in the mapper UI. Request logging records operation/status/error class only, not roster values.
- If the confirmation connection is lost, the UI reports that the outcome is unknown and tells the admin to check the student list before retrying.

### Template and error downloads

`GET /api/admin/import/registrants/template?format=csv|xlsx` is ADMIN-only and generates a small example template from `REGISTRANT_IMPORT_COLUMNS`. The page downloads the returned bytes as a file and displays authorization/service errors inline. Validation-error CSVs are assembled client-side from row number, field, and message; they do not include the original cell values.

## 4. Enrolment and payment exports (AF-020)

Both export endpoints require an `ADMIN` session, query `Registrant`, `User`, and `Course`, normalize the result to a reporting projection, and use the shared CSV/XLSX serializers. They count matching records before fetching; more than 10,000 returns HTTP 413 with a request to narrow the filters.

These files contain learner contact/identity data and payment information. Access control is enforced at each API route; exports are intended as authorized admin downloads.

### Enrolments

`GET /api/admin/enrolments/export` accepts:

- `format=csv|xlsx` (default `csv`)
- `status`, `courseId`, `startDate`, `endDate`, `search`

The enrolment page currently sends the chosen format, active status filter, and debounced search. The route also accepts course and submitted-date filters. The projection includes the Registrant ID/type/group/payment/status/fee/receipt/submission fields, canonical identity fields from `User`, and course name/IA reference from `Course`. Output names are `lmc-enrolments-YYYY-MM-DD.csv|xlsx`.

`search` matches User English/Chinese names, email, ID document number, and IA license case-insensitively. Date bounds apply to `Registrant.submittedAt`, with the end date extended through the end of that UTC day.

Export columns, in order: Enrolment ID, Registrant Name, Email, IA License, ID Doc Type, ID Doc Number, Course Name, Course Reference, Type, Group ID, Payment Method, Fee (HKD), Status, Submitted Date, Receipt Number. The displayed learner/course name uses Chinese first and English as fallback; the export column headers themselves are currently English.

### Payments

`GET /api/admin/payments/export` accepts:

- `format=csv|xlsx` (default `csv`)
- `status`, `paymentMethod`, `startDate`, `endDate`

The current Payments page sends the selected format; the API supports the additional filters. The projection includes payment method, amount, status, third-party-payment flag, payer name, receipt, and submission date, plus learner/course labels. There is no separate Payment model: the exported “Transaction ID” is `Registrant.id`, not a payment-provider transaction ID. Output names are `lmc-payments-YYYY-MM-DD.csv|xlsx`.

The payment date range is also applied to `Registrant.submittedAt`; there is no independent payment timestamp to filter on.

Export columns, in order: Transaction ID, Registrant Name, Email, Course Name, Course Reference, Payment Method, Amount (HKD), Payment Status, Receipt Number, Transaction Date, 3rd Party Payment, Payer Name. “Transaction Date” is derived from `Registrant.submittedAt`; the schema has no independent payment timestamp. The payment page is a minimal export screen and currently sends only `format` (no filter controls). Unlike the enrolment page's toast handling, its export failure handler currently logs to the browser console without a visible error message.

Identity/document values in the enrolment export come from `User`, not duplicate fields on `Registrant`. The schema does not provide Alipay trade IDs, payment timestamps, or refund timestamps, so those are not part of the current export contract.

## 5. Current implementation status

| Work item | Current code/status |
|---|---|
| AF-019 shared parser/export utilities | Raw-table parsing and CSV/XLSX utilities are present; the AF-019 Kanban card is marked done. |
| AF-020 enrolment/payment exports | Both API routes and admin download buttons are present. The Kanban card still says `backlog`, so its board status/acceptance needs reconciliation. |
| AF-021 student roster import | Four-step page, mapper integration, and stateless preview/confirm calls are present. AF-021 is in `verify`, awaiting human acceptance. See `verification/AF-021.md`. |
| AF-022 course export | Planned only. The task card specifies course CSV/XLSX export and full import/export integration checks, but no course-export API route or page export wiring is currently present. |

AF-022 proposes `GET /api/admin/courses/export` with `format`, `category`, `status`, and `search`, exporting course metadata and enrollment/capacity values. It also calls for an end-to-end audit of filters, i18n, errors, and filenames across all import/export features.

## 6. Known limitations

- CSV parsing is physical-line based; quoted fields containing embedded newlines are not supported.
- XLSX parsing uses ExcelJS in memory. The import file is capped at 10 MB, but decompressed workbook size is not separately capped.
- The shared file drop-zone prompts and API-generated row-validation details are currently English-only; wizard/page labels are dictionary-driven in `en`, `zh-hk`, and `zh-cn`.
- Template names are static, error-report names are static, and dated export names use separate `enrolments` / `payments` type labels. AF-022 should define which naming convention is canonical before claiming uniform naming.

## 7. Key files

- `src/lib/data/types.ts` — shared export/import contracts and download response.
- `src/lib/data/csv.ts`, `src/lib/data/excel.ts`, `src/lib/data/parser-utils.ts` — format serializers/parsers and common helpers.
- `src/lib/data/import/mapping.ts`, `src/lib/data/import/registrants.ts` — source-index mapping, student validation, and atomic User creation.
- `src/app/api/admin/import/registrants/{preview,confirm,template}/route.ts` — roster endpoints.
- `src/app/[locale]/admin/import/registrants/page.tsx`, `src/components/admin/RegistrantColumnMapper.tsx` — browser wizard and mapping UI.
- `src/app/api/admin/enrolments/export/route.ts`, `src/app/api/admin/payments/export/route.ts` — reporting projections and downloads.
- `ai/artifacts/第二階段：進階功能/task-cards/AF-019.md`, `feature-spec-af020.md`, `task-cards/AF-021.md`, and `tools/kanban/cards/AF-022.json` — workflow decisions, acceptance criteria, and planned work.
