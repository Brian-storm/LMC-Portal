/**
 * Registrant (User) import logic for the preview-then-confirm flow.
 *
 * Responsibilities:
 * - Parse CSV/Excel files into structured rows
 * - Validate each row (email format, required fields, check for duplicates in DB)
 * - Build the mapping between file columns and User model fields
 */
import { Prisma, type PrismaClient } from "@prisma/client";
import {
  type ExportColumn,
  type ImportError,
  type ImportTable,
  type ImportTableColumn,
  type ImportTableResult,
} from "@/lib/data/types";
import { parseCsvTable } from "@/lib/data/csv";
import { parseExcelTable } from "@/lib/data/excel";
import { prisma } from "@/lib/prisma";
import {
  suggestColumnMapping,
  validateColumnMapping,
  type SourceColumnMapping,
  type TargetFieldDefinition,
} from "./mapping";

// ─── Types ──────────────────────────────────────────────────────────────────

/** A single row parsed from the import file (before validation). */
export interface RegistrantImportRow {
  nameZh: string;
  nameEn: string;
  email: string;
  phone: string;
  idDocNumber: string;
  idDocType: string;
  iaLicense: string;
  organization: string;
}

/** A mapped roster record paired with its original physical source row number. */
export interface SourceRegistrantImportRow extends RegistrantImportRow {
  rowNumber: number;
}

/** A row after validation, with computed status. */
export interface ValidatedRow extends SourceRegistrantImportRow {
  errors: ImportError[];
  valid: boolean;
}

/** Preview result returned from the preview API. */
export interface ImportPreview {
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: ValidatedRow[];
  errors: ImportError[];
}

/** Confirm result returned from the confirm API. */
export interface ImportConfirmResult {
  imported: number;
  failed: number;
  errors: ImportError[];
}

// ─── Column definitions for CSV/Excel ──────────────────────────────────────

/** Columns for the import file (matching RegistrantImportRow fields). */
export const REGISTRANT_IMPORT_COLUMNS: ExportColumn<Record<string, unknown>>[] = [
  { key: "nameZh", header: "Chinese Name (中文姓名)", width: 20 },
  { key: "nameEn", header: "English Name (英文姓名)", width: 24 },
  { key: "email", header: "Email (電郵)", width: 30 },
  { key: "phone", header: "Phone (電話)", width: 18 },
  { key: "idDocNumber", header: "ID Document No. (證件號碼)", width: 22 },
  { key: "idDocType", header: "ID Doc Type (證件類型)", width: 16 },
  { key: "iaLicense", header: "IA License (IA牌照)", width: 20 },
  { key: "organization", header: "Organization (機構)", width: 24 },
];

/** Business destinations required to create a student profile. */
export const REQUIRED_REGISTRANT_FIELDS = [
  "nameZh",
  "nameEn",
  "email",
  "phone",
  "idDocNumber",
] as const;

/** Target metadata shared by auto-suggestions and untrusted mapping validation. */
export const REGISTRANT_MAPPING_TARGETS: TargetFieldDefinition[] =
  REGISTRANT_IMPORT_COLUMNS.map((column) => ({
    key: column.key,
    header: column.header,
    required: REQUIRED_REGISTRANT_FIELDS.includes(
      column.key as (typeof REQUIRED_REGISTRANT_FIELDS)[number],
    ),
  }));

/** Suggest only unique, exact matches against the canonical student import headers. */
export function suggestRegistrantColumnMapping(
  sourceColumns: readonly ImportTableColumn[],
): SourceColumnMapping[] {
  // 1: Delegate normalization and duplicate-label handling to the pure mapping utility.
  return suggestColumnMapping(sourceColumns, REGISTRANT_MAPPING_TARGETS);
}

/** Validate browser-provided mappings against the parsed file and student-field allowlist. */
export function validateRegistrantColumnMapping(
  sourceColumns: readonly ImportTableColumn[],
  mapping: unknown,
) {
  // 1: Keep all source bounds, uniqueness, and required-field checks in one shared utility.
  return validateColumnMapping(sourceColumns, mapping, REGISTRANT_MAPPING_TARGETS);
}

// ─── Validation ─────────────────────────────────────────────────────────────

/** Email regex (simple but practical for import validation). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Phone regex — allows +852 or local format, digits, spaces, hyphens. */
const PHONE_RE = /^[+\d\s\-()]{6,20}$/;

/** HKID format: 1-2 uppercase letters + 6 digits + 1 check digit. */
const HKID_RE = /^[A-Z]{1,2}\d{6}[0-9A]$/;

