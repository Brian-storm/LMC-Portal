import type { ImportError, ImportTableColumn } from "../types";

/** Business destination for one selected upload column. */
export interface SourceColumnMapping {
  sourceIndex: number;
  targetField: string;
}

/** Target metadata used to suggest and validate source-column mappings. */
export interface TargetFieldDefinition {
  key: string;
  header: string;
  required: boolean;
}

/** Mapping validation result returned before any row data is applied. */
export interface ColumnMappingValidation {
  valid: boolean;
  mapping: SourceColumnMapping[];
  errors: ImportError[];
}

/** Normalize header labels only for exact, case-insensitive automatic suggestions. */
function normalizeHeader(header: string): string {
  // 1: Ignore surrounding whitespace and casing but do not perform fuzzy matching.
  return header.trim().toLowerCase();
}

/** Suggest only unique exact header matches and retain the source column index. */
export function suggestColumnMapping(
  sourceColumns: readonly ImportTableColumn[],
  targetFields: readonly TargetFieldDefinition[],
): SourceColumnMapping[] {
  // 1: Group source indices by normalized label so duplicate labels remain ambiguous.
  const sourceIndicesByHeader = new Map<string, number[]>();
  for (const sourceColumn of sourceColumns) {
    const normalizedHeader = normalizeHeader(sourceColumn.header);
    if (!normalizedHeader) continue;

    const matches = sourceIndicesByHeader.get(normalizedHeader) ?? [];
    matches.push(sourceColumn.index);
    sourceIndicesByHeader.set(normalizedHeader, matches);
  }

  // 2: Suggest a mapping only when one source column uniquely matches one target.
  const usedSourceIndices = new Set<number>();
  const suggested: SourceColumnMapping[] = [];
  for (const targetField of targetFields) {
    const normalizedHeader = normalizeHeader(targetField.header);
    const matchingIndices = sourceIndicesByHeader.get(normalizedHeader) ?? [];
    if (matchingIndices.length !== 1) continue;

    const sourceIndex = matchingIndices[0];
    if (sourceIndex === undefined || usedSourceIndices.has(sourceIndex)) continue;

    usedSourceIndices.add(sourceIndex);
    suggested.push({ sourceIndex, targetField: targetField.key });
  }

  return suggested;
}

/** Validate untrusted source-index mappings against the uploaded columns and target allowlist. */
export function validateColumnMapping(
  sourceColumns: readonly ImportTableColumn[],
  value: unknown,
  targetFields: readonly TargetFieldDefinition[],
): ColumnMappingValidation {
  // 1: Reject malformed containers before inspecting individual mapping entries.
  if (!Array.isArray(value)) {
    return {
      valid: false,
      mapping: [],
      errors: [{ row: 1, field: "_mapping", message: "Column mapping must be an array" }],
    };
  }
  if (value.length > targetFields.length) {
    return {
      valid: false,
      mapping: [],
      errors: [{ row: 1, field: "_mapping", message: "Too many source-column mappings" }],
    };
  }

  // 2: Build allowlists and tracking sets from the parsed file and business schema.
  const sourceIndices = new Set(sourceColumns.map((column) => column.index));
  const targetByKey = new Map(targetFields.map((field) => [field.key, field]));
  const usedSourceIndices = new Set<number>();
  const usedTargetFields = new Set<string>();
  const mapping: SourceColumnMapping[] = [];
  const errors: ImportError[] = [];

  // 3: Validate each untrusted entry and reject duplicate source or destination assignments.
  value.forEach((entry: unknown, index: number) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      errors.push({
        row: 1,
        field: `_mapping.${index}`,
        message: "Mapping entry must contain a source index and target field",
      });
      return;
    }

    const candidate = entry as Record<string, unknown>;
    const sourceIndex = candidate.sourceIndex;
    const targetField = candidate.targetField;

    if (typeof sourceIndex !== "number" || !Number.isSafeInteger(sourceIndex) || !sourceIndices.has(sourceIndex)) {
      errors.push({
        row: 1,
        field: "sourceIndex",
        message: "Source column index is invalid or not present in the uploaded file",
      });
      return;
    }
    if (typeof targetField !== "string" || !targetByKey.has(targetField)) {
      errors.push({ row: 1, field: "targetField", message: "Unknown target field" });
      return;
    }
    if (usedSourceIndices.has(sourceIndex)) {
      errors.push({
        row: 1,
        field: "sourceIndex",
        message: "Source column is already assigned to another target",
      });
      return;
    }
    if (usedTargetFields.has(targetField)) {
      errors.push({
        row: 1,
        field: targetField,
        message: "Target field is already mapped",
      });
      return;
    }

    usedSourceIndices.add(sourceIndex);
    usedTargetFields.add(targetField);
    mapping.push({ sourceIndex, targetField });
  });

  // 4: Require exactly one source for each required destination; optional targets may be absent.
  for (const targetField of targetFields) {
    if (targetField.required && !usedTargetFields.has(targetField.key)) {
      errors.push({
        row: 1,
        field: targetField.key,
        message: `Required field "${targetField.key}" must be mapped`,
      });
    }
  }

  return { valid: errors.length === 0, mapping, errors };
}
