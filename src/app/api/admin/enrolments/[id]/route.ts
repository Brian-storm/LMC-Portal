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
 * Approves or rejects a single enrolment record.
 * - APPROVE : sets paymentStatus to VERIFIED, optionally stores receiptNumber
 * - REJECT  : sets paymentStatus to REJECTED, stores reason
 *
 * Admin-only — caller must be authenticated with role ADMIN.
 *
 * Flow:
 *  1. Authenticate via next-auth session — reject unauthenticated (401) or non-admin (403)
 *  2. Resolve the enrolment ID from the dynamic route segment
 *  3. Parse and Zod-validate the request body (action, reason, receiptNumber)
 *  4. Look up the registrant by ID — return 404 if not found
 *  5. Re-review prevention: reject with 409 if paymentStatus is not PENDING_VERIFICATION
 *  6. Apply the action: APPROVE → VERIFIED + receiptNumber, REJECT → REJECTED + reason
 *  7. Return the updated enrolment record
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

    // 4: Find the registrant record
    const registrant = await prisma.registrant.findUnique({
      where: { id },
    });

    if (!registrant) {
      return NextResponse.json(
        { error: "Enrolment not found" },
        { status: 404 },
      );
    }

    // 5: Prevent re-review — if the enrolment has already been processed
    if (registrant.paymentStatus !== "PENDING_VERIFICATION") {
      return NextResponse.json(
        { error: `Enrolment is already ${registrant.paymentStatus.toLowerCase()}, cannot re-review` },
        { status: 409 },
      );
    }

    // 6: Apply the action
    if (action === "APPROVE") {
      // 6a: Fetch the registrant with user + course data for receipt generation
      const registrantWithDetails = await prisma.registrant.findUnique({
        where: { id },
        include: {
          user: {
            select: { nameZh: true, nameEn: true, idDocNumber: true, email: true },
          },
          course: {
            select: { nameZh: true, nameEn: true, price: true, iaRefNumber: true, cpdHours: true },
          },
        },
      });

      if (!registrantWithDetails) {
        return NextResponse.json({ error: "Enrolment not found" }, { status: 404 });
      }

      // 6b: Generate receipt PDF (password-protected) and get the buffer
      let receiptNumber: string | null = null;
      let pdfBuffer: Buffer | null = null;

      try {
        const result = await generateReceipt(
          {
            id: registrantWithDetails.id,
            paymentMethod: registrantWithDetails.paymentMethod,
            submittedAt: registrantWithDetails.submittedAt,
          },
          registrantWithDetails.user,
          {
            nameZh: registrantWithDetails.course.nameZh,
            nameEn: registrantWithDetails.course.nameEn,
            price: Number(registrantWithDetails.course.price),
            iaRefNumber: registrantWithDetails.course.iaRefNumber,
            cpdHours: registrantWithDetails.course.cpdHours,
          },
        );
        receiptNumber = result.receiptNumber;
        pdfBuffer = result.pdfBuffer;
      } catch (receiptError) {
        // If receipt generation fails, the enrolment can still be approved
        // without a receipt number — log and continue
        console.error("Receipt generation failed (approval proceeds):", receiptError);
      }

      // 6c: Update the DB with VERIFIED status and the generated receipt number
      const updated = await prisma.registrant.update({
        where: { id },
        data: {
          paymentStatus: "VERIFIED",
          receiptNumber: receiptNumber,
        },
        select: {
          id: true,
          paymentStatus: true,
          receiptNumber: true,
        },
      });

      // 6d: Fire-and-forget the receipt email (SES failure does not roll back approval).
      if (receiptNumber && pdfBuffer) {
        try {
          await sendReceiptEmail({
            recipient: {
              email: registrantWithDetails.user.email,
              nameZh: registrantWithDetails.user.nameZh,
              nameEn: registrantWithDetails.user.nameEn,
            },
            course: {
              nameZh: registrantWithDetails.course.nameZh,
              nameEn: registrantWithDetails.course.nameEn,
            },
            receipt: {
              receiptNumber,
              fee: registrantWithDetails.course.price.toString(),
            },
            pdfBuffer,
            pdfFilename: `${receiptNumber}.pdf`,
          });
        } catch (emailError) {
          // Email failure is non-fatal — receipt is already in the DB
          console.error(`Receipt email sending failed for ${receiptNumber}:`, emailError);
        }
      }

      return NextResponse.json({ enrolment: updated });
    }

    // action === "REJECT"
    const updated = await prisma.registrant.update({
      where: { id },
      data: {
        paymentStatus: "REJECTED",
        // For now, store the rejection reason in a free-text field — we use
        // payerFullName as a temporary staging field until the schema gains a
        // dedicated rejectionReason column in a future migration.
        payerFullName: reason ?? null,
      },
      select: {
        id: true,
        paymentStatus: true,
        payerFullName: true,
      },
    });

    return NextResponse.json({ enrolment: updated });
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
