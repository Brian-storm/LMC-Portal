import assert from "node:assert/strict";
import test from "node:test";
import ExcelJS from "exceljs";

import { exportCsv, parseCsv, parseCsvTable } from "./csv";
import { exportExcel, parseExcel, parseExcelTable } from "./excel";
import type { ExportColumn } from "./types";

type ImportRow = Record<string, unknown>;

const columns: ExportColumn<ImportRow>[] = [
  { key: "name", header: "Name" },
  { key: "email", header: "Email" },
];

/** Build an XLSX fixture from physical rows so parser row-number behavior is verifiable. */
async function createExcelFixture(
  rows: Array<Array<string | number | null>>,
): Promise<Uint8Array> {
  // 1: Create a workbook and add rows in the exact source order.
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Import");
  rows.forEach((row) => worksheet.addRow(row));

  // 2: Serialize to the same byte shape accepted by parseExcel.
  return new Uint8Array(await workbook.xlsx.writeBuffer());
}

test("CSV skips fully blank leading rows and maps reordered case-insensitive headers", () => {
  // 1: Include whitespace-only and delimiter-only blank rows before the header.
  const csv = "\uFEFF  \r\n,,\r\nEMAIL, name \r\nada@example.test,Ada";

  // 2: Verify the first nonblank row drives mapping regardless of order and case.
  const result = parseCsv<ImportRow>(csv, columns);
  assert.equal(result.success, true);
  assert.equal(result.imported, 1);
  assert.deepEqual(result.data, [{ name: "Ada", email: "ada@example.test" }]);
});

test("CSV rejects a non-header first nonblank row without returning parsed rows", () => {
  // 1: Put a title row before an otherwise valid header to forbid header guessing.
  const csv = "Registrant export\nEmail,Name\nada@example.test,Ada";

  // 2: Structural mismatch must fail closed and point to the physical header candidate.
  const result = parseCsv<ImportRow>(csv, columns);
  assert.equal(result.success, false);
  assert.equal(result.imported, 0);
  assert.deepEqual(result.data, []);
  assert.equal(result.errors[0]?.row, 1);
});

test("CSV reports missing headers at their source row and rejects empty files", () => {
  // 1: A partial header after a blank row is structurally invalid at row 2.
  const partial = parseCsv<ImportRow>(" \nEmail\nada@example.test", columns);
  assert.equal(partial.success, false);
  assert.equal(partial.imported, 0);
  assert.deepEqual(partial.data, []);
  assert.equal(partial.errors[0]?.row, 2);

  // 2: Empty and all-blank files must report explicit structural errors.
  const empty = parseCsv<ImportRow>("", columns);
  assert.equal(empty.success, false);
  assert.equal(empty.imported, 0);
  assert.deepEqual(empty.data, []);
  assert.ok(empty.errors.length > 0);

  const blank = parseCsv<ImportRow>(" \n,,\n", columns);
  assert.equal(blank.success, false);
  assert.equal(blank.imported, 0);
  assert.deepEqual(blank.data, []);
  assert.ok(blank.errors.length > 0);
});

test("Excel skips fully blank leading rows and maps reordered case-insensitive headers", async () => {
  // 1: Build a workbook with blank rows before the header and reversed columns.
  const file = await createExcelFixture([
    [" ", null],
    ["", "   "],
    ["EMAIL", "Name"],
    ["ada@example.test", "Ada"],
  ]);

  // 2: Verify parsing uses the first nonblank row and maps into the requested keys.
  const result = await parseExcel<ImportRow>(file, columns);
  assert.equal(result.success, true);
  assert.equal(result.imported, 1);
  assert.deepEqual(result.data, [{ name: "Ada", email: "ada@example.test" }]);
});

test("Excel does not skip a non-string preamble to guess a later header", async () => {
  // 1: A numeric first row is nonblank even though it is not a valid header.
  const file = await createExcelFixture([
    [2026],
    ["Email", "Name"],
    ["ada@example.test", "Ada"],
  ]);

  // 2: The parser must fail at row 1 and must not expose later rows as import data.
  const result = await parseExcel<ImportRow>(file, columns);
  assert.equal(result.success, false);
  assert.equal(result.imported, 0);
  assert.deepEqual(result.data, []);
  assert.equal(result.errors[0]?.row, 1);
});

test("Excel rejects partial headers and all-blank sheets with structural errors", async () => {
  // 1: A partial header after a blank row must retain its physical row number.
  const partialFile = await createExcelFixture([[" ", null], ["Email"], ["ada@example.test"]]);
  const partial = await parseExcel<ImportRow>(partialFile, columns);
  assert.equal(partial.success, false);
  assert.equal(partial.imported, 0);
  assert.deepEqual(partial.data, []);
  assert.equal(partial.errors[0]?.row, 2);

  // 2: A sheet containing only blank cells must not be treated as a successful import.
  const blankFile = await createExcelFixture([[" ", null], ["", "   "]]);
  const blank = await parseExcel<ImportRow>(blankFile, columns);
  assert.equal(blank.success, false);
  assert.equal(blank.imported, 0);
  assert.deepEqual(blank.data, []);
  assert.ok(blank.errors.length > 0);

  // 3: A workbook with no physical rows must also report a missing header.
  const emptyFile = await createExcelFixture([]);
  const empty = await parseExcel<ImportRow>(emptyFile, columns);
  assert.equal(empty.success, false);
  assert.equal(empty.imported, 0);
  assert.deepEqual(empty.data, []);
  assert.ok(empty.errors.length > 0);
});

