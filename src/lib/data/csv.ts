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
  type ImportError,
  type DataExporter,
  type DataImporter,
  createDownloadResponse,
  CSV_MIME_TYPE,
} from "./types";

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
 * Parse a CSV string into an array of objects.
 *
 * @param csv     - Raw CSV string (may or may not include BOM).
 * @param columns - Column definitions; header names are matched case-insensitively.
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

  // 2: Split into lines, handling potential trailing newline
  const lines = cleaned.split(/\r?\n/);
  if (lines.length === 0) {
    return { success: false, imported: 0, errors: [], data: [] };
  }

  // 3: Parse header line → build case-insensitive column lookup
  const headerLine = lines[0]!;
  const headerFields = parseCsvLine(headerLine);
  const headerIndex = new Map<string, number>();
  headerFields.forEach((h, i) => {
    headerIndex.set(h.trim().toLowerCase(), i);
  });

  // Build column → source column index mapping
  const colIndexMap = new Map<keyof T & string, number>();
  for (const col of columns) {
    const idx = headerIndex.get(col.header.toLowerCase());
    if (idx !== undefined) {
      colIndexMap.set(col.key, idx);
    } else {
      // Header not found — flag as error but continue
      errors.push({
        row: 1,
        field: col.key,
        message: `Column "${col.header}" not found in CSV header`,
      });
    }
  }

  // 4: Parse data rows (skip header line)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined || line.trim() === "") continue;

    const rowNum = i + 1; // 1-based row in original file
    const fields = parseCsvLine(line);
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