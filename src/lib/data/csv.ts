/**
 * CSV export/import utilities.
 *
 * - Export: array of objects → UTF-8 BOM CSV string
 * - Import: CSV string → array of objects with validation
 * - Download helper: wrap CSV string in a Response with Content-Disposition
 */
import {
  type ExportColumn,
  type ImportResult,
  type ImportTableResult,
  type ImportError,
  type DataExporter,
  type DataImporter,
  createDownloadResponse,
  CSV_MIME_TYPE,
} from "./types";
import { isBlankRow, mapHeaders } from "./parser-utils";

// ─── Export ────────────────────────────────────────────────────────────────────

/**
 * Convert an array of objects to a CSV string (UTF-8 BOM, double-quote escaping).
 *
 * @param items  - Array of data objects.
 * @param columns - Column definitions mapping keys → headers.
 * @returns CSV string with leading BOM.
 */
export function exportCsv<T extends Record<string, unknown>>(
  items: T[],
  columns: ExportColumn<T>[],
): string {
  // 1: Write header row
  const headers = columns.map((c) => c.header);

  // 2: Write data rows
  const rows = items.map((item) =>
    columns.map((col) => {
      const raw = item[col.key];
      const str = raw == null ? "" : String(raw);
      return escapeCsvField(str);
    }),
  );

  // 3: Assemble CSV with UTF-8 BOM
  const bom = "\uFEFF";
  const lines = [headers.join(","), ...rows.map((r) => r.join(","))];
  return bom + lines.join("\n");
}

/**
 * Escape a single CSV field value.
 * Wraps in double quotes if the value contains commas, double-quotes, or newlines.
 */
function escapeCsvField(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    // Double any internal double-quotes, then wrap in double-quotes
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ─── Import ────────────────────────────────────────────────────────────────────

/**
 * Parse CSV into a raw source table while preserving source columns and physical row numbers.
 *
 * @param csv - Raw CSV string, optionally prefixed with a UTF-8 BOM.
 * @returns Source table data without applying any business-field mapping.
 */
export function parseCsvTable(csv: string): ImportTableResult {
  // 1: Remove the optional BOM and split the input into physical source lines.
  const cleaned = csv.replace(/^\uFEFF/, "");
  const lines = cleaned.split(/\r\n?|\n/);
  let headerLineIndex = -1;
  let headerFields: string[] = [];

  // 2: Use only the first nonblank physical line as the source-header candidate.
  for (let index = 0; index < lines.length; index++) {
    const fields = parseCsvLine(lines[index] ?? "");
    if (isBlankRow(fields)) continue;

    headerLineIndex = index;
    headerFields = fields;
    break;
  }

  // 3: Return a structural error when the file has no nonblank candidate row.
  if (headerLineIndex === -1) {
    return {
      success: false,
      table: null,
      errors: [{ row: 1, field: "_header", message: "CSV file contains no nonblank header row" }],
    };
  }

  // 4: Collect nonblank data rows and measure the widest source row.
  let columnCount = headerFields.length;
  const rows: Array<{ rowNumber: number; values: string[] }> = [];
  for (let index = headerLineIndex + 1; index < lines.length; index++) {
    const values = parseCsvLine(lines[index] ?? "");
    if (isBlankRow(values)) continue;

    columnCount = Math.max(columnCount, values.length);
    rows.push({ rowNumber: index + 1, values });
  }

  // 5: Build stable indexed columns and pad short rows without trimming raw cell values.
  const columns = Array.from({ length: columnCount }, (_, index) => ({
    index,
    header: headerFields[index] ?? "",
  }));
  const paddedRows = rows.map((row) => ({
    rowNumber: row.rowNumber,
    values: Array.from({ length: columnCount }, (_, index) => row.values[index] ?? ""),
  }));

  return { success: true, table: { columns, rows: paddedRows }, errors: [] };
}

/**
 * Parse a CSV string into an array of objects.
 *
 * @param csv     - Raw CSV string (may or may not include BOM).
 * @param columns - Column definitions; header names are matched case-insensitively and by name.
 * @returns ImportResult with parsed data and any errors.
 */
export function parseCsv<T extends Record<string, unknown>>(
  csv: string,
  columns: ExportColumn<T>[],
): ImportResult<T> {
  const errors: ImportError[] = [];
  const data: T[] = [];

  // 1: Strip BOM if present
  const cleaned = csv.replace(/^\uFEFF/, "");

  // 2: Split physical rows and locate only the first nonblank row as the header candidate.
  const lines = cleaned.split(/\r\n?|\n/);
  let headerLineIndex = -1;
  let headerFields: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i] ?? "");
    if (isBlankRow(fields)) continue;

    headerLineIndex = i;
    headerFields = fields;
    break;
  }

  // 3: Return a structural error when no nonblank row can serve as the header.
  if (headerLineIndex === -1) {
    return {
      success: false,
      imported: 0,
      errors: [{ row: 1, field: "_header", message: "CSV file contains no nonblank header row" }],
      data: [],
    };
  }

  // 4: Match all declared columns and reject an incomplete header before reading data.
  const { indexByKey: colIndexMap, missingColumns } = mapHeaders(headerFields, columns);
  if (missingColumns.length > 0) {
    const headerRow = headerLineIndex + 1;
    const headerErrors = missingColumns.map((column) => ({
      row: headerRow,
      field: column.key,
      message: `Column "${column.header}" not found in CSV header`,
    }));
    return { success: false, imported: 0, errors: headerErrors, data: [] };
  }

  // 5: Parse data rows after the header while retaining physical source row numbers.
  for (let i = headerLineIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) continue;

    const rowNum = i + 1; // 1-based row in original file
    const fields = parseCsvLine(line);
    if (isBlankRow(fields)) continue;
    const record: Record<string, unknown> = {};

    let rowHasError = false;
    for (const [key, colIdx] of colIndexMap) {
      const rawValue = fields[colIdx];
      if (rawValue === undefined) {
        errors.push({
          row: rowNum,
          field: key,
          message: `Missing value for column "${key}" at row ${rowNum}`,
        });
        rowHasError = true;
        continue;
      }
      record[key] = rawValue.trim();
    }

    data.push(record as T);

    if (rowHasError) {
      errors.push({
        row: rowNum,
        field: "_row",
        message: `Row ${rowNum} has missing fields`,
      });
    }
  }

  return {
    success: errors.length === 0,
    imported: data.length - errors.length,
    errors,
    data,
  };
}

/**
 * Parse a single CSV line into field values, respecting double-quote escaping.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;

    if (inQuotes) {
      if (char === '"') {
        // Check for escaped double-quotes
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }

  // Push final field
  fields.push(current);

  return fields;
}

// ─── Download Helper ───────────────────────────────────────────────────────────

/**
 * Wrap a CSV string in a Response with proper Content-Disposition for file download.
 */
export function downloadCsvResponse(
  csv: string,
  filename: string,
): Response {
  // Ensure filename ends with .csv
  const name = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  return createDownloadResponse(csv, name, CSV_MIME_TYPE);
}

// ─── Exporter / Importer Objects ───────────────────────────────────────────────

export const csvExporter: DataExporter<Record<string, unknown>> = {
  export(items, columns) {
    return exportCsv(items, columns);
  },
};

export const csvImporter: DataImporter<Record<string, unknown>> = {
  import(raw, columns) {
    const csv = typeof raw === "string" ? raw : Buffer.from(raw).toString("utf-8");
    return parseCsv(csv, columns);
  },
};