test("Excel reports unreadable workbook bytes instead of throwing", async () => {
  // 1: Supply bytes that cannot represent an XLSX workbook.
  const invalidFile = new Uint8Array();

  // 2: Return a parser error and no data so callers can show a file-level failure.
  const result = await parseExcel<ImportRow>(invalidFile, columns);
  assert.equal(result.success, false);
  assert.equal(result.imported, 0);
  assert.deepEqual(result.data, []);
  assert.equal(result.errors[0]?.field, "_file");
});

test("raw CSV parsing preserves duplicate/blank header columns and original row numbers", () => {
  // 1: Include leading/data blank rows, duplicate labels, and a data value beyond the header width.
  const csv = "\uFEFF  \r\nName,Name,\r\nAda,\"Preferred, name\",Extra,Unlabelled\r\n , , \r\nBo,Nickname";

  // 2: Preserve header labels and distinguish all source columns by their zero-based positions.
  const result = parseCsvTable(csv);
  assert.equal(result.success, true);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.table?.columns, [
    { index: 0, header: "Name" },
    { index: 1, header: "Name" },
    { index: 2, header: "" },
    { index: 3, header: "" },
  ]);
  assert.deepEqual(result.table?.rows, [
    { rowNumber: 3, values: ["Ada", "Preferred, name", "Extra", "Unlabelled"] },
    { rowNumber: 5, values: ["Bo", "Nickname", "", ""] },
  ]);
});

test("raw CSV parsing does not guess past the first nonblank row and errors on all-blank input", () => {
  // 1: A title-like first nonblank row remains the header candidate despite a later tabular row.
  const candidate = parseCsvTable("\nRoster export\nName,Email\nAda,ada@example.test");
  assert.equal(candidate.success, true);
  assert.deepEqual(candidate.table?.columns, [
    { index: 0, header: "Roster export" },
    { index: 1, header: "" },
  ]);
  assert.deepEqual(candidate.table?.rows[0], { rowNumber: 3, values: ["Name", "Email"] });

  // 2: A file without any nonblank row reports a structural error and no table.
  const blank = parseCsvTable("  \n,,\n");
  assert.equal(blank.success, false);
  assert.equal(blank.table, null);
  assert.equal(blank.errors[0]?.field, "_header");

  const empty = parseCsvTable("");
  assert.equal(empty.success, false);
  assert.equal(empty.table, null);
  assert.equal(empty.errors[0]?.field, "_header");
});

test("raw Excel parsing preserves duplicate source labels and original row numbers", async () => {
  // 1: Build a workbook with leading blanks, duplicate headers, and an empty data row.
  const file = await createExcelFixture([
    [" ", null],
    ["Name", "Name", ""],
    ["Ada", "Preferred", "Extra"],
    [" ", "   ", null],
    ["Bo", "Nickname", null],
  ]);

  // 2: Preserve source positions and skip fully blank data rows without renumbering later rows.
  const result = await parseExcelTable(file);
  assert.equal(result.success, true);
  assert.deepEqual(result.table?.columns, [
    { index: 0, header: "Name" },
    { index: 1, header: "Name" },
    { index: 2, header: "" },
  ]);
  assert.deepEqual(result.table?.rows, [
    { rowNumber: 3, values: ["Ada", "Preferred", "Extra"] },
    { rowNumber: 5, values: ["Bo", "Nickname", ""] },
  ]);
});

test("raw Excel parsing uses a non-string first row as the source-header candidate", async () => {
  // 1: Put numeric content before a later text table so scanning cannot guess a header.
  const file = await createExcelFixture([
    [2026],
    ["Name", "Email"],
    ["Ada", "ada@example.test"],
  ]);

  // 2: Keep the numeric cell as a header label and the following row as data by physical number.
  const result = await parseExcelTable(file);
  assert.equal(result.success, true);
  assert.deepEqual(result.table?.columns, [
    { index: 0, header: "2026" },
    { index: 1, header: "" },
  ]);
  assert.deepEqual(result.table?.rows[0], { rowNumber: 2, values: ["Name", "Email"] });
});

test("raw Excel parsing returns a file-level error for unreadable bytes", async () => {
  // 1: Supply bytes that ExcelJS cannot load as a workbook.
  const result = await parseExcelTable(new Uint8Array());

  // 2: Surface a parser error without exposing library details or returning a table.
  assert.equal(result.success, false);
  assert.equal(result.table, null);
  assert.equal(result.errors[0]?.field, "_file");

  // 3: A valid workbook with no nonblank source header is a structural header error.
  const blankWorkbook = await createExcelFixture([[" ", null], ["", "   "]]);
  const blank = await parseExcelTable(blankWorkbook);
  assert.equal(blank.success, false);
  assert.equal(blank.table, null);
  assert.equal(blank.errors[0]?.field, "_header");

  // 4: A missing selected worksheet is also a structural error with no table.
  const validWorkbook = await createExcelFixture([["Name"], ["Ada"]]);
  const missingSheet = await parseExcelTable(validWorkbook, 1);
  assert.equal(missingSheet.success, false);
  assert.equal(missingSheet.table, null);
  assert.equal(missingSheet.errors[0]?.field, "_sheet");
});

test("existing CSV and Excel exports remain importable with their declared schema", async () => {
  // 1: Export values with CSV-special punctuation through each existing serializer.
  const items = [{ name: "Ada, Lovelace", email: "ada@example.test" }];
  const csv = exportCsv(items, columns);
  const excel = await exportExcel(items, columns);

  // 2: Verify both formats round-trip through the shared import path.
  const csvResult = parseCsv<ImportRow>(csv, columns);
  const excelResult = await parseExcel<ImportRow>(new Uint8Array(excel), columns);
  assert.equal(csv.startsWith("\uFEFF"), true);
  assert.deepEqual(csvResult.data, items);
  assert.deepEqual(excelResult.data, items);
});
