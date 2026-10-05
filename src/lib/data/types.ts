/**
 * Shared type definitions for data import/export (CSV & Excel).
 */
export interface ExportColumn<T extends Record<string, unknown>> {
  /** Key on the source object */
  key: keyof T & string;
  /** Column header text for CSV/Excel */
  header: string;
  /** Excel column width (optional) */
  width?: number;
  /** Excel number format string (e.g. "yyyy-mm-dd") */
  format?: string;
}

export interface ImportError {
  /** 1-based row number where the error occurred */
  row: number;
  /** Field name that caused the error */
  field: string;
  /** Human-readable error description */
  message: string;
}

export interface ImportResult<T extends Record<string, unknown>> {
  /** Whether the entire import succeeded */
  success: boolean;
  /** Number of successfully imported records */
  imported: number;
  /** List of errors encountered during import */
  errors: ImportError[];
  /** Parsed records (present regardless of errors) */
  data?: T[];
}

/** One source column from an uploaded CSV/XLSX table. */
export interface ImportTableColumn {
  /** Stable zero-based source-column position. */
  index: number;
  /** Original displayed header text; duplicates remain separate by index. */
  header: string;
}

/** One source row from an uploaded CSV/XLSX table. */
export interface ImportTableRow {
  /** Original one-based row number in the file. */
  rowNumber: number;
  /** Raw cell values ordered by zero-based source-column index. */
  values: unknown[];
}

/** Raw source table shape for callers that perform their own business-field mapping. */
export interface ImportTable {
  columns: ImportTableColumn[];
  rows: ImportTableRow[];
}

/** Result of parsing a raw source table before any business-field mapping is applied. */
export interface ImportTableResult {
  success: boolean;
  table: ImportTable | null;
  errors: ImportError[];
}

/**
 * Interface for data export implementations.
 */
export interface DataExporter<T extends Record<string, unknown>> {
  /** Export items to a string (CSV) or Buffer (Excel) */
  export(items: T[], columns: ExportColumn<T>[]): string | Buffer;
}

/**
 * Interface for data import implementations.
 */
export interface DataImporter<T extends Record<string, unknown>> {
  /** Parse raw input (CSV string or Excel Buffer) into structured data */
  import(
    raw: string | Buffer,
    columns: ExportColumn<T>[],
  ): ImportResult<T>;
}

/**
 * Default Excel column width used when none is specified.
 */
export const DEFAULT_COLUMN_WIDTH = 20;

/**
 * MIME type for Excel files used in Content-Type headers.
 */
export const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/**
 * MIME type for CSV files used in Content-Type headers.
 */
export const CSV_MIME_TYPE = "text/csv; charset=utf-8";

/**
 * Build a Response object that triggers a file download in the browser.
 * Works for both CSV (string) and Excel (Buffer) payloads.
 */
export function createDownloadResponse(
  payload: string | Buffer,
  filename: string,
  contentType: string,
): Response {
  // Wrap string in Uint8Array so the Response constructor treats it as binary
  const body = typeof payload === "string" ? new TextEncoder().encode(payload) : new Uint8Array(payload);
  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(body.byteLength),
    },
  });
}
