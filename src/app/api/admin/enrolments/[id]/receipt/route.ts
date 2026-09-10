import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/enrolments/[id]/receipt
 *
 * Downloads the stored receipt PDF for a given registrant.
 * Admin-only — caller must be authenticated with role ADMIN.
 * Returns the PDF buffer as application/pdf.
 *
 * If the registrant is part of a group but only has a receiptNumber (no PDF),
 * attempts to fetch the PDF from the enroller's record.
 */
export async function GET(
  _request: NextRequest,
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

    // 2: Resolve the registrant ID
    const { id } = await params;

    // 3: Fetch the registrant — include the receipt PDF data
    const registrant = await prisma.registrant.findUnique({
      where: { id },
      select: {
        id: true,
        receiptNumber: true,
        receiptPdfData: true,
        groupId: true,
      },
    });

    if (!registrant) {
      return NextResponse.json({ error: "Enrolment not found" }, { status: 404 });
    }

    // 4: Attempt to serve the PDF
    let pdfData: Uint8Array | null = registrant.receiptPdfData;

    // 4a: If no PDF on this record but it has a groupId and receiptNumber,
    //      try to find the enroller's record (first registrant in group)
    if (!pdfData && registrant.receiptNumber && registrant.groupId) {
      const enrollerRecord = await prisma.registrant.findFirst({
        where: {
          groupId: registrant.groupId,
          receiptPdfData: { not: null },
          receiptNumber: registrant.receiptNumber,
        },
        select: { receiptPdfData: true },
        orderBy: { submittedAt: "asc" },
      });
      if (enrollerRecord?.receiptPdfData) {
        pdfData = enrollerRecord.receiptPdfData;
      }
    }

    if (!pdfData) {
      return NextResponse.json(
        { error: "No receipt PDF data available for this enrolment." },
        { status: 404 },
      );
    }

    // 5: Return the PDF
    const pdfBuffer = Buffer.from(pdfData);
    const filename = `${registrant.receiptNumber ?? "receipt"}.pdf`;
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/enrolments/[id]/receipt error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/enrolments/[id]/receipt
 *
 * Manually uploads a receipt PDF for a registrant.
 * Used when auto-generation failed (e.g., font download issue).
 * Admin-only — caller must be authenticated with role ADMIN.
 *
 * Body: application/octet-stream (raw PDF bytes)
 */
export async function PUT(
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

    // 2: Resolve the registrant ID
    const { id } = await params;

    // 3: Fetch the registrant to verify it exists
    const registrant = await prisma.registrant.findUnique({
      where: { id },
      select: { id: true, paymentStatus: true, receiptNumber: true },
    });

    if (!registrant) {
      return NextResponse.json({ error: "Enrolment not found" }, { status: 404 });
    }

    if (!registrant.receiptNumber) {
      return NextResponse.json(
        { error: "Cannot upload receipt PDF without an existing receipt number. Approve the enrolment first." },
        { status: 400 },
      );
    }

    // 4: Read the raw body as a Buffer
    const arrayBuffer = await request.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    if (pdfBuffer.length === 0) {
      return NextResponse.json({ error: "Empty PDF data received" }, { status: 400 });
    }

    // Basic sanity: PDFs start with "%PDF"
    const isPdf = pdfBuffer.length > 4 && pdfBuffer[0] === 0x25 && pdfBuffer[1] === 0x50 && pdfBuffer[2] === 0x44 && pdfBuffer[3] === 0x46;
    if (!isPdf) {
      return NextResponse.json({ error: "Uploaded data does not appear to be a valid PDF (expected %PDF header)" }, { status: 400 });
    }

    // 5: Store the PDF
    await prisma.registrant.update({
      where: { id },
      data: { receiptPdfData: pdfBuffer },
    });

    console.log(`Receipt PDF manually uploaded for registrant ${id} (${registrant.receiptNumber}), size: ${pdfBuffer.length} bytes`);

    return NextResponse.json({
      message: "Receipt PDF uploaded successfully",
      receiptNumber: registrant.receiptNumber,
      sizeBytes: pdfBuffer.length,
    });
  } catch (error) {
    console.error("PUT /api/admin/enrolments/[id]/receipt error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
