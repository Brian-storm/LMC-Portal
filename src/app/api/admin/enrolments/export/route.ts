/**
 * GET /api/admin/enrolments/export
 *
 * Exports enrolment data as CSV or Excel file download.
 * Query params: format (csv|xlsx), status, courseId, startDate, endDate, search
 *
 * For ORGANIZATION enrolments, each member is flattened into a separate row.
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
  { key: "id", header: "Enrolment ID", width: 30 },
  { key: "registrantName", header: "Registrant Name", width: 25 },
  { key: "email", header: "Email", width: 30 },
  { key: "iaLicense", header: "IA License", width: 16 },
  { key: "idDocType", header: "ID Doc Type", width: 12 },
  { key: "idDocNumber", header: "ID Doc Number", width: 20 },
  { key: "courseName", header: "Course Name", width: 35 },
  { key: "courseRef", header: "Course Reference", width: 16 },
  { key: "enrollmentType", header: "Type", width: 14 },
  { key: "groupId", header: "Group ID", width: 30 },
  { key: "paymentMethod", header: "Payment Method", width: 18 },
  { key: "fee", header: "Fee (HKD)", width: 12 },
  { key: "paymentStatus", header: "Status", width: 20 },
  { key: "submittedAt", header: "Submitted Date", width: 20 },
  { key: "receiptNumber", header: "Receipt Number", width: 20 },
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
    const courseId = searchParams.get("courseId")?.trim() || null;
    const startDate = searchParams.get("startDate")?.trim() || null;
    const endDate = searchParams.get("endDate")?.trim() || null;
    const search = searchParams.get("search")?.trim() || null;

    // Build query filters
    const where: Prisma.RegistrantWhereInput = {};
    if (status) where.paymentStatus = status;
    if (courseId) where.courseId = courseId;
    if (startDate || endDate) {
      where.submittedAt = {};
      if (startDate) where.submittedAt.gte = new Date(startDate);
      if (endDate) where.submittedAt.lte = new Date(endDate + "T23:59:59.999Z");
    }
    if (search) {
      where.user = {
        OR: [
          { nameEn: { contains: search, mode: "insensitive" } },
          { nameZh: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { idDocNumber: { contains: search, mode: "insensitive" } },
          { iaLicense: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // Check row count for large dataset warning
    const totalCount = await prisma.registrant.count({ where });
    if (totalCount > 10000) {
      return NextResponse.json(
        { error: "Data exceeds 10,000 rows. Please narrow your filter criteria." },
        { status: 413 },
      );
    }

    // Fetch all matching registrants
    const registrants = await prisma.registrant.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        enrollmentType: true,
        groupId: true,
        paymentStatus: true,
        paymentMethod: true,
        fee: true,
        receiptNumber: true,
        submittedAt: true,
        user: {
          select: {
            nameEn: true,
            nameZh: true,
            email: true,
            iaLicense: true,
            idDocType: true,
            idDocNumber: true,
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

    // Build export rows — flatten ORGANIZATION groups into individual rows
    const rows: ExportRow[] = registrants.map((r) => ({
      id: r.id,
      registrantName: r.user.nameZh || r.user.nameEn || "",
      email: r.user.email,
      iaLicense: r.user.iaLicense ?? "",
      idDocType: r.user.idDocType ?? "",
      idDocNumber: r.user.idDocNumber ?? "",
      courseName: r.course.nameZh || r.course.nameEn || "",
      courseRef: r.course.iaRefNumber ?? "",
      enrollmentType: r.enrollmentType,
      groupId: r.groupId ?? "",
      paymentMethod: r.paymentMethod ?? "",
      fee: r.fee ? Number(r.fee) : 0,
      paymentStatus: r.paymentStatus,
      submittedAt: r.submittedAt.toISOString().split("T")[0],
      receiptNumber: r.receiptNumber ?? "",
    }));

    // Build filename
    const today = new Date().toISOString().split("T")[0];
    const filename = `lmc-enrolments-${today}`;

    if (format === "xlsx") {
      const buffer = await exportExcel(rows, EXPORT_COLUMNS, "Enrolments");
      return downloadExcelResponse(buffer, `${filename}.xlsx`);
    }

    const csv = exportCsv(rows, EXPORT_COLUMNS);
    return downloadCsvResponse(csv, `${filename}.csv`);
  } catch (error) {
    console.error("GET /api/admin/enrolments/export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}