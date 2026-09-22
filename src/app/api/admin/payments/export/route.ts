/**
 * GET /api/admin/payments/export
 *
 * Exports payment records as CSV or Excel file download.
 * Query params: format (csv|xlsx), status, paymentMethod, startDate, endDate
 *
 * Each registrant with payment data appears as one row.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { exportCsv, downloadCsvResponse } from "@/lib/data/csv";
import { exportExcel, downloadExcelResponse } from "@/lib/data/excel";
import type { ExportColumn } from "@/lib/data/types";

type ExportRow = Record<string, unknown>;

const EXPORT_COLUMNS: ExportColumn<ExportRow>[] = [
  { key: "id", header: "Transaction ID", width: 30 },
  { key: "registrantName", header: "Registrant Name", width: 25 },
  { key: "email", header: "Email", width: 30 },
  { key: "courseName", header: "Course Name", width: 35 },
  { key: "courseRef", header: "Course Reference", width: 16 },
  { key: "paymentMethod", header: "Payment Method", width: 18 },
  { key: "fee", header: "Amount (HKD)", width: 14, format: "#,##0.00" },
  { key: "paymentStatus", header: "Payment Status", width: 20 },
  { key: "receiptNumber", header: "Receipt Number", width: 20 },
  { key: "submittedAt", header: "Transaction Date", width: 20 },
  { key: "isThirdPartyPay", header: "3rd Party Payment", width: 18 },
  { key: "payerFullName", header: "Payer Name", width: 25 },
];

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const format = (searchParams.get("format") ?? "csv") as "csv" | "xlsx";
    const status = searchParams.get("status") as Prisma.EnumPaymentStatusFilter["equals"] | null;
    const paymentMethod = searchParams.get("paymentMethod") || null;
    const startDate = searchParams.get("startDate")?.trim() || null;
    const endDate = searchParams.get("endDate")?.trim() || null;

    // Build query filters
    const where: Prisma.RegistrantWhereInput = {};
    if (status) where.paymentStatus = status;
    if (paymentMethod) where.paymentMethod = paymentMethod as Prisma.EnumPaymentMethodNullableFilter["equals"];
    if (startDate || endDate) {
      where.submittedAt = {};
      if (startDate) where.submittedAt.gte = new Date(startDate);
      if (endDate) where.submittedAt.lte = new Date(endDate + "T23:59:59.999Z");
    }

    // Check row count for large dataset warning
    const totalCount = await prisma.registrant.count({ where });
    if (totalCount > 10000) {
      return NextResponse.json(
        { error: "Data exceeds 10,000 rows. Please narrow your filter criteria." },
        { status: 413 },
      );
    }

    // Fetch all matching registrants with payment data
    const registrants = await prisma.registrant.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        paymentStatus: true,
        paymentMethod: true,
        fee: true,
        isThirdPartyPay: true,
        payerFullName: true,
        receiptNumber: true,
        submittedAt: true,
        user: {
          select: {
            nameEn: true,
            nameZh: true,
            email: true,
          },
        },
        course: {
          select: {
            nameEn: true,
            nameZh: true,
            iaRefNumber: true,
          },
        },
      },
    });

    // Build export rows
    const rows: ExportRow[] = registrants.map((r) => ({
      id: r.id,
      registrantName: r.user.nameZh || r.user.nameEn || "",
      email: r.user.email,
      courseName: r.course.nameZh || r.course.nameEn || "",
      courseRef: r.course.iaRefNumber ?? "",
      paymentMethod: r.paymentMethod ?? "",
      fee: r.fee ? Number(r.fee) : 0,
      paymentStatus: r.paymentStatus,
      receiptNumber: r.receiptNumber ?? "",
      submittedAt: r.submittedAt.toISOString().split("T")[0],
      isThirdPartyPay: r.isThirdPartyPay ? "Yes" : "No",
      payerFullName: r.payerFullName ?? "",
    }));

    // Build filename
    const today = new Date().toISOString().split("T")[0];
    const filename = `lmc-payments-${today}`;

    if (format === "xlsx") {
      const buffer = await exportExcel(rows, EXPORT_COLUMNS, "Payments");
      return downloadExcelResponse(buffer, `${filename}.xlsx`);
    }

    const csv = exportCsv(rows, EXPORT_COLUMNS);
    return downloadCsvResponse(csv, `${filename}.csv`);
  } catch (error) {
    console.error("GET /api/admin/payments/export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}