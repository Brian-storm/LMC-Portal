/**
 * Excel export/import utilities using exceljs.
 *
 * - Export: array of objects → .xlsx Buffer
 * - Import: .xlsx Buffer → array of objects (supports multi-sheet)
 * - Download helper: wrap Excel buffer in a Response with Content-Disposition
 */
import ExcelJS from "exceljs";

import {
  type ExportColumn,
  type ImportResult,
  type ImportTableResult,
  type DataExporter,
  type DataImporter,
  createDownloadResponse,
  EXCEL_MIME_TYPE,
  DEFAULT_COLUMN_WIDTH,
} from "./types";
import { isBlankRow, mapHeaders } from "./parser-utils";

// ─── Export ────────────────────────────────────────────────────────────────────

/**
 * Convert an array of objects to an Excel .xlsx Buffer.
 *
 * @param items     - Array of data objects.
 * @param columns   - Column definitions (key, header, width, format).
 * @param sheetName - Optional sheet name (default: "Sheet1").
 * @returns Excel workbook as a Buffer.
 */
export async function exportExcel<T extends Record<string, unknown>>(
  items: T[],
  columns: ExportColumn<T>[],
  sheetName = "Sheet1",
): Promise<Buffer> {
  // 1: Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LMC Portal";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName);

  // 2: Configure columns (header + width)
  const excelColumns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width ?? DEFAULT_COLUMN_WIDTH,
  }));
  sheet.columns = excelColumns;

  // Add a header style row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };

  // 3: Write data rows
  for (const item of items) {
    const row: Record<string, unknown> = {};
    for (const col of columns) {
      row[col.key] = item[col.key] ?? "";
    }
    sheet.addRow(row);
  }

  // 4: Apply column-specific formatting
  for (const col of columns) {
    if (col.format) {
      const excelCol = sheet.getColumn(col.key);
      excelCol.numFmt = col.format;
    }
  }

  // 5: Auto-filter on header row
  if (items.length > 0) {
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: items.length + 1, column: columns.length },
    };
  }

  // 6: Write to buffer
  const rawBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(rawBuffer);
}

// ─── Import ────────────────────────────────────────────────────────────────────

/**
 * Parse an Excel worksheet into a raw source table without applying business-field mapping.
 *
 * @param buffer - Uploaded .xlsx bytes.
 * @param sheetIndex - Worksheet index (0-based, default 0).
 * @returns Source columns and rows with original row numbers, or a structural error.
 */
export async function parseExcelTable(
  buffer: Uint8Array,
  sheetIndex = 0,
): Promise<ImportTableResult> {
  // 1: Load the workbook and convert ExcelJS failures into a file-level parser result.
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as never);
  } catch {
    return {
      success: false,
      table: null,
      errors: [
        {
          row: 1,
          field: "_file",
          message: "Excel file could not be read as a valid .xlsx workbook",
        },
      ],
    };
  }

  // 2: Select the requested worksheet and report an explicit error if it is missing.
  const sheet = workbook.worksheets[sheetIndex];
  if (!sheet) {
    return {
      success: false,
      table: null,
      errors: [
        {
          row: 1,
          field: "_sheet",
          message: `Sheet at index ${sheetIndex} not found (total sheets: ${workbook.worksheets.length})`,
        },
      ],
    };
  }

  // 3: Locate the first nonblank physical row without guessing past non-string values.
  const rowCount = sheet.rowCount;
  const columnCount = sheet.columnCount;
  let headerRowNumber = 0;
  for (let rowNumber = 1; rowNumber <= rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const values = Array.from({ length: columnCount }, (_, index) =>
      row.getCell(index + 1).value,
    );
    if (isBlankRow(values)) continue;

    headerRowNumber = rowNumber;
    break;
  }

  // 4: Fail structurally when the selected sheet contains no nonblank header candidate.
  if (headerRowNumber === 0) {
    return {
      success: false,
      table: null,
      errors: [{ row: 1, field: "_header", message: "Excel sheet contains no nonblank header row" }],
    };
  }

  // 5: Preserve each displayed header and its source-column index, including duplicates.
  const headerRow = sheet.getRow(headerRowNumber);
  const columns = Array.from({ length: columnCount }, (_, index) => ({
    index,
    header: headerRow.getCell(index + 1).text,
  }));

  // 6: Collect nonblank data rows while keeping their physical source row numbers.
  const rows: Array<{ rowNumber: number; values: unknown[] }> = [];
  for (let rowNumber = headerRowNumber + 1; rowNumber <= rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const values = Array.from({ length: columnCount }, (_, index) =>
      row.getCell(index + 1).value ?? "",
    );
    if (isBlankRow(values)) continue;

    rows.push({ rowNumber, values });
  }

  return { success: true, table: { columns, rows }, errors: [] };
}

