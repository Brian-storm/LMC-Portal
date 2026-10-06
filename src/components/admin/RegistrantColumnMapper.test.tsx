import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import en from "@/dictionaries/en.json";
import { AdminDictProvider } from "@/components/admin/AdminDictContext";

import RegistrantColumnMapper, {
  getSpreadsheetColumnLabel,
  maskMappedSample,
  replaceSourceColumnMapping,
  type RegistrantColumnMapperProps,
} from "./RegistrantColumnMapper";
import type { SourceColumnMapping } from "@/lib/data/import/mapping";

const sourceColumns = [
  { index: 0, header: "Name" },
  { index: 1, header: "Name" },
  { index: 2, header: "Email (電郵)" },
  { index: 3, header: "ID number" },
];
const sampleRows = [
  { rowNumber: 2, values: ["陳嘉明", "Alice Chan", "private@example.test", "A1234567"] },
];
const suggestedMapping: SourceColumnMapping[] = [
  { sourceIndex: 2, targetField: "email" },
  { sourceIndex: 3, targetField: "idDocNumber" },
];

/** Server-render the mapper under the existing locale provider for semantic UI assertions. */
function renderMapper(overrides: Partial<RegistrantColumnMapperProps> = {}): string {
  // 1: Supply safe default props and allow each state test to override only relevant values.
  const props: RegistrantColumnMapperProps = {
    locale: "en",
    sourceColumns,
    sampleRows,
    suggestedMapping,
    mapping: suggestedMapping,
    onMappingChange: () => undefined,
    ...overrides,
  };

  // 2: Render through the admin dictionary provider exactly as the host layout will.
  return renderToStaticMarkup(
    <AdminDictProvider dict={en.admin}>
      <RegistrantColumnMapper {...props} />
    </AdminDictProvider>,
  );
}

test("getSpreadsheetColumnLabel formats stable zero-based Excel-style labels", () => {
  // 1: Cover the first, last single-letter, and first/last double-letter boundaries.
  assert.equal(getSpreadsheetColumnLabel(0), "A");
  assert.equal(getSpreadsheetColumnLabel(25), "Z");
  assert.equal(getSpreadsheetColumnLabel(26), "AA");
  assert.equal(getSpreadsheetColumnLabel(701), "ZZ");
});

test("maskMappedSample masks email, phone, and ID values only after their target is selected", () => {
  // 1: Confirm sensitive mapped data keeps only the small identifying suffix/pattern.
  assert.equal(maskMappedSample("email", "admin@example.test"), "a•••@example.test");
  assert.equal(maskMappedSample("phone", "+852 9123 4567"), "•••• 4567");
  assert.equal(maskMappedSample("idDocNumber", "A1234567"), "•••• 4567");
  assert.equal(maskMappedSample("idDocNumber", "1234"), "••••");

  // 2: Unclassified values and nonsensitive mapped fields remain available for matching.
  assert.equal(maskMappedSample(undefined, "admin@example.test"), "admin@example.test");
  assert.equal(maskMappedSample("nameEn", "Ming Chan"), "Ming Chan");
});

test("replaceSourceColumnMapping preserves one-to-one source assignment", () => {
  // 1: Refuse to map a source already assigned to a different destination.
  const current: SourceColumnMapping[] = [{ sourceIndex: 2, targetField: "email" }];
  assert.deepEqual(replaceSourceColumnMapping(current, "nameZh", "2"), current);

  // 2: Allow a new source selection and clear the selected target when unmapped.
  assert.deepEqual(replaceSourceColumnMapping(current, "email", "3"), [
    { sourceIndex: 3, targetField: "email" },
  ]);
  assert.deepEqual(replaceSourceColumnMapping(current, "email", "__unmapped__"), []);
});

test("RegistrantColumnMapper renders Variant C and masks mapped personal samples", () => {
  // 1: Render duplicate source labels and mapped sensitive values in the split workspace.
  const markup = renderMapper({
    mappingErrors: [{ row: 1, field: "phone", message: "Required field \"phone\" must be mapped" }],
  });

  // 2: Keep the split panes, disambiguate same-name columns, localize the error, and mask PII.
  assert.match(markup, /Map your file columns/);
  assert.match(markup, /Sample spreadsheet/);
  assert.match(markup, /A · Name/);
  assert.match(markup, /B · Name/);
  assert.match(markup, /Choose a source column for this required field/);
  assert.doesNotMatch(markup, /Required field &quot;phone&quot; must be mapped/);
  assert.match(markup, /p•••@example\.test/);
  assert.match(markup, /•••• 4567/);
  assert.doesNotMatch(markup, /private@example\.test/);
  assert.doesNotMatch(markup, /A1234567/);
});

test("RegistrantColumnMapper renders loading and empty source states with disabled selectors", () => {
  // 1: Show the loading response while the file-only inspection request is pending.
  const loadingMarkup = renderMapper({ sourceColumns: [], sampleRows: [], loading: true, disabled: true });
  assert.match(loadingMarkup, /Reading sample rows/);
  assert.match(loadingMarkup, /aria-busy="true"/);
  assert.match(loadingMarkup, /disabled/);

  // 2: Show a clear empty state when the inspection result contains no source columns.
  const emptyMarkup = renderMapper({ sourceColumns: [], sampleRows: [], mapping: [], suggestedMapping: [] });
  assert.match(emptyMarkup, /No source columns were found/);
});
