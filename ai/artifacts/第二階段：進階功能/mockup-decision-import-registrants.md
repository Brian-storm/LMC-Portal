# Mockup Decision: Admin Import Registrants (3-Step Wizard)

## Metadata

- Feature: AF-021 — Import Students
- Screen: `/admin/import/registrants`
- Decision responsible: Developer (AI) + Human
- Status: selected

## Variants

| Variant | Description | Pros | Cons |
|---|---|---|---|
| **A — Single Page Tab Switch** | Three visual "steps" shown as tabs on one page. Progress indicator at top (Step 1 → Step 2 → Step 3). Each step is a section that appears/disappears. File drop zone in Step 1, table preview in Step 2, results in Step 3. Back/Continue/Cancel buttons at bottom. | Simple to implement, no URL routing complexity. Familiar pattern for admins. Uses existing card/table components directly. | All steps share one URL — no deep linking to a step. Page reload resets to Step 1. |
| **B — Multi-Page / Multi-Route** | Three separate routes: `/admin/import/registrants/upload`, `/admin/import/registrants/preview?importId=xyz`, `/admin/import/registrants/result?importId=xyz`. Progress indicator persists via URL. Each page is a server-component-friendly route. | Deep-linkable to any step. Back button works naturally. Each page has its own loading/error state. | More files to create. More complex routing. Import state must persist server-side (need temp storage). |
| **C — Modal/Overlay Flow** | A button on the admin dashboard or users page opens a multi-step modal dialog. Step 1: upload inside modal. Step 2: preview table inside modal body with scroll. Step 3: result summary in modal. Modal is large (80vw x 80vh). | Stays within the current admin page context. Feels lightweight. | Modal at 80vw is awkward on mobile. Large preview tables scroll poorly inside a modal. Harder to show error details. Breaks the "page" convention established by other admin features. |

### Recommended: Variant A — Single Page Tab Switch

- Matches existing admin patterns (all admin pages are single-page client components with useEffect data fetching)
- Simple, well-understood pattern
- Low implementation complexity using existing components

## Design System Mapping

- Reused tokens: `--primary`, `--primary-deep`, `--destructive`, `--success`, `--warning`, `--background`, `--muted`, `--border`, `--foreground`, `--ring`, `--card`
- Reused components: AdminPageHeader, AdminDataTable, Button, Card, Badge (destructive), Input, AlertCircle, CheckCircle, Loader2, Upload, FileDown, Download, XCircle, AlertTriangle
- New components to register: `FileDropZone` (reusable drag-and-drop file input — registers to inventory below)

## New Component: FileDropZone

| Property | Value |
|---|---|
| States | default (dashed border, upload icon), hover (border primary, bg tint), dragging (bg-primary/5, border-primary), file-selected (shows filename + size), error (border-destructive, error message), disabled (opacity-50) |
| Tokens | `--border`, `--primary`, `--destructive`, `--muted`, `--foreground`, `--muted-foreground` |
| File validation | Client-side: `.csv`, `.xlsx` only, max 10MB |
| Accessibility | Hidden `<input type="file">` triggered by click on drop zone; aria-label on zone |

## Human Approval Needed

Please select **Variant A** (recommended), **B**, or **C** to proceed with implementation.