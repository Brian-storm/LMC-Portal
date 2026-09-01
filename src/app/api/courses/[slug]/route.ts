import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { courseUpdateSchema } from "@/lib/validation/course";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * GET /api/courses/[slug]
 *
 * Returns a single open course with all related entities:
 * instructors, syllabus items, active schedules, reviews, and FAQs.
 * Returns 404 if the slug does not exist or the course is closed.
 */
export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { slug } = await context.params;

    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        instructors: {
          include: {
            instructor: {
              select: {
                id: true,
                nameZh: true,
                nameEn: true,
                titleZh: true,
                titleEn: true,
                bioZh: true,
                bioEn: true,
                avatarUrl: true,
              },
            },
          },
        },
        syllabusItems: { orderBy: { sortOrder: "asc" } },
        schedules: { where: { isActive: true }, orderBy: { dateAndTime: "asc" } },
        reviews: { orderBy: { date: "desc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!course || !course.isOpen) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error("GET /api/courses/[slug] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/courses/[slug]
 *
 * Partially updates a course. Requires admin authentication.
 * Nested relations (instructors, syllabusItems, schedules, FAQs)
 * are replaced entirely when provided (deleteMany + create).
 * Returns 404 if the course does not exist.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { slug } = await context.params;
    const body = await request.json();
    const parsed = courseUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await prisma.course.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Separate nested relations from flat course fields
    const { instructors, syllabusItems, schedules, faqs, ...courseData } = parsed.data;

    const course = await prisma.course.update({
      where: { slug },
      data: {
        ...courseData,
        instructors: instructors
          ? {
              deleteMany: {},
              create: instructors.map((i) => ({ instructorId: i.instructorId })),
            }
          : undefined,
        syllabusItems: syllabusItems
          ? {
              deleteMany: {},
              create: syllabusItems,
            }
          : undefined,
        schedules: schedules
          ? {
              deleteMany: {},
              create: schedules,
            }
          : undefined,
        faqs: faqs
          ? {
              deleteMany: {},
              create: faqs,
            }
          : undefined,
      },
      include: {
        instructors: { include: { instructor: true } },
        syllabusItems: true,
        schedules: true,
        faqs: true,
        reviews: true,
      },
    });

    return NextResponse.json({ course });
  } catch (error) {
    console.error("PATCH /api/courses/[slug] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/courses/[slug]
 *
 * Soft-deletes a course by setting isOpen to false.
 * Requires admin authentication.
 * Returns 404 if the course does not exist.
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { slug } = await context.params;

    const existing = await prisma.course.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await prisma.course.update({
      where: { slug },
      data: { isOpen: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/courses/[slug] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}