/**
 * POST /api/admin/import/registrants/preview
 *
 * Accept a CSV or Excel file, parse it, validate rows against business rules,
 * and return a preview with error highlights. Does NOT write to the database.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseRegistrantFile, validateAllRows } from "@/lib/data/import/registrants";
import { createImportSession } from "@/lib/data/import/temp-store";
import { REGISTRANT_IMPORT_COLUMNS } from "@/lib/data/import/registrants";

export async function POST(request: NextRequest) {
  try {
    // 1: Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // 2: Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3: Validate file type
    const filename = file.name.toLowerCase();
    if (!filename.endsWith(".csv") && !filename.endsWith(".xlsx")) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a .csv or .xlsx file." },
        { status: 400 },
      );
    }

    // 4: Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 10MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB).` },
        { status: 400 },
      );
    }

    // 5: Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // 6: Parse the file
    const { rows, errors: parseErrors } = await parseRegistrantFile(buffer, file.name);

    // 7: If no rows parsed, return early
    if (rows.length === 0) {
      return NextResponse.json({
        importId: null,
        totalRows: 0,
        validCount: 0,
        errorCount: parseErrors.length,
        rows: [],
        parseErrors,
        columns: REGISTRANT_IMPORT_COLUMNS.map((c) => ({ key: c.key, header: c.header })),
      });
    }

    // 8: Validate all rows against business rules + DB duplicate checks
    const validatedRows = await validateAllRows(rows);

    // 9: Store in temp session
    const session_data = createImportSession(file.name, validatedRows);

    // 10: Return preview data (first 20 rows for UI display)
    const previewRows = validatedRows.slice(0, 20);

    return NextResponse.json({
      importId: session_data.importId,
      totalRows: validatedRows.length,
      validCount: session_data.validCount,
      errorCount: session_data.errorCount,
      rows: previewRows.map((r) => ({
        rowNumber: r.rowNumber,
        nameZh: r.nameZh,
        nameEn: r.nameEn,
        email: r.email,
        phone: r.phone,
        idDocNumber: r.idDocNumber,
        idDocType: r.idDocType,
        iaLicense: r.iaLicense,
        organization: r.organization,
        valid: r.valid,
        errors: r.errors,
      })),
      parseErrors,
      columns: REGISTRANT_IMPORT_COLUMNS.map((c) => ({ key: c.key, header: c.header })),
    });
  } catch (error) {
    console.error("POST /api/admin/import/registrants/preview error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}