/**
 * Validate a single import row against business rules.
 * Checks required fields, format constraints, and returns all errors found.
 */
export function validateRegistrantRow(
  row: RegistrantImportRow,
  existingEmails: Set<string>,
  existingIdDocs: Set<string>,
  existingLicenses: Set<string>,
): ImportError[] {
  const errors: ImportError[] = [];

  // 1: Required field checks
  if (!row.nameZh?.trim()) {
    errors.push({ row: 0, field: "nameZh", message: "Chinese name is required" });
  }
  if (!row.nameEn?.trim()) {
    errors.push({ row: 0, field: "nameEn", message: "English name is required" });
  }
  if (!row.email?.trim()) {
    errors.push({ row: 0, field: "email", message: "Email is required" });
  }
  if (!row.phone?.trim()) {
    errors.push({ row: 0, field: "phone", message: "Phone is required" });
  }
  if (!row.idDocNumber?.trim()) {
    errors.push({ row: 0, field: "idDocNumber", message: "ID document number is required" });
  }

  // 2: Format validation (only if field has a value)
  if (row.email?.trim() && !EMAIL_RE.test(row.email.trim())) {
    errors.push({ row: 0, field: "email", message: "Invalid email format" });
  }
  if (row.phone?.trim() && !PHONE_RE.test(row.phone.trim())) {
    errors.push({ row: 0, field: "phone", message: "Invalid phone format" });
  }
  if (row.idDocType?.trim()) {
    // Normalize to uppercase for comparison
    const docType = row.idDocType.trim().toUpperCase();
    // Map common variations to standard values
    const normalized = normalizeIdDocType(docType);
    if (!normalized) {
      errors.push({
        row: 0,
        field: "idDocType",
        message: "Invalid ID document type. Must be HKID, PASSPORT, PERMIT, or OTHER",
      });
    }
  }
  if (row.idDocNumber?.trim()) {
    const docType = (row.idDocType?.trim().toUpperCase() || "HKID");
    const normalizedType = normalizeIdDocType(docType) || "HKID";
    if (normalizedType === "HKID" && !HKID_RE.test(row.idDocNumber.trim().toUpperCase())) {
      errors.push({
        row: 0,
        field: "idDocNumber",
        message: "Invalid HKID format. Expected format: A1234567",
      });
    }
  }

  // 3: Duplicate checks against existing database values
  if (row.email?.trim() && existingEmails.has(row.email.trim().toLowerCase())) {
    errors.push({
      row: 0,
      field: "email",
      message: "Email already exists in the system or this import",
    });
  }
  if (row.idDocNumber?.trim() && existingIdDocs.has(row.idDocNumber.trim().toUpperCase())) {
    errors.push({
      row: 0,
      field: "idDocNumber",
      message: "ID document number already exists in the system or this import",
    });
  }
  if (row.iaLicense?.trim() && existingLicenses.has(row.iaLicense.trim().toUpperCase())) {
    errors.push({
      row: 0,
      field: "iaLicense",
      message: "IA license already exists in the system or this import",
    });
  }

  return errors;
}

/**
 * Normalize an ID document type string to the standard enum value.
 * Returns the standard value or null if unrecognized.
 */
function normalizeIdDocType(input: string): string | null {
  const upper = input.toUpperCase();
  if (upper === "HKID" || upper === "HONG KONG ID" || upper === "身份證" || upper === "香港身份證") {
    return "HKID";
  }
  if (upper === "PASSPORT" || upper === "護照") {
    return "PASSPORT";
  }
  if (upper === "PERMIT" || upper === "通行證") {
    return "PERMIT";
  }
  if (upper === "OTHER" || upper === "其他") {
    return "OTHER";
  }
  return null;
}

// ─── File Parsing ──────────────────────────────────────────────────────────

/**
 * Parse an uploaded CSV/XLSX file into the AF-019 raw source-table contract.
 *
 * @param buffer - Uploaded file bytes.
 * @param filename - Original filename, used only to select the parser.
 * @returns Raw source columns and rows without applying business-field mapping.
 */
export async function parseRegistrantFile(
  buffer: Buffer,
  filename: string,
): Promise<ImportTableResult> {
  // 1: Select a parser from the normalized extension and reject unsupported names explicitly.
  const normalizedFilename = filename.toLowerCase();
  if (normalizedFilename.endsWith(".xlsx")) {
    return parseExcelTable(new Uint8Array(buffer));
  }
  if (normalizedFilename.endsWith(".csv")) {
    return parseCsvTable(buffer.toString("utf-8"));
  }

  return {
    success: false,
    table: null,
    errors: [{ row: 1, field: "_file", message: "Unsupported import file type" }],
  };
}

