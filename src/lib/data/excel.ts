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
  type ImportError,
  type DataExporter,
  type DataImporter,
  createDownloadResponse,
  EXCEL_MIME_TYPE,
  DEFAULT_COLUMN_WIDTH,
} from "./types";

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
  const errors: ImportError[] = [];
  const data: T[] = [];

  // 1: Load workbook
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as never);

  const sheet = workbook.worksheets[sheetIndex];
  if (!sheet) {
    return {
      success: false,
      imported: 0,
      errors: [
        {
          row: 0,
          field: "_sheet",
          message: `Sheet at index ${sheetIndex} not found (total sheets: ${workbook.worksheets.length})`,
        },
      ],
      data: [],
    };
  }

  // 2: Read rows
  const rows = sheet.getSheetValues() as unknown[][];
  if (rows.length < 2) {
    // Header only or empty
    return { success: true, imported: 0, errors: [], data: [] };
  }

  // rows[1] is typically the header row (1-based in exceljs)
  // rows[0] may be empty or contain pre-header data
  const headerIndex = new Map<string, number>();

  // Find the actual header row — first row with meaningful string content
  let headerStartRow = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i] ?? [];
    const hasHeader = r.some(
      (cell) => typeof cell === "string" && cell.trim().length > 0,
    );
    if (hasHeader) {
      headerStartRow = i;
      break;
    }
  }

  const actualHeaderRow = rows[headerStartRow] ?? [];
  actualHeaderRow.forEach((cell: unknown, idx: number) => {
    if (typeof cell === "string" || typeof cell === "number") {
      headerIndex.set(String(cell).trim().toLowerCase(), idx);
    }
  });

  // Build column → source column index mapping
  const colIndexMap = new Map<keyof T & string, number>();
  for (const col of columns) {
    const idx = headerIndex.get(col.header.toLowerCase());
    if (idx !== undefined) {
      colIndexMap.set(col.key, idx);
    } else {
      errors.push({
        row: headerStartRow + 1,
        field: col.key,
        message: `Column "${col.header}" not found in Excel header`,
      });
    }
  }

  // 3: Parse data rows (skip header row)
  for (let i = headerStartRow + 1; i < rows.length; i++) {
    const rowValues = rows[i] ?? [];
    const record: Record<string, unknown> = {};

    for (const [key, colIdx] of colIndexMap) {
      const rawValue = rowValues[colIdx];
      // exceljs returns undefined for empty cells in sparse arrays
      record[key] = rawValue ?? "";
    }

    data.push(record as T);
  }

  return {
    success: errors.length === 0,
    imported: data.length,
    errors,
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