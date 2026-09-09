import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * GET /api/courses/[slug]/brochure
 *
 * Returns a downloadable brochure/syllabus PDF for a course.
 * For GBA courses, serves the actual syllabus PDF from the public directory.
 * For all other courses, returns a placeholder PDF.
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

let pdfBlob: Blob;
    let filename: string;

    // 1: For the GBA course, serve the actual syllabus PDF from the public directory
    if (slug === "cpd-102") {
      const pdfPath = join(
        process.cwd(),
        "public",
        "company",
        "posters",
        "Healthcare CPD Course Syllabus.pdf",
      );
      // Read file as ArrayBuffer to avoid Node.js Buffer type incompatibility with BlobPart
      const pdfArrayBuffer = await readFile(pdfPath).then((buf) =>
        buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
      );
      pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
      filename = "Healthcare CPD Course Syllabus.pdf";
    } else {
      // 2: Placeholder PDF for all other courses — replace with real PDF from S3
      // once brochureUrl is configured per course
      const placeholderPdfBase64 =
        "JVBERi0xLjcNCjEgMCBvYmo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+Pg0KZW5kb2JqDQoyIDAgb2JqPDwvVHlwZS9QYWdlcy9LaWRzWzMgMCBSXS9Db3VudCAxPj4NCmVuZG9iag0KMyAwIG9iajw8L1R5cGUvUGFnZS9QYXJlbnQgMiAwIFIvTWVkaWFCb3hbMCAwIDYxMiA3OTJdPj4NCmVuZG9iag0KeHJlZg0KMCA0DQowMDAwMDAwMDAwIDY1NTM1IGYNCjAwMDAwMDAwMDkgMDAwMDAgbiANCjAwMDAwMDAwNTggMDAwMDAgbiANCjAwMDAwMDAxMTcgMDAwMDAgbiANCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+DQpzdGFydHhyZWYNCjE3NQ0KJTZFT0Y=";
      const pdfArrayBuffer = Buffer.from(placeholderPdfBase64, "base64").buffer.slice(
        0,
      );
      pdfBlob = new Blob([pdfArrayBuffer], { type: "application/pdf" });
      filename = `${slug}-brochure.pdf`;
    }

    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBlob.size.toString(),
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