/** Convert ExcelJS values to safe, displayable cell text without evaluating formulas. */
export function formatRegistrantCellValue(value: unknown): string {
  // 1: Normalize empty, date, and primitive values before handling ExcelJS rich cell objects.
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  // 2: Read known ExcelJS display wrappers without exposing object internals.
  if (typeof value === "object") {
    const cellValue = value as {
      text?: unknown;
      result?: unknown;
      error?: unknown;
      richText?: Array<{ text?: unknown }>;
    };
    if (typeof cellValue.text === "string") return cellValue.text;
    if (Array.isArray(cellValue.richText)) {
      return cellValue.richText.map((part) => String(part.text ?? "")).join("");
    }
    if ("result" in cellValue) return formatRegistrantCellValue(cellValue.result);
    if (typeof cellValue.error === "string") return cellValue.error;
  }

  return String(value);
}

/** Apply a validated source-index mapping to raw table rows and retain physical row numbers. */
export function mapRegistrantTableRows(
  table: ImportTable,
  mapping: readonly SourceColumnMapping[],
): SourceRegistrantImportRow[] {
  // 1: Create an empty destination record for each source row.
  return table.rows.map((sourceRow) => {
    const row: RegistrantImportRow = {
      nameZh: "",
      nameEn: "",
      email: "",
      phone: "",
      idDocNumber: "",
      idDocType: "",
      iaLicense: "",
      organization: "",
    };

    // 2: Populate only the target fields explicitly selected by the admin.
    for (const columnMapping of mapping) {
      row[columnMapping.targetField as keyof RegistrantImportRow] = formatRegistrantCellValue(
        sourceRow.values[columnMapping.sourceIndex],
      );
    }

    return { ...row, rowNumber: sourceRow.rowNumber };
  });
}

/**
 * Load existing unique values from the User table for duplicate detection.
 */
export async function loadExistingUserValues(): Promise<{
  emails: Set<string>;
  idDocs: Set<string>;
  licenses: Set<string>;
}> {
  const users = await prisma.user.findMany({
    select: { email: true, idDocNumber: true, iaLicense: true },
  });

  const emails = new Set<string>();
  const idDocs = new Set<string>();
  const licenses = new Set<string>();

  for (const user of users) {
    emails.add(user.email.trim().toLowerCase());
    idDocs.add(user.idDocNumber.trim().toUpperCase());
    if (user.iaLicense) licenses.add(user.iaLicense.trim().toUpperCase());
  }

  return { emails, idDocs, licenses };
}

/** Existing unique-value indexes used during a complete import validation pass. */
export interface ExistingRegistrantValues {
  emails: Set<string>;
  idDocs: Set<string>;
  licenses: Set<string>;
}

/** Validate rows in source order and detect duplicates within the same uploaded file. */
export function validateRegistrantRows(
  rows: readonly SourceRegistrantImportRow[],
  existingValues: ExistingRegistrantValues,
): ValidatedRow[] {
  // 1: Copy database indexes so per-file duplicate tracking cannot mutate shared input sets.
  const emails = new Set(existingValues.emails);
  const idDocs = new Set(existingValues.idDocs);
  const licenses = new Set(existingValues.licenses);
  const validated: ValidatedRow[] = [];

  // 2: Validate one row, retain its physical row number, then add keys for later rows.
  for (const row of rows) {
    const errors = validateRegistrantRow(row, emails, idDocs, licenses).map((error) => ({
      ...error,
      row: row.rowNumber,
    }));
    validated.push({ ...row, errors, valid: errors.length === 0 });

    // 3: Normalize every populated unique value before the next source row is checked.
    if (row.email?.trim()) emails.add(row.email.trim().toLowerCase());
    if (row.idDocNumber?.trim()) idDocs.add(row.idDocNumber.trim().toUpperCase());
    if (row.iaLicense?.trim()) licenses.add(row.iaLicense.trim().toUpperCase());
  }

  return validated;
}

/** Load current database values and validate every mapped row before preview or confirmation. */
export async function validateAllRows(
  rows: readonly SourceRegistrantImportRow[],
): Promise<ValidatedRow[]> {
  // 1: Load existing values for database duplicate detection.
  const existingValues = await loadExistingUserValues();

  // 2: Share the same ordered validation rules between preview and confirm.
  return validateRegistrantRows(rows, existingValues);
}

