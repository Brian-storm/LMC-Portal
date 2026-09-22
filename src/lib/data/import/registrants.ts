/**
 * Registrant (User) import logic for the preview-then-confirm flow.
 *
 * Responsibilities:
 * - Parse CSV/Excel files into structured rows
 * - Validate each row (email format, required fields, check for duplicates in DB)
 * - Build the mapping between file columns and User model fields
 */
import { type ExportColumn, type ImportError } from "@/lib/data/types";
import { parseCsv } from "@/lib/data/csv";
import { parseExcel } from "@/lib/data/excel";
import { prisma } from "@/lib/prisma";

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

/** A row after validation, with computed status. */
export interface ValidatedRow extends RegistrantImportRow {
  rowNumber: number;
  errors: ImportError[];
  valid: boolean;
}

/** Preview result returned from the preview API. */
export interface ImportPreview {
  importId: string;
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: ValidatedRow[];
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
    errors.push({ row: 0, field: "email", message: `Invalid email format: "${row.email}"` });
  }
  if (row.phone?.trim() && !PHONE_RE.test(row.phone.trim())) {
    errors.push({ row: 0, field: "phone", message: `Invalid phone format: "${row.phone}"` });
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
        message: `Invalid ID doc type: "${row.idDocType}". Must be HKID, PASSPORT, PERMIT, or OTHER`,
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
        message: `Invalid HKID format: "${row.idDocNumber}". Expected format: A1234567`,
      });
    }
  }

  // 3: Duplicate checks against existing database values
  if (row.email?.trim() && existingEmails.has(row.email.trim().toLowerCase())) {
    errors.push({
      row: 0,
      field: "email",
      message: `Email already exists: "${row.email}"`,
    });
  }
  if (row.idDocNumber?.trim() && existingIdDocs.has(row.idDocNumber.trim())) {
    errors.push({
      row: 0,
      field: "idDocNumber",
      message: `ID document number already exists: "${row.idDocNumber}"`,
    });
  }
  if (row.iaLicense?.trim() && existingLicenses.has(row.iaLicense.trim())) {
    errors.push({
      row: 0,
      field: "iaLicense",
      message: `IA license already exists: "${row.iaLicense}"`,
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
 * Parse an uploaded file buffer into an array of raw RegistrantImportRow objects.
 * Uses the shared CSV/Excel parsers from AF-019.
 */
export async function parseRegistrantFile(
  buffer: Buffer,
  filename: string,
): Promise<{ rows: RegistrantImportRow[]; errors: ImportError[] }> {
  const isExcel = filename.endsWith(".xlsx");

  let parsedResult: { data?: Record<string, unknown>[]; errors: ImportError[]; imported: number; success: boolean };

  if (isExcel) {
    parsedResult = await parseExcel<Record<string, unknown>>(new Uint8Array(buffer), REGISTRANT_IMPORT_COLUMNS);
  } else {
    const csv = buffer.toString("utf-8");
    parsedResult = parseCsv<Record<string, unknown>>(csv, REGISTRANT_IMPORT_COLUMNS);
  }

  // Map the parsed records back to RegistrantImportRow
  const rows: RegistrantImportRow[] = (parsedResult.data ?? []).map((r) => ({
    nameZh: String(r.nameZh ?? ""),
    nameEn: String(r.nameEn ?? ""),
    email: String(r.email ?? ""),
    phone: String(r.phone ?? ""),
    idDocNumber: String(r.idDocNumber ?? ""),
    idDocType: String(r.idDocType ?? ""),
    iaLicense: String(r.iaLicense ?? ""),
    organization: String(r.organization ?? ""),
  }));

  return { rows, errors: parsedResult.errors };
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
    emails.add(user.email.toLowerCase());
    idDocs.add(user.idDocNumber);
    if (user.iaLicense) licenses.add(user.iaLicense);
  }

  return { emails, idDocs, licenses };
}

/**
 * Validate all parsed rows against business rules and existing DB values.
 * Returns validated rows with per-row error lists.
 */
export async function validateAllRows(
  rows: RegistrantImportRow[],
): Promise<ValidatedRow[]> {
  // 1: Load existing values for duplicate detection
  const { emails, idDocs, licenses } = await loadExistingUserValues();

  // 2: Validate each row
  const validated: ValidatedRow[] = rows.map((row, index) => {
    const errors = validateRegistrantRow(row, emails, idDocs, licenses);
    return {
      ...row,
      rowNumber: index + 1,
      errors,
      valid: errors.length === 0,
    };
  });

  // 3: Add duplicate rows within the import file to existing sets.
  //    This prevents two rows in the same file with the same email from both passing.
  for (const row of validated) {
    if (row.email?.trim()) {
      emails.add(row.email.trim().toLowerCase());
    }
    if (row.idDocNumber?.trim()) {
      idDocs.add(row.idDocNumber.trim());
    }
    if (row.iaLicense?.trim()) {
      licenses.add(row.iaLicense.trim());
    }
  }

  return validated;
}