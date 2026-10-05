import type { ExportColumn } from "./types";

/** A resolved source-column index for each requested object key. */
export interface HeaderMapping<T extends Record<string, unknown>> {
  indexByKey: Map<keyof T & string, number>;
  missingColumns: ExportColumn<T>[];
}

/** Determine whether a source row contains only empty or whitespace-only cells. */
export function isBlankRow(values: readonly unknown[]): boolean {
  // 1: Treat absent cells and whitespace-only strings as empty; other values are content.
  return values.every(
    (value) =>
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === ""),
  );
}

/** Match requested columns against a source header row without depending on its order or casing. */
export function mapHeaders<T extends Record<string, unknown>>(
  values: readonly unknown[],
  columns: readonly ExportColumn<T>[],
): HeaderMapping<T> {
  // 1: Index nonblank textual source headers using the shared normalization rule.
  const indexByHeader = new Map<string, number>();
  values.forEach((value, index) => {
    if (typeof value !== "string" && typeof value !== "number") return;

    const normalizedHeader = String(value).trim().toLowerCase();
    if (normalizedHeader) indexByHeader.set(normalizedHeader, index);
  });

  // 2: Resolve every requested field and collect missing schema headers.
  const indexByKey = new Map<keyof T & string, number>();
  const missingColumns: ExportColumn<T>[] = [];
  for (const column of columns) {
    const index = indexByHeader.get(column.header.trim().toLowerCase());
    if (index === undefined) {
      missingColumns.push(column);
    } else {
      indexByKey.set(column.key, index);
    }
  }

  return { indexByKey, missingColumns };
}
