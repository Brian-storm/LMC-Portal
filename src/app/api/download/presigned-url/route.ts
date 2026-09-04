import { NextRequest, NextResponse } from "next/server";
import { s3Client, s3PrivateBucket } from "@/lib/aws";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * POST /api/download/presigned-url
 *
 * Generates a presigned GET URL for a private S3 object (e.g. a receipt PDF).
 * Accepts { key: "receipts/RCPT-2026-00001.pdf" } and returns a 5-minute URL.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key } = body;

    // Validate the key — must reference a receipt in the receipts/ prefix
    if (!key || typeof key !== "string" || !key.startsWith("receipts/")) {
      return NextResponse.json(
        { error: "Invalid object key" },
        { status: 400 },
      );
    }

    const command = new GetObjectCommand({
      Bucket: s3PrivateBucket,
      Key: key,
    });

    // Generate a presigned URL valid for 5 minutes
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });

    return NextResponse.json({ presignedUrl });
  } catch (error) {
    console.error("POST /api/download/presigned-url error:", error);
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 },
    );
  }
}