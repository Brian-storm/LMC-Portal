# Screen Spec: Admin Import Registrants (Atomic Preview-and-Confirm)

## Metadata

- Feature: AF-021 — Import Student Profiles
- Screen: `/admin/import/registrants` (single-page, 3-step wizard)
- Status: draft — interaction contract updated; implementation pending

## Purpose

Allow administrators to validate a complete CSV/XLSX roster before creating student `User` records. `User` owns the canonical identity-document data. The screen never offers a partial import.

## Layout

- **Step 1 (Upload)**: Existing file drop zone, format/size hints, CSV and XLSX template links.
- **Step 2 (Preview)**: Show first 20 rows and validation messages. Structural file errors are prominent. Continue is enabled only when every row is valid and all expected headers were found.
- **Step 3 (Result)**: Show either full-batch success or full-batch failure. Never show mixed imported/failed row counts as a successful partial result.

## States

| State | Behavior | Empty/Error Text | Verification |
|---|---|---|---|
| Default | Step 1 with upload zone and template links | Select a CSV or Excel file to import | Screenshot |
| Loading — preview | Disable upload controls while parsing | Processing file… | Screenshot |
| Preview valid | Display first 20 rows; every row is valid | All rows are valid; ready to import | Screenshot |
| Preview row errors | Highlight invalid rows, show validation detail, offer CSV error-detail download | Fix every listed error and upload the file again | Screenshot |
| Structural file error | No confirmable preview; explain missing/mismatched header or unreadable file; offer error-detail download when row/field data is available | File does not match the import template. Use the template and try again. | Screenshot |
| Leading blank rows | Ignore fully blank rows before the header; first nonblank row must be the expected header row | N/A | CSV/XLSX integration test |
| Confirm disabled | Disabled if any row or structural validation error exists | All rows must be valid before import | Screenshot |
| Loading — confirm | Re-upload the selected file; server reparses and revalidates | Importing all records… | Screenshot |
| Success | Entire batch committed | All N student profiles imported | Screenshot + database assertion |
| Transaction failure | Entire batch rolled back; show failure without a partial-success count | Import failed; no records were imported. Correct the file or retry. | Integration test + screenshot |
| Unauthorized | API denies request; route follows existing admin access behavior | Admin access required | API test |
| Mobile | Stacked wizard; preview table scrolls horizontally | Same state-specific messages | Screenshot |

## Interactions

| Action | Trigger | Result | Failure |
|---|---|---|---|
| Upload file | Drop or choose CSV/XLSX | POST multipart file to preview endpoint; no server-side preview session is created | Show parser or row-validation errors; no confirm if any error exists |
| Confirm import | Click only when all rows are valid | Re-submit the selected file as multipart data; server reparses, revalidates, and writes all rows in one transaction | Any database conflict rolls back the batch and reports failure |
| Cancel | Click cancel/change file | Clear current preview and return to upload step | N/A |
| Download template | Click CSV/XLSX link | Download template with expected headers | Show a user-readable error if download fails |
| Download errors | Click error-detail action when validation fails | Download CSV containing source row, field, and error message | No data is written |

## Parser Contract

- CSV and XLSX both skip only fully blank leading rows.
- The first nonblank row must contain every expected template header; header matching is case-insensitive and columns may be reordered.
- A nonblank title/data row before the header, missing headers, or an unreadable file is a structural error. Do not guess the header row or allow confirmation.
- Structural and row-level validation errors both block the entire import.

## Design System Mapping

- Reused tokens: `--primary`, `--primary-hover`, `--primary-deep`, `--destructive`, `--success`, `--warning`, `--background`, `--muted`, `--border`, `--foreground`, `--card`, `--ring`.
- Reused components: Button, Input, Card, Badge, AlertCircle/Loader2 icons, AdminPageHeader, AdminDataTable, toast.
- New components: Existing `FileDropZone`; no new visual component is requested by this interaction update.
