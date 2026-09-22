import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { courseFaqUpdateSchema } from "@/lib/validation/course";

type RouteContext = { params: Promise<{ id: string; faqId: string }> };

/**
 * PATCH /api/admin/courses/[courseId]/faqs/[faqId]
 *
 * Updates a single course FAQ (partial update). Returns 404 if not found.
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id: courseId, faqId } = await params;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const faq = await prisma.courseFaq.findUnique({ where: { id: faqId } });
    if (!faq || faq.courseId !== courseId) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = courseFaqUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updated = await prisma.courseFaq.update({
      where: { id: faqId },
      data: parsed.data,
    });

    return NextResponse.json({ faq: updated });
  } catch (error) {
    console.error("PATCH /api/admin/courses/[id]/faqs/[faqId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/courses/[courseId]/faqs/[faqId]
 *
 * Deletes a single course FAQ. Returns 404 if not found.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id: courseId, faqId } = await params;
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const faq = await prisma.courseFaq.findUnique({ where: { id: faqId } });
    if (!faq || faq.courseId !== courseId) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await prisma.courseFaq.delete({ where: { id: faqId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/courses/[id]/faqs/[faqId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}