/**
 * Parse an Excel .xlsx Buffer into an array of objects.
 *
 * @param buffer      - .xlsx file buffer.
 * @param columns     - Column definitions; header names matched case-insensitively.
 * @param sheetIndex  - Sheet index (0-based, default 0).
 * @returns ImportResult with parsed data and any errors.
 */
export async function parseExcel<T extends Record<string, unknown>>(
  buffer: Uint8Array,
  columns: ExportColumn<T>[],
  sheetIndex = 0,
): Promise<ImportResult<T>> {
  const data: T[] = [];

  // 1: Load workbook
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as never);
  } catch {
    // 2: Return a safe file-level error without leaking library details or file contents.
    return {
      success: false,
      imported: 0,
      errors: [
        {
          row: 1,
          field: "_file",
          message: "Excel file could not be read as a valid .xlsx workbook",
        },
      ],
      data: [],
    };
  }

  // 2: Select the requested worksheet, keeping the existing index-based public API.
  const sheet = workbook.worksheets[sheetIndex];
  if (!sheet) {
    // 3: Report a worksheet-level structural error instead of returning an empty success.
    return {
      success: false,
      imported: 0,
      errors: [
        {
          row: 1,
          field: "_sheet",
          message: `Sheet at index ${sheetIndex} not found (total sheets: ${workbook.worksheets.length})`,
        },
      ],
      data: [],
    };
  }

  // 4: Locate the first nonblank physical row without scanning past non-string content.
  let headerRowNumber = 0;
  let headerValues: unknown[] = [];
  const rowCount = sheet.rowCount;
  const columnCount = sheet.columnCount;
  for (let rowNumber = 1; rowNumber <= rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const values = Array.from({ length: columnCount }, (_, index) =>
      row.getCell(index + 1).value,
    );
    if (isBlankRow(values)) continue;

    headerRowNumber = rowNumber;
    headerValues = values;
    break;
  }

  // 5: Return an explicit structural error when no row contains a header candidate.
  if (headerRowNumber === 0) {
    return {
      success: false,
      imported: 0,
      errors: [{ row: 1, field: "_header", message: "Excel sheet contains no nonblank header row" }],
      data: [],
    };
  }

  // 6: Match every requested field and fail closed before parsing any data rows.
  const { indexByKey: colIndexMap, missingColumns } = mapHeaders(headerValues, columns);
  if (missingColumns.length > 0) {
    const headerErrors = missingColumns.map((column) => ({
      row: headerRowNumber,
      field: column.key,
      message: `Column "${column.header}" not found in Excel header`,
    }));
    return { success: false, imported: 0, errors: headerErrors, data: [] };
  }

  // 7: Parse following rows using zero-based column mappings and physical source rows.
  for (let rowNumber = headerRowNumber + 1; rowNumber <= rowCount; rowNumber++) {
    const row = sheet.getRow(rowNumber);
    const record: Record<string, unknown> = {};

    for (const [key, colIdx] of colIndexMap) {
      const rawValue = row.getCell(colIdx + 1).value;
      // ExcelJS returns null for empty cells and undefined for uninitialized cells.
      record[key] = rawValue ?? "";
    }

    data.push(record as T);
  }

  return {
    success: true,
    imported: data.length,
    errors: [],
    data,
  };
}

// ─── Download Helper ───────────────────────────────────────────────────────────

/**
 * Wrap an Excel buffer in a Response with proper Content-Disposition for file download.
 */
export function downloadExcelResponse(
  buffer: Buffer,
  filename: string,
): Response {
  const name = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  return createDownloadResponse(buffer, name, EXCEL_MIME_TYPE);
}

// ─── Exporter / Importer Objects ───────────────────────────────────────────────

export const excelExporter: DataExporter<Record<string, unknown>> = {
  export() {
    throw new Error(
      "excelExporter.export() is synchronous. Use exportExcel() async instead.",
    );
  },
};

export const excelImporter: DataImporter<Record<string, unknown>> = {
  import() {
    throw new Error(
      "excelImporter.import() is synchronous. Use parseExcel() async instead.",
    );
  },
};
