import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { renderReceiptPdf } from "@/lib/receipt/render";
import { TEXTS } from "@/lib/receipt/texts";

/**
 * POST /api/download/receipt
 *
 * Generates a receipt PDF on-the-fly from DB data and returns it as a download.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiptNumber } = body;

    if (!receiptNumber || typeof receiptNumber !== "string") {
      return NextResponse.json({ error: "Invalid receipt number" }, { status: 400 });
    }

    const registrant = await prisma.registrant.findFirst({
      where: { receiptNumber },
      include: {
        user: { select: { nameZh: true, nameEn: true } },
        course: { select: { nameZh: true, nameEn: true, iaRefNumber: true, cpdHours: true, price: true } },
      },
    });

    if (!registrant) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    const feeStr = Number(registrant.course.price).toFixed(2);
    const paymentDate = new Date(registrant.submittedAt).toLocaleDateString("en-CA");

    const pdfBuffer = await renderReceiptPdf({
      receiptNumber,
      nameZh: registrant.user.nameZh,
      nameEn: registrant.user.nameEn,
      courseZh: registrant.course.nameZh,
      courseEn: registrant.course.nameEn,
      iaRef: registrant.course.iaRefNumber,
      cpdHours: registrant.course.cpdHours,
      fee: feeStr,
      paymentMethod: registrant.paymentMethod ?? TEXTS.dash,
      paymentDate,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${receiptNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("POST /api/download/receipt error:", error);
    const message = error instanceof Error ? error.message : "Failed to download receipt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}