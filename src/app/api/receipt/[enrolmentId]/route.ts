import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * GET /api/receipt/[enrolmentId]
 *
 * Returns receipt data for display on the receipt page.
 * Requires no authentication in Phase 1 — the enrolment ID (cuid) is
 * effectively unguessable. Auth can be added in Phase 2.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ enrolmentId: string }> },
) {
  try {
    const { enrolmentId } = await params;

    // Fetch the registrant with user + course data
    const registrant = await prisma.registrant.findUnique({
      where: { id: enrolmentId },
      include: {
        user: {
          select: { nameZh: true, nameEn: true, email: true },
        },
        course: {
          select: { nameZh: true, nameEn: true, price: true, iaRefNumber: true, cpdHours: true },
        },
      },
    });

    // Return 404 if the enrolment doesn't exist or hasn't been approved yet
    if (!registrant || !registrant.receiptNumber) {
      return NextResponse.json(
        { error: "Receipt not found" },
        { status: 404 },
      );
    }

    // Return receipt data
    return NextResponse.json({
      receiptNumber: registrant.receiptNumber,
      receiptS3Key: `receipts/${registrant.receiptNumber}.pdf`,
      registrantNameZh: registrant.user.nameZh,
      registrantNameEn: registrant.user.nameEn,
      registrantEmail: registrant.user.email,
      courseNameZh: registrant.course.nameZh,
      courseNameEn: registrant.course.nameEn,
      iaRefNumber: registrant.course.iaRefNumber,
      cpdHours: registrant.course.cpdHours,
      fee: Number(registrant.course.price).toFixed(2),
      paymentMethod: registrant.paymentMethod,
      paymentDate: registrant.submittedAt.toISOString(),
      status: registrant.paymentStatus,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("GET /api/receipt/[enrolmentId] prisma error:", error);
    } else {
      console.error("GET /api/receipt/[enrolmentId] error:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}