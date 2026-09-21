import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateReceiptNumber, renderReceiptPdf } from "@/lib/receipt/generate";
import type { RenderReceiptData } from "@/lib/receipt/generate";
import { sendReceiptEmail } from "@/lib/email/send";
import { z } from "zod";

/**
 * Background job: generates receipt PDF + sends email after batch approval.
 * Matches the existing pattern in [id]/route.ts but operates on multiple enrolments.
 */
async function batchGenerateAndDeliverReceipt(
  targetRegistrantIds: string[],
): Promise<void> {
  try {
    // Fetch all registrants with their relations in bulk
    const registrants = await prisma.registrant.findMany({
      where: { id: { in: targetRegistrantIds } },
      include: {
        user: { select: { nameZh: true, nameEn: true, idDocNumber: true, email: true } },
        course: { select: { nameZh: true, nameEn: true, nameCn: true, price: true, unitPrice: true, iaRefNumber: true, cpdHours: true } },
      },
    });

    // Group by course+user to avoid duplicate receipt generation for group members
    // Each unique combination gets one receipt PDF shared via receiptPdfData
    for (const reg of registrants) {
      if (!reg.receiptNumber) continue;

      const feeStr = Number(reg.course.price).toFixed(2);
      const paymentDate = new Date(reg.submittedAt).toLocaleDateString("en-CA");
      const paymentMethod = reg.paymentMethod ?? "—";

      const pdfData: RenderReceiptData = {
        receiptNumber: reg.receiptNumber,
        nameZh: reg.user.nameZh,
        nameEn: reg.user.nameEn,
        courseZh: reg.course.nameZh,
        courseEn: reg.course.nameEn,
        iaRef: reg.course.iaRefNumber,
        cpdHours: reg.course.cpdHours,
        fee: feeStr,
        paymentMethod,
        paymentDate,
      };

      const pdfBuffer = await renderReceiptPdf(pdfData);

      // Store PDF on the registrant record
      await prisma.registrant.update({
        where: { id: reg.id },
        data: { receiptPdfData: new Uint8Array(pdfBuffer) },
      });

      // Fire-and-forget email
      sendReceiptEmail({
        recipient: {
          email: reg.user.email,
          nameZh: reg.user.nameZh,
          nameEn: reg.user.nameEn,
        },
        course: {
          nameZh: reg.course.nameZh,
          nameEn: reg.course.nameEn,
        },
        receipt: { receiptNumber: reg.receiptNumber, fee: feeStr },
        pdfBuffer,
        pdfFilename: `${reg.receiptNumber}.pdf`,
      }).catch((err) => {
        console.error(`Background email failed for ${reg.receiptNumber}:`, err);
      });
    }
  } catch (err) {
    console.error("Batch receipt generation failed:", err);
  }
}

// ── Validation schema ──

const batchActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  ids: z.array(z.string()).min(1).max(100),
  reason: z.string().max(500).optional(),
});

/**
 * POST /api/admin/enrolments/batch
 *
 * Batch approve or reject multiple enrolments in one request.
 * Skips enrolments that are no longer PENDING_VERIFICATION (already processed).
 *
 * Body: { action: "APPROVE" | "REJECT", ids: string[], reason?: string }
 *
 * Returns: { updatedCount, skippedCount, skippedIds }
 */
export async function POST(request: NextRequest) {
  try {
    // 1: Enforce admin authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // 2: Parse and validate request body
    const body = await request.json();
    const parsed = batchActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { action, ids, reason } = parsed.data;

    // 3: Fetch target registrants and filter out already-processed ones
    const registrants = await prisma.registrant.findMany({
      where: { id: { in: ids } },
      select: { id: true, paymentStatus: true, courseId: true, userId: true },
    });

    const validIds: string[] = [];
    const skippedIds: string[] = [];

    for (const reg of registrants) {
      if (reg.paymentStatus === "PENDING_VERIFICATION") {
        validIds.push(reg.id);
      } else {
        skippedIds.push(reg.id);
      }
    }

    if (validIds.length === 0) {
      return NextResponse.json({
        updatedCount: 0,
        skippedCount: skippedIds.length,
        skippedIds,
      });
    }

    // 4: Apply the action
    if (action === "APPROVE") {
      // Generate a single receipt number for the batch
      let receiptNumber: string | null = null;
      try {
        receiptNumber = await generateReceiptNumber();
      } catch (receiptError) {
        console.error("Receipt number generation failed (approval proceeds):", receiptError);
      }

      // Batch update all valid targets
      await prisma.registrant.updateMany({
        where: { id: { in: validIds } },
        data: {
          paymentStatus: "VERIFIED",
          receiptNumber: receiptNumber,
        },
      });

      // Background job: generate PDFs and send emails
      if (receiptNumber) {
        setTimeout(() => {
          batchGenerateAndDeliverReceipt(validIds);
        }, 0);
      }

      return NextResponse.json({
        updatedCount: validIds.length,
        skippedCount: skippedIds.length,
        skippedIds,
      });
    }

    // action === "REJECT"
    await prisma.registrant.updateMany({
      where: { id: { in: validIds } },
      data: {
        paymentStatus: "REJECTED",
        payerFullName: reason ?? null,
      },
    });

    return NextResponse.json({
      updatedCount: validIds.length,
      skippedCount: skippedIds.length,
      skippedIds,
    });
  } catch (error) {
    console.error("POST /api/admin/enrolments/batch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}