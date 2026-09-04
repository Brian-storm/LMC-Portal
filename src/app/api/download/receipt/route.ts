import { NextRequest, NextResponse } from "next/server";
import { s3Client, s3PrivateBucket } from "@/lib/aws";
import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";

/**
 * POST /api/download/receipt
 *
 * Proxies the receipt PDF from S3 to the browser as a download.
 * Accepts { receiptNumber: "RCPT-2026-00001" } and streams the file
 * with the correct Content-Disposition header.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { receiptNumber } = body;

    if (!receiptNumber || typeof receiptNumber !== "string") {
      return NextResponse.json(
        { error: "Invalid receipt number" },
        { status: 400 },
      );
    }

    const key = `receipts/${receiptNumber}.pdf`;

    // Fetch the object from S3
    const s3Response = await s3Client.send(
      new GetObjectCommand({
        Bucket: s3PrivateBucket,
        Key: key,
      }),
    );

    // Convert the readable stream to bytes
    const stream = s3Response.Body as ReadableStream;
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    let done = false;

    while (!done) {
      const { value, done: chunkDone } = await reader.read();
      if (value) chunks.push(value);
      done = chunkDone;
    }

    const pdfBuffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));

    // Return the PDF as a downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${receiptNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("POST /api/download/receipt error:", error);

    // Distinguish between file-not-found and other errors
    const message =
      error instanceof NoSuchKey
        ? "Receipt PDF not found. The file may not have been generated yet."
        : "Failed to download receipt";

    const status = error instanceof NoSuchKey ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}