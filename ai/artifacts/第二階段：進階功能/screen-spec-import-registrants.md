# Screen Spec: Admin Import Registrants (Preview-then-Confirm)

## Metadata

- Feature: AF-021 — Import Students
- Screen: `/admin/import/registrants` (3-step wizard)
- Status: draft

## Purpose

Allow administrators to upload a CSV/Excel file containing registrant/user data, preview the parsed rows with validation errors highlighted, and confirm the import to write valid rows to the database.

## Layout

- **Step 1 (Upload)**: File drop zone + format hints + template download link
- **Step 2 (Preview)**: Table showing first 20 parsed rows, red error highlights, per-row status column, Continue / Cancel buttons
- **Step 3 (Result)**: Success/failure counts, error detail list, download error detail button, "Done" button

## States

| State | Behavior | Empty/Error Text | Verification |
|---|---|---|---|
| Default | Step 1: Upload page with drop zone | "Select a CSV or Excel file to import" | Visual |
| Loading | Spinner during file parse / confirm POST | "Processing..." | Visual |
| Error — parse fail | Show error message with retry | "Failed to parse file. Please check the format." + Retry | Visual |
| Error — confirm fail | Show error message | "Failed to confirm import. Please try again." | Visual |
| Empty | Step 2: No valid rows after parse | "No valid rows found in the file." | Visual |
| Partial errors | Step 2: Rows with red highlights | Per-row error tooltip | Visual |
| Disabled | Continue button disabled when all rows have errors | "No valid rows to import" | Visual |
| Success | Step 3: Import completed | Summary of imported/failed counts + error detail | Visual |
| Unauthorized | Redirect to login | N/A | N/A |
| Mobile | Stacked single-column layout, full-width table scroll | N/A | Visual |

## Interactions

| Action | Trigger | Result | Failure |
|---|---|---|---|
| Upload file | Drop or click file input | POST to preview API → shows Step 2 | Error state with Retry |
| Continue import | Click "Continue" button | POST to confirm API → shows Step 3 | Error state with Retry / Cancel |
| Cancel import | Click "Cancel" button | Returns to Step 1 | N/A |
| Download template | Click template link | GET template API → file download | N/A |
| Download errors | Click "Download Error Detail" | Generates error CSV file | N/A |

## Design System Mapping

- Reused tokens: `--primary`, `--primary-hover`, `--primary-deep`, `--destructive`, `--success`, `--warning`, `--background`, `--muted`, `--border`, `--foreground`, `--card`, `--ring`
- Reused components: Button, Input, Card, Badge (destructive variant for error rows), AlertCircle/Loader2 icons, AdminPageHeader, AdminDataTable, toast
- New components needed: FileDropZone (drag-and-drop file input with format validation)