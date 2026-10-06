/**
 * Re-parse, re-validate, and atomically create all student profiles from an uploaded roster.
 *
 * The request must contain both the original `file` and its source-index `mapping`.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSameOriginRequest } from "@/lib/is-same-origin";
import {
  createUsersAtomically,
  mapRegistrantTableRows,
  parseRegistrantFile,
  RegistrantImportConflictError,
  validateAllRows,
  validateRegistrantColumnMapping,
} from "@/lib/data/import/registrants";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const MAX_MAPPING_LENGTH = 4096;

/** Extract only a safe error name/code for server logs. */
function safeErrorSummary(error: unknown): { name: string; code?: string } {
  // 1: Avoid logging request bodies, file names, or identity values.
  if (typeof error !== "object" || error === null) return { name: "UnknownError" };
  const candidate = error as { name?: unknown; code?: unknown };
  return {
    name: typeof candidate.name === "string" ? candidate.name : "UnknownError",
    ...(typeof candidate.code === "string" ? { code: candidate.code } : {}),
  };
}

/** Read the Prisma error code without relying on a particular error subclass. */
function getDatabaseErrorCode(error: unknown): string | null {
  // 1: Inspect only the stable code field needed to distinguish concurrent conflicts.
  if (typeof error !== "object" || error === null || !("code" in error)) return null;
  return typeof error.code === "string" ? error.code : null;
}

export async function POST(request: NextRequest) {
  // Keep batch count available for an all-or-nothing conflict response.
  let totalRows = 0;
  try {
    // 1: Require an authenticated administrator and a trusted same-origin browser request.
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    if (!isSameOriginRequest(request.headers.get("origin"), process.env.NEXT_PUBLIC_SITE_URL)) {
      return NextResponse.json({ error: "Cross-origin request blocked" }, { status: 403 });
    }

    // 2: Parse multipart fields and require the file plus its source-index mapping.
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
    }
    const fileEntry = formData.get("file");
    const mappingEntry = formData.get("mapping");
    if (!fileEntry || typeof fileEntry === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (typeof mappingEntry !== "string") {
      return NextResponse.json({ error: "A source-column mapping is required" }, { status: 400 });
    }
    if (mappingEntry.length > MAX_MAPPING_LENGTH) {
      return NextResponse.json({ error: "Mapping is too large" }, { status: 400 });
    }

    // 3: Enforce the current file type and 10MB limits on every confirmation request.
    const filename = fileEntry.name.toLowerCase();
    if (!filename.endsWith(".csv") && !filename.endsWith(".xlsx")) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a .csv or .xlsx file." },
        { status: 400 },
      );
    }
    if (fileEntry.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json({ error: "File size exceeds the 10MB limit." }, { status: 400 });
    }

    // 4: Parse the mapping JSON, rejecting malformed input before processing the file.
    let rawMapping: unknown;
    try {
      rawMapping = JSON.parse(mappingEntry);
    } catch {
      return NextResponse.json({ error: "Mapping contains invalid JSON" }, { status: 400 });
    }

    // 5: Reparse the uploaded bytes; no preview/session state or client rows are trusted.
    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    const parsed = await parseRegistrantFile(buffer, fileEntry.name);
    if (!parsed.success || !parsed.table) {
      return NextResponse.json(
        {
          error: "The file could not be read as a roster table; no profiles were imported.",
          imported: 0,
          failed: 0,
          parseErrors: parsed.errors,
        },
        { status: 422 },
      );
    }

    // 6: Validate source bounds, target allowlist, uniqueness, and all required destinations.
    const mappingResult = validateRegistrantColumnMapping(parsed.table.columns, rawMapping);
    if (!mappingResult.valid) {
      return NextResponse.json(
        {
          error: "Column mapping is invalid; no profiles were imported.",
          imported: 0,
          failed: parsed.table.rows.length,
          mappingErrors: mappingResult.errors,
        },
        { status: 422 },
      );
    }
    if (parsed.table.rows.length === 0) {
      return NextResponse.json(
        {
          error: "No data rows were found below the source header; no profiles were imported.",
          imported: 0,
          failed: 0,
          errors: [{ row: 1, field: "_file", message: "No data rows were found" }],
        },
        { status: 422 },
      );
    }

    // 7: Reapply the validated mapping and all business/database duplicate checks.
    const mappedRows = mapRegistrantTableRows(parsed.table, mappingResult.mapping);
    const validatedRows = await validateAllRows(mappedRows);
    totalRows = validatedRows.length;
    const validationErrors = validatedRows.flatMap((row) => row.errors);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          error: "The roster contains invalid rows; no profiles were imported.",
          imported: 0,
          failed: validatedRows.filter((row) => !row.valid).length,
          errors: validationErrors,
        },
        { status: 422 },
      );
    }

    // 8: Create every User atomically; any database error rolls back the complete batch.
    await createUsersAtomically(validatedRows);
    return NextResponse.json({ imported: validatedRows.length, failed: 0, errors: [] });
  } catch (error) {
    // 9: Return a conflict for concurrent writes; never report partial success or log PII.
    if (error instanceof RegistrantImportConflictError) {
      return NextResponse.json(
        {
          error: "The roster conflicts with existing data; no profiles were imported.",
          imported: 0,
          failed: error.failedCount,
          errors: error.errors,
        },
        { status: 409 },
      );
    }

    const databaseCode = getDatabaseErrorCode(error);
    if (databaseCode === "P2002" || databaseCode === "P2034") {
      return NextResponse.json(
        {
          error: "The roster changed during confirmation; no profiles were imported. Review and retry.",
          imported: 0,
          failed: Math.max(totalRows, 1),
          errors: [{ row: 1, field: "_row", message: "Concurrent database conflict" }],
        },
        { status: 409 },
      );
    }

    console.error("POST /api/admin/import/registrants/confirm failed:", safeErrorSummary(error));
    return NextResponse.json(
      { error: "Import failed; no profiles were imported." },
      { status: 500 },
    );
  }
}
