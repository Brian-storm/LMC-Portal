# Mockup Decision: Admin Import Column Mapping

## Metadata

- Feature: AF-021 — Import Student Profiles
- Screen: `/admin/import/registrants`, Step 2 — Map columns
- Decision responsible: User
- Status: selected

## Design Goal

Help an administrator map unfamiliar CSV/XLSX source columns to the eight student profile destinations without guessing, then move to a server-validated data preview. Keep the existing single-page import wizard, file-size rules, and stateless re-upload behavior.

## Reference and Design-System Mapping

- Local reference: `src/app/[locale]/admin/users/page.tsx` and shared `AdminDataTable` for institutional table hierarchy and responsive overflow behavior.
- External reference: `satnaing/shadcn-admin` (`https://github.com/satnaing/shadcn-admin`) for accessible, responsive admin data-table density; adapt the pattern to this project's existing slate/emerald style.
- Reused tokens: `--background`, `--foreground`, `--primary`, `--primary-hover`, `--primary-deep`, `--muted`, `--border`, `--muted-foreground`, `--destructive`, `--success`, `--warning`, `--card`, `--ring`; 4px spacing scale; existing type scale.
- Reused components: `AdminPageHeader`, `AdminDataTable`, `FileDropZone`, Button, Select, Table, Form, Badge, toast, and existing Lucide icons.
- New components to register: None proposed. All three options compose existing inventory components.
- Depth: Flat surfaces and hard table/input boundaries; no new shadow treatment.
- Privacy: At most 3 mapping sample rows; after a source is mapped to email, phone, or identity-document targets, mask its displayed values.

## Variants

| Variant | Description | Clarity | Information density | Implementation complexity | Risk |
|---|---|---|---|---|---|
| **A — Destination-first mapping table** | One row per student field. Required/optional status, source-column Select, sample values, and match status appear together. | High: clearly answers “what does our system need?” | High, compact for 8 destinations | Low: one reusable table with existing Select/Table primitives | Low: required omissions and duplicate assignment are easy to highlight |
| **B — Source-column cards** | One card per relevant file column, with its header, sample values, and a destination selector; extra columns can be ignored. | High for understanding the uploaded file | Medium; cards expand vertically | Medium: more wrapping and per-card states | Medium: target-field completeness is less visible across cards |
| **C — Split mapping workspace** | Target fields and mapping selectors on the left; a scrollable sample spreadsheet with source indices and values on the right. | High for relating values to columns | Highest on wide desktop | Medium-high: synchronized layout, horizontal scrolling, and responsive stacking | Medium: narrow/mobile view must preserve column identity and mapping context |

## Variant Artifacts

- `ai/artifacts/第二階段：進階功能/mockups/import-mapping-variant-a.html`
- `ai/artifacts/第二階段：進階功能/mockups/import-mapping-variant-b.html`
- `ai/artifacts/第二階段：進階功能/mockups/import-mapping-variant-c.html`
- Shared mockup tokens/styles: `ai/artifacts/第二階段：進階功能/mockups/import-mapping.css`

## Recommendation and Selection

Recommend **Variant A — Destination-first mapping table** because it makes required fields and mapping completeness easiest to scan. On 2026-10-06, the user selected **Variant C — Split mapping workspace** to keep the target-field controls and uploaded sample spreadsheet visible together. Preserve the 4-step flow, with stacked panels and a horizontally scrollable sample table on mobile.

## Proposed Interaction Contract

- Auto-map only a unique, normalized exact header match (trimmed and case-insensitive); never fuzzy-match.
- Keep mappings by zero-based source-column index so duplicate header text remains distinguishable.
- Require exactly one source for each required target: Chinese name, English name, email, phone, and ID document number.
- Allow ID document type, IA license, and organization to remain unmapped; show that they will be treated as blank.
- A source column can map to at most one destination; extra source columns can remain unused.
- Show at most 3 sample rows to the authorized admin. Before mapping, source values are unclassified; once a source column is mapped to `email`, `phone`, or `idDocNumber`, mask that column in the mapping/review display. Submit file + mapping back to the server for a full validation preview; do not trust browser-side values for confirmation.
- Final confirmation happens only after the mapped data preview is valid; confirmation re-uploads the file and mapping for server-side revalidation.

## Design-Craft Review

- Feature-first hierarchy: destination fields, required status, source match, and samples lead; file metadata and help text stay secondary.
- Typography: existing type scale (11/12/14/16/24px) with regular, medium, semibold, and bold weights; Chinese snippets use `lang="zh-Hant"` and the approved fallback stack.
- Spacing: 4px scale; mapping panels start at 24px padding and inputs/buttons preserve 44px touch targets.
- Color/depth: existing slate/emerald and semantic tokens only; flat surface layering, with borders reserved for table/input boundaries.
- Interactive states: shared mockup stylesheet includes hover, focus, disabled, and loading treatments; screen spec lists loading, empty, error, unauthorized, and mobile states.
- Responsive: A/B rows/cards stack on narrow screens; C stacks the panels and keeps the source table horizontally scrollable.

## Open Questions / Assumptions

- Assumption: Optional destination fields may remain unmapped, consistent with existing row-level validation rules.
- Assumption: Duplicate labels are selected by source column index/letter and sample values, not by label text alone.
- Decision completed: Variant C was selected. Flow/copy may be refined within the approved split-workspace layout.

## Selection and Human Approval

- Selected variant: C — Split mapping workspace
- Why selected: Keep destination mappings and the parsed source sample visible side by side.
- Required changes before implementation: Complete architecture, security, and test review gates; update AF-019/AF-021 task cards and API/data contracts.
- Approver: User
- Date: 2026-10-06
