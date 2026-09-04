import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { s3Client, s3PrivateBucket } from "@/lib/aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Accepted MIME types for payment proof uploads
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

// Maximum file size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * POST /api/upload/presigned-url
 *
 * Generates a time-limited S3 presigned PUT URL so the frontend can upload
 * a payment proof file directly to S3 without exposing AWS credentials.
 *
 * Body: { fileName, fileType, fileSize, registrantId }
 *
 * Returns: { uploadUrl (presigned PUT URL), key (S3 object key) }
 */
export async function POST(request: NextRequest) {
  try {
    // 1: Authenticate the request — only signed-in users may upload
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2: Parse and validate the request body
    const body = await request.json();
    const { fileName, fileType, fileSize, registrantId } = body as {
      fileName?: string;
      fileType?: string;
      fileSize?: number;
      registrantId?: string;
    };

    if (!fileName || !fileType || !registrantId) {
      return NextResponse.json(
        { error: "Missing required fields: fileName, fileType, registrantId" },
        { status: 400 },
      );
    }

    // 3: Validate file type against the allowed list
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: `Unsupported file type '${fileType}'. Allowed: ${ALLOWED_FILE_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    // 4: Validate file size is under 10 MB
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 10 MB limit` },
        { status: 400 },
      );
    }

    // 5: Verify the registrant exists and belongs to the current user or the user is an admin
    const registrant = await prisma.registrant.findUnique({
      where: { id: registrantId },
      select: { userId: true },
    });

    if (!registrant) {
      return NextResponse.json({ error: "Registrant not found" }, { status: 404 });
    }

    // Check if the current user is the registrant or an admin
    const isOwner = registrant.userId === session.user.id;
    const isAdmin = !isOwner && !!(await prisma.admin.findUnique({ where: { userId: session.user.id } }));

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to upload for this registrant" },
        { status: 403 },
      );
    }

    // 6: Sanitize the file name — strip path separators and special characters,
    //    keep only alphanumeric, dashes, underscores, and dots
    const safeName = fileName
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");

    const timestamp = Date.now();
    const s3Key = `uploads/${registrantId}/${timestamp}-${safeName}`;

    // 7: Generate the presigned PUT URL (5-minute expiry)
    const putCommand = new PutObjectCommand({
      Bucket: s3PrivateBucket,
      Key: s3Key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 300 });

    // 8: Return the upload URL and the S3 key to the client
    return NextResponse.json({ uploadUrl, key: s3Key }, { status: 200 });
  } catch (error) {
    console.error("POST /api/upload/presigned-url error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}