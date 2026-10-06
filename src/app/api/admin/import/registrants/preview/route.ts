/**
 * Inspect an uploaded roster or validate it against an administrator-selected mapping.
 *
 * A request with only `file` returns source columns and sample rows. A request with
 * `file` plus JSON `mapping` validates all mapped rows without creating server state.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSameOriginRequest } from "@/lib/is-same-origin";
import {
  formatRegistrantCellValue,
  mapRegistrantTableRows,
  parseRegistrantFile,
  suggestRegistrantColumnMapping,
  validateAllRows,
  validateRegistrantColumnMapping,
} from "@/lib/data/import/registrants";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const MAX_MAPPING_LENGTH = 4096;

/** Extract a non-sensitive error summary for server logs. */
function safeErrorSummary(error: unknown): { name: string; code?: string } {
  // 1: Log only an error name/code, never uploaded values or user PII.
  if (typeof error !== "object" || error === null) return { name: "UnknownError" };
  const candidate = error as { name?: unknown; code?: unknown };
  return {
    name: typeof candidate.name === "string" ? candidate.name : "UnknownError",
    ...(typeof candidate.code === "string" ? { code: candidate.code } : {}),
  };
}

/** Handle the inspect and mapped-preview modes for an uploaded roster. */
export async function POST(request: NextRequest) {
  try {
    // 1: Require an authenticated administrator and a configured same-origin browser request.
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

    // 2: Parse multipart data and require a CSV/XLSX file with the existing 10MB limit.
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
    }
    const fileEntry = formData.get("file");
    if (!fileEntry || typeof fileEntry === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

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

    // 3: Read and parse the file using the raw-table contract; the buffer is request-local only.
    const buffer = Buffer.from(await fileEntry.arrayBuffer());
    const parsed = await parseRegistrantFile(buffer, fileEntry.name);
    if (!parsed.success || !parsed.table) {
      return NextResponse.json(
        { error: "The file could not be read as a roster table.", parseErrors: parsed.errors },
        { status: 422 },
      );
    }
    const table = parsed.table;
    const suggestedMapping = suggestRegistrantColumnMapping(table.columns);

    // 4: When mapping is absent, return only source metadata and up to three sample rows.
    const mappingEntry = formData.get("mapping");
    if (mappingEntry === null) {
      return NextResponse.json({
        sourceColumns: table.columns,
        sampleRows: table.rows.slice(0, 3).map((row) => ({
          rowNumber: row.rowNumber,
          values: row.values.map(formatRegistrantCellValue),
        })),
        suggestedMapping,
        totalRows: table.rows.length,
      });
    }
    if (typeof mappingEntry !== "string") {
      return NextResponse.json({ error: "Mapping must be a JSON string" }, { status: 400 });
    }
    if (mappingEntry.length > MAX_MAPPING_LENGTH) {
      return NextResponse.json({ error: "Mapping is too large" }, { status: 400 });
    }

    // 5: Parse and validate untrusted mapping data before any field value is used.
    let rawMapping: unknown;
    try {
      rawMapping = JSON.parse(mappingEntry);
    } catch {
      return NextResponse.json({ error: "Mapping contains invalid JSON" }, { status: 400 });
    }
    const mappingResult = validateRegistrantColumnMapping(table.columns, rawMapping);
    if (!mappingResult.valid) {
      return NextResponse.json(
        { error: "Column mapping is invalid", mappingErrors: mappingResult.errors },
        { status: 422 },
      );
    }

    // 6: Reject header-only files; a mapping preview requires at least one source data row.
    if (table.rows.length === 0) {
      return NextResponse.json(
        {
          error: "No data rows were found below the source header.",
          mappingErrors: [],
          validationErrors: [{ row: 1, field: "_file", message: "No data rows were found" }],
          totalRows: 0,
          validCount: 0,
          errorCount: 1,
          rows: [],
        },
        { status: 422 },
      );
    }

    // 7: Map by source index and validate every row against current business/DB rules.
    const mappedRows = mapRegistrantTableRows(table, mappingResult.mapping);
    const validatedRows = await validateAllRows(mappedRows);
    const validationErrors = validatedRows.flatMap((row) => row.errors);

    // 8: Return a capped row preview and full error details without storing a preview session.
    return NextResponse.json({
      sourceColumns: table.columns,
      suggestedMapping,
      totalRows: validatedRows.length,
      validCount: validatedRows.filter((row) => row.valid).length,
      errorCount: validatedRows.filter((row) => !row.valid).length,
      rows: validatedRows.slice(0, 20),
      validationErrors,
      mappingErrors: [],
    });
  } catch (error) {
    // 9: Keep server diagnostics useful while excluding uploaded values from logs.
    console.error("POST /api/admin/import/registrants/preview failed:", safeErrorSummary(error));
    return NextResponse.json({ error: "Unable to inspect or validate this roster." }, { status: 500 });
  }
}
