import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { courseFaqCreateSchema } from "@/lib/validation/course";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/admin/courses/[courseId]/faqs
 *
 * Returns all FAQs for a course, ordered by sortOrder.
 */
export async function GET(
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

    const { id } = await params;
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const faqs = await prisma.courseFaq.findMany({
      where: { courseId: id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("GET /api/admin/courses/[id]/faqs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/courses/[courseId]/faqs
 *
 * Creates a new FAQ for a course. Returns 201.
 */
export async function POST(
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

    const { id } = await params;
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = courseFaqCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const faq = await prisma.courseFaq.create({
      data: {
        ...parsed.data,
        courseId: id,
      },
    });

    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/courses/[id]/faqs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}