/** A duplicate detected again during confirmation; all transaction writes are rolled back. */
export class RegistrantImportConflictError extends Error {
  constructor(readonly errors: ImportError[], readonly failedCount = errors.length) {
    super("The import conflicts with existing student data");
    this.name = "RegistrantImportConflictError";
  }
}

/** Create valid student rows without catching individual database errors inside the transaction. */
export async function createUsersAtomically(
  rows: readonly ValidatedRow[],
  database: Pick<PrismaClient, "$transaction"> = prisma,
): Promise<void> {
  // 1: Fail before opening a transaction if any input row is invalid or the batch is empty.
  const invalidRows = rows.filter((row) => !row.valid || row.errors.length > 0);
  if (invalidRows.length > 0) {
    throw new RegistrantImportConflictError(
      invalidRows.flatMap((row) => row.errors),
      rows.length,
    );
  }
  if (rows.length === 0) {
    throw new RegistrantImportConflictError([
      { row: 1, field: "_file", message: "No valid data rows are available to import" },
    ]);
  }

  // 2: Re-check identities and create all Users in one serializable database transaction.
  await database.$transaction(
    async (transaction) => createUsersInTransaction(transaction, rows),
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

/** Write the complete batch using an active transaction client; let any error abort the batch. */
export async function createUsersInTransaction(
  transaction: Prisma.TransactionClient,
  rows: readonly ValidatedRow[],
): Promise<void> {
  // 1: Track the batch's identity keys as a second line of defense before each write.
  const batchEmails = new Set<string>();
  const batchIdDocs = new Set<string>();
  const batchLicenses = new Set<string>();

  // 2: Check both database and same-batch identities, then create only new STUDENT users.
  for (const row of rows) {
    const email = row.email.trim().toLowerCase();
    const idDocNumber = row.idDocNumber.trim().toUpperCase();
    const iaLicense = row.iaLicense.trim().toUpperCase();

    if (batchEmails.has(email)) {
      throw createImportConflict(row.rowNumber, "email", rows.length);
    }
    if (batchIdDocs.has(idDocNumber)) {
      throw createImportConflict(row.rowNumber, "idDocNumber", rows.length);
    }
    if (iaLicense && batchLicenses.has(iaLicense)) {
      throw createImportConflict(row.rowNumber, "iaLicense", rows.length);
    }

    // 3: Query all identity boundaries again inside the transaction to protect confirmation races.
    const identityConditions: Prisma.UserWhereInput[] = [
      { email: { equals: email, mode: "insensitive" } },
      { idDocNumber: { equals: idDocNumber, mode: "insensitive" } },
    ];
    if (iaLicense) {
      identityConditions.push({ iaLicense: { equals: iaLicense, mode: "insensitive" } });
    }
    const existingUser = await transaction.user.findFirst({
      where: { OR: identityConditions },
      select: { email: true, idDocNumber: true, iaLicense: true },
    });
    if (existingUser) {
      const field =
        existingUser.email.trim().toLowerCase() === email
          ? "email"
          : existingUser.idDocNumber.trim().toUpperCase() === idDocNumber
            ? "idDocNumber"
            : "iaLicense";
      throw createImportConflict(row.rowNumber, field, rows.length);
    }

    // 4: Convert the already-validated document type to the database enum and create a new user.
    const documentType = normalizeIdDocType(row.idDocType.trim().toUpperCase()) as
      | "HKID"
      | "PASSPORT"
      | "PERMIT"
      | "OTHER"
      | null;
    await transaction.user.create({
      data: {
        nameZh: row.nameZh.trim(),
        nameEn: row.nameEn.trim(),
        email,
        phone: row.phone.trim(),
        idDocNumber: row.idDocNumber.trim(),
        idDocType: documentType,
        iaLicense: row.iaLicense.trim() || null,
        organization: row.organization.trim() || null,
        role: "STUDENT",
      },
    });

    // 5: Reserve this batch's values so any later repeated row aborts the transaction.
    batchEmails.add(email);
    batchIdDocs.add(idDocNumber);
    if (iaLicense) batchLicenses.add(iaLicense);
  }
}

/** Create a PII-free row error for identity conflicts. */
function createImportConflict(
  rowNumber: number,
  field: string,
  failedCount: number,
): RegistrantImportConflictError {
  // 1: Return only the source row and field, never the uploaded value itself.
  return new RegistrantImportConflictError(
    [{ row: rowNumber, field, message: "An existing or duplicate profile uses this value" }],
    failedCount,
  );
}
