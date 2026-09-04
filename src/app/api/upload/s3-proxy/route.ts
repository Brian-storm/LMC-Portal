import { NextRequest, NextResponse } from "next/server";
import { s3Client, s3PrivateBucket } from "@/lib/aws";
import { GetObjectCommand } from "@aws-sdk/client-s3";

/**
 * GET /api/upload/s3-proxy?key=uploads/...
 *
 * Proxies a private S3 object to the browser.
 * This avoids the need for public S3 access or presigned URLs.
 * Only returns images (image/*) to prevent arbitrary file download.
 */
export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get("key");

    if (!key || typeof key !== "string") {
      return NextResponse.json({ error: "Object key is required" }, { status: 400 });
    }

    // Fetch from S3
    const s3Response = await s3Client.send(
      new GetObjectCommand({
        Bucket: s3PrivateBucket,
        Key: key,
      }),
    );

    const contentType = s3Response.ContentType || "application/octet-stream";

    // Only allow image content types for security
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Only images are supported" }, { status: 400 });
    }

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

    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("GET /api/upload/s3-proxy error:", error);
    return NextResponse.json({ error: "Failed to load image" }, { status: 500 });
  }
}