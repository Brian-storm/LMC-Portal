import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reviewActionSchema } from "@/lib/validation/admin";
import { Prisma } from "@prisma/client";
import { generateReceipt } from "@/lib/receipt/generate";
import { sendReceiptEmail } from "@/lib/email/send";

/**
 * PATCH /api/admin/enrolments/[id]
 *
 * Approves or rejects an enrolment or an entire group.
 * - Single enrolment: id in URL path.
 * - Group batch: id in URL path (enroller's registrant ID) + groupId in body.
 *
 * When groupId is provided, ALL registrants with that groupId are updated.
 *
 * Admin-only — caller must be authenticated with role ADMIN.
 *
 * Body: { action: "APPROVE" | "REJECT", reason?: string, groupId?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1: Enforce admin authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // 2: Resolve the enrolment ID from the dynamic route segment
    const { id } = await params;

    // 3: Parse and validate the request body
    const body = await request.json();
    const parsed = reviewActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { action, reason } = parsed.data;
    const { groupId } = body as { groupId?: string };

    // 4: Find the target registrant(s)
    const registrant = await prisma.registrant.findUnique({ where: { id } });
    if (!registrant) {
      return NextResponse.json({ error: "Enrolment not found" }, { status: 404 });
    }

    // 5: Determine which IDs to update
    let targetIds: string[];
    if (groupId) {
      // Batch update: all registrants sharing this groupId
      const allInGroup = await prisma.registrant.findMany({
        where: { groupId, courseId: registrant.courseId },
        select: { id: true, paymentStatus: true },
      });
      // Prevent re-review: check all are still pending
      const reReviewed = allInGroup.filter((r) => r.paymentStatus !== "PENDING_VERIFICATION");
      if (reReviewed.length > 0) {
        return NextResponse.json(
          { error: `Some enrolments are already processed (${reReviewed.map((r) => r.id).join(", ")}), cannot re-review` },
          { status: 409 },
        );
      }
      targetIds = allInGroup.map((r) => r.id);
    } else {
      // Single update
      if (registrant.paymentStatus !== "PENDING_VERIFICATION") {
        return NextResponse.json(
          { error: `Enrolment is already ${registrant.paymentStatus.toLowerCase()}, cannot re-review` },
          { status: 409 },
        );
      }
      targetIds = [id];
    }

    // 6: Apply the action
    if (action === "APPROVE") {
      // 6a: Generate one receipt per registrant (they each get their own receipt)
      let receiptNumber: string | null = null;
      let pdfBuffer: Buffer | null = null;

      try {
        // Fetch enroller's registrant with full details for receipt generation
        const enrollerWithDetails = await prisma.registrant.findUnique({
          where: { id },
          include: {
            user: {
              select: { nameZh: true, nameEn: true, idDocNumber: true, email: true },
            },
            course: {
              select: { nameZh: true, nameEn: true, nameCn: true, price: true, unitPrice: true, iaRefNumber: true, cpdHours: true },
            },
          },
        });

        if (enrollerWithDetails) {
          const result = await generateReceipt(
            {
              id: enrollerWithDetails.id,
              paymentMethod: enrollerWithDetails.paymentMethod,
              submittedAt: enrollerWithDetails.submittedAt,
            },
            enrollerWithDetails.user,
            {
              nameZh: enrollerWithDetails.course.nameZh,
              nameEn: enrollerWithDetails.course.nameEn,
              price: Number(enrollerWithDetails.course.price),
              iaRefNumber: enrollerWithDetails.course.iaRefNumber,
              cpdHours: enrollerWithDetails.course.cpdHours,
            },
          );
          receiptNumber = result.receiptNumber;
          pdfBuffer = result.pdfBuffer;
        }
      } catch (receiptError) {
        console.error("Receipt generation failed (approval proceeds):", receiptError);
      }

      // 6b: Batch update all targets
      await prisma.registrant.updateMany({
        where: { id: { in: targetIds } },
        data: {
          paymentStatus: "VERIFIED",
          receiptNumber: receiptNumber,
        },
      });

      // 6c: Fire-and-forget the receipt email
      if (receiptNumber && pdfBuffer) {
        const registrantWithEmail = await prisma.registrant.findUnique({
          where: { id },
          include: {
            user: { select: { email: true, nameZh: true, nameEn: true } },
            course: { select: { nameZh: true, nameEn: true } },
          },
        });
        if (registrantWithEmail) {
          try {
            await sendReceiptEmail({
              recipient: {
                email: registrantWithEmail.user.email,
                nameZh: registrantWithEmail.user.nameZh,
                nameEn: registrantWithEmail.user.nameEn,
              },
              course: {
                nameZh: registrantWithEmail.course.nameZh,
                nameEn: registrantWithEmail.course.nameEn,
              },
              receipt: {
                receiptNumber,
                fee: registrant.fee?.toString() ?? "0",
              },
              pdfBuffer,
              pdfFilename: `${receiptNumber}.pdf`,
            });
          } catch (emailError) {
            console.error(`Receipt email sending failed for ${receiptNumber}:`, emailError);
          }
        }
      }

      return NextResponse.json({
        enrolment: { id, paymentStatus: "VERIFIED", receiptNumber },
        updatedCount: targetIds.length,
      });
    }

    // action === "REJECT"
    await prisma.registrant.updateMany({
      where: { id: { in: targetIds } },
      data: {
        paymentStatus: "REJECTED",
        payerFullName: reason ?? null,
      },
    });

    return NextResponse.json({
      enrolment: { id, paymentStatus: "REJECTED", payerFullName: reason ?? null },
      updatedCount: targetIds.length,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("PATCH /api/admin/enrolments/[id] prisma error:", error);
    } else {
      console.error("PATCH /api/admin/enrolments/[id] error:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
