/**
 * GET /api/admin/import/registrants/template
 *
 * Download an import template file (CSV or Excel) with column headers.
 * Query param: ?format=csv (default) or ?format=xlsx
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { exportCsv, downloadCsvResponse } from "@/lib/data/csv";
import { exportExcel, downloadExcelResponse } from "@/lib/data/excel";
import { REGISTRANT_IMPORT_COLUMNS } from "@/lib/data/import/registrants";

export async function GET(request: NextRequest) {
  try {
    // 1: Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // 2: Determine format
    const format = request.nextUrl.searchParams.get("format") || "csv";

    // 3: Generate template (empty data — just headers + one example row)
    const exampleRow: Record<string, unknown> = {
      nameZh: "陳大文",
      nameEn: "CHAN Tai Man",
      email: "chan.taiman@example.com",
      phone: "+852 9123 4567",
      idDocNumber: "A1234567",
      idDocType: "HKID",
      iaLicense: "IA12345678",
      organization: "LMC Consultancy Ltd.",
    };

    if (format === "xlsx") {
      const buffer = await exportExcel([exampleRow], REGISTRANT_IMPORT_COLUMNS, "Registrant Import");
      return downloadExcelResponse(buffer, "lmc-registrant-import-template.xlsx");
    }

    // Default: CSV
    const csv = exportCsv([exampleRow], REGISTRANT_IMPORT_COLUMNS);
    return downloadCsvResponse(csv, "lmc-registrant-import-template.csv");
  } catch (error) {
    console.error("GET /api/admin/import/registrants/template error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}