# Screen Spec: Admin Import Registrants (Header Mapping and Atomic Confirm)

## Metadata

- Feature: AF-021 — Import Student Profiles
- Screen: `/admin/import/registrants` (single-page, 4-step wizard)
- Status: mockup approved — Variant C selected; architecture and implementation pending

## Purpose

Allow administrators to inspect, map, and validate CSV/XLSX columns before creating student `User` records, including files with unfamiliar header wording. `User` owns the canonical identity-document data. The screen never offers a partial import.

## Viewport Assumptions

- Desktop: 1440 × 900 reference viewport; mapping destination rows and sample values remain visible without a modal.
- Tablet: 768 × 1024; table regions may scroll horizontally while the stepper remains readable.
- Mobile: 390 × 844; mapping controls stack per target field; source and final-preview tables scroll horizontally with row labels retained.

## Layout

- **Step 1 (Upload)**: Existing file drop zone, format/size hints, CSV and XLSX template links.
- **Step 2 (Map columns)**: Variant C split workspace. Show each target `User` field and source-column selector beside a sample spreadsheet of up to 3 rows. Unique exact header matches are preselected; duplicate labels are identified by source column letter/index. Required targets must map once; optional targets may remain blank.
- **Step 3 (Review)**: Re-upload the file with the selected mapping for server-side validation. Show the mapped first 20 rows and all row errors. Final confirmation is available only when the entire file is valid.
- **Step 4 (Result)**: Show either full-batch success or full-batch failure. Never show mixed imported/failed row counts as a successful partial result.

## States

| State | Behavior | Empty/Error Text | Verification |
|---|---|---|---|
| Default | Step 1 with upload zone and template links | Select a CSV or Excel file to import | Screenshot |
| Loading — inspect | Disable file and mapping actions while source columns are extracted | Reading file columns… | Screenshot |
| Mapping — auto-matched | Show exact unique header matches with matched status and sample values beside the source table | Review all field matches before continuing | Screenshot |
| Mapping — unresolved required | Highlight required targets without a source column; disable Review | Map every required field to a source column | Screenshot |
| Mapping — duplicate assignment | Show the source field already assigned elsewhere; disable Review | A source column can only map to one destination field | Screenshot |
| Mapping — optional/unmapped | Permit `idDocType`, `iaLicense`, or `organization` to remain unmapped | Optional fields will be treated as blank | Screenshot |
| Mapping — duplicate source labels | Distinguish identical labels by source column letter/index and sample values | Select the correct source column for each required field | Screenshot |
| Loading — mapped review | Re-upload file + mapping; disable mapping controls while server validates all rows | Validating mapped data… | Screenshot |
| Empty — no data rows | Show the detected source columns but no sample/data records; block Review and confirm | No data rows were found below the source header | Screenshot |
| Review valid | Display first 20 mapped rows; every row is valid | All rows are valid; ready to import | Screenshot |
| Review row errors | Highlight invalid mapped values, show validation detail, offer CSV error-detail download | Fix every listed error and map or upload the file again | Screenshot |
| Structural file/mapping error | No confirmable preview; explain unreadable file, missing candidate header, or invalid mapping | The file or column mapping could not be validated. Review the details and try again. | Screenshot |
| Leading blank rows | Ignore fully blank rows before the first nonblank source-header row; do not guess past a nonblank preamble | N/A | CSV/XLSX integration test |
| Confirm disabled | Disabled while mapping unresolved or if any row/mapping error exists | Complete the mapping and resolve all row errors before import | Screenshot |
| Loading — confirm | Re-upload the selected file + mapping; server reparses and revalidates | Importing all records… | Screenshot |
| Success | Entire batch committed | All N student profiles imported | Screenshot + database assertion |
| Transaction failure | Entire batch rolled back; show failure without a partial-success count | Import failed; no records were imported. Correct the file or retry. | Integration test + screenshot |
| Unauthorized | API denies request; route follows existing admin access behavior | Admin access required | API test |
| Mobile | Stacked wizard; mapping controls stack per target; sample/review table scrolls horizontally | Same state-specific messages | Screenshot |

## Interactions

| Action | Trigger | Result | Failure |
|---|---|---|---|
| Upload file | Drop or choose CSV/XLSX | POST multipart file to inspect source headers and return limited sample values; no server-side preview session is created | Show parser errors; no mapping if no source header can be read |
| Choose mapping | Select one source column for a target field | Keep mapping by source index; options already assigned to a different target are disabled until that mapping is cleared | Show inline required/duplicate mapping error |
| Review mapping | Click after every required target is uniquely mapped | Re-submit the selected file + mapping; server validates mapping and all rows, then returns first-20-row preview | Keep review step blocked on invalid mapping or row errors |
| Confirm import | Click only when mapping and all rows are valid | Re-submit file + mapping as multipart data; server reparses, revalidates, and writes all rows in one transaction | Any mapping/data/database conflict blocks or rolls back the full batch |
| Cancel | Click cancel/change file | Clear file, source columns, mapping and review; return to upload step | N/A |
| Download template | Click CSV/XLSX link | Download template with expected headers | Show a user-readable error if download fails |
| Download errors | Click error-detail action when validation fails | Download CSV containing source row, field, and error message | No data is written |

## Parser Contract

- CSV and XLSX both skip only fully blank leading rows.
- The first nonblank row is the source-header candidate; preserve raw labels and source column indices, including repeated labels.
- Do not scan past a nonblank title/data row to guess a later header. An unreadable file or absence of a nonblank source-header candidate is a structural error.
- Target mapping is a separate AF-021 responsibility: unique normalized exact labels may be preselected, and the admin resolves other labels by source index.
- Structural, mapping, and row-level validation errors all block the entire import.

## Design System Mapping

- Reused tokens: `--primary`, `--primary-hover`, `--destructive`, `--success`, `--warning`, `--background`, `--muted`, `--border`, `--foreground`, `--card`, `--ring`, and existing spacing/type scales.
- Reused components: `FileDropZone`, `AdminPageHeader`, `AdminDataTable`, Button, Select, Table, Badge, Form, toast; Lucide `CheckCircle2`, `AlertCircle`, `AlertTriangle`, `Loader2`, `ArrowLeft`, `ChevronRight` icons.
- New components: None proposed; compose existing inventory components. If mockup review reveals a missing reusable primitive, register it before frontend implementation.
- Data minimization: Mapping inspection returns at most 3 sample rows to the authorized admin; mask the selected ID-document source column after mapping. Final validated preview remains capped at 20 rows per the existing feature contract.
- Primary action hierarchy: resolve mappings → review validated data → confirm atomic import. Use the existing institutional slate/emerald tokens and 4px spacing scale.

## Mockup Variants

- A — destination-first mapping table: `ai/artifacts/第二階段：進階功能/mockups/import-mapping-variant-a.html`
- B — source-column cards: `ai/artifacts/第二階段：進階功能/mockups/import-mapping-variant-b.html`
- C — split mapping workspace (selected): `ai/artifacts/第二階段：進階功能/mockups/import-mapping-variant-c.html`
- Decision record: `ai/artifacts/第二階段：進階功能/mockup-decision-import-mapping.md`
