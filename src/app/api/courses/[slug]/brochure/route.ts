import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * GET /api/courses/[slug]/brochure
 *
 * Returns a downloadable brochure for a course.
 * Placeholder implementation — replace brochureBytes with a real PDF from S3
 * once the brochureUrl is configured per course.
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const { slug } = await context.params;

    // Verify the course exists (returns 404 if not found)
    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true, isOpen: true, nameZh: true, nameEn: true },
    });

    if (!course || !course.isOpen) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Placeholder: a minimal valid PDF (single blank page)
    // Replace with real PDF buffer from S3 once brochureUrl is available
    const placeholderPdfBase64 =
      "JVBERi0xLjcNCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+Pg0KZW5kb2JqDQoyIDAgb2JqPDwvVHlwZS9QYWdlcy9LaWRzWzMgMCBSXS9Db3VudCAxPj4NCmVuZG9iag0KMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDYxMiA3OTJdPj4NCmVuZG9iag0KeHJlZg0KMCA0DQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMDkgMDAwMDAgbiANCjAwMDAwMDAwNTggMDAwMDAgbiANCjAwMDAwMDAxMTcgMDAwMDAgbiANCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+DQpzdGFydHhyZWYNCjE3NQ0KJTZFT0Y=";

    const pdfBuffer = Buffer.from(placeholderPdfBase64, "base64");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${slug}-brochure.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("GET /api/courses/[slug]/brochure error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}