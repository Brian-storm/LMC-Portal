import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { courseUpdateSchema } from "@/lib/validation/course";
import { Prisma } from "@prisma/client";

// Helper: convert Prisma Decimal fields to numbers for JSON serialization
function serializeCourse(course: Record<string, unknown>) {
  return {
    ...course,
    price: Number(course.price),
    ...(course.unitPrice !== null && course.unitPrice !== undefined
      ? { unitPrice: Number(course.unitPrice) }
      : { unitPrice: null }),
    ...(course.cpdHoursIa !== null && course.cpdHoursIa !== undefined
      ? { cpdHoursIa: Number(course.cpdHoursIa) }
      : { cpdHoursIa: null }),
  };
}

/**
 * GET /api/admin/courses/[id]
 *
 * Returns a single course with relations for editing.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        generalInstructor: { select: { id: true, nameEn: true, nameZh: true } },
        syllabusItems: { orderBy: { sortOrder: "asc" } },
        schedules: { orderBy: { dateAndTime: "asc" } },
        faqs: { orderBy: { sortOrder: "asc" } },
        _count: { select: { registrants: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course: serializeCourse(course as unknown as Record<string, unknown>) });
  } catch (error) {
    console.error("GET /api/admin/courses/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/courses/[id]
 *
 * Updates a course. All fields optional except id.
 * Returns 200 with the updated course.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const body = await request.json();

    const parsed = courseUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const data = parsed.data;
    const { syllabusItems, schedules, faqs, ...courseData } = data;

    // Build update payload with Decimal conversion for currency fields
    const updateData: Prisma.CourseUpdateInput = {
      ...courseData,
    };
    if (courseData.price !== undefined) {
      updateData.price = new Prisma.Decimal(courseData.price);
    }
    if (courseData.cpdHoursIa !== undefined) {
      updateData.cpdHoursIa = new Prisma.Decimal(courseData.cpdHoursIa);
    }
    if (courseData.unitPrice !== undefined) {
      updateData.unitPrice = new Prisma.Decimal(courseData.unitPrice);
    }

    // Handle nested updates: replace syllabusItems, schedules, faqs if provided
    if (syllabusItems) {
      updateData.syllabusItems = {
        deleteMany: {},
        create: syllabusItems,
      };
    }
    if (schedules) {
      updateData.schedules = {
        deleteMany: {},
        create: schedules,
      };
    }
    if (faqs) {
      updateData.faqs = {
        deleteMany: {},
        create: faqs,
      };
    }

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        generalInstructor: { select: { nameEn: true, nameZh: true } },
        _count: { select: { registrants: true } },
      },
    });

    return NextResponse.json({ course: serializeCourse(course as unknown as Record<string, unknown>) });
  } catch (error) {
    console.error("PATCH /api/admin/courses/[id] error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A course with this slug already exists" }, { status: 409 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/courses/[id]
 *
 * Deletes a course if it has no registrants. If registrants exist, returns 409.
 * On success cascades: deletes syllabusItems, schedules, scheduleInstructors,
 * scheduleTopics, reviews, faqs.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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

    const existing = await prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { registrants: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (existing._count.registrants > 0) {
      return NextResponse.json(
        { error: "Cannot delete course with existing registrants. Close registration instead.", registrantCount: existing._count.registrants },
        { status: 409 },
      );
    }

    // Cascade delete related records
    await prisma.$transaction([
      prisma.scheduleTopic.deleteMany({ where: { schedule: { courseId: id } } }),
      prisma.scheduleInstructor.deleteMany({ where: { schedule: { courseId: id } } }),
      prisma.schedule.deleteMany({ where: { courseId: id } }),
      prisma.syllabusItem.deleteMany({ where: { courseId: id } }),
      prisma.review.deleteMany({ where: { courseId: id } }),
      prisma.faq.deleteMany({ where: { courseId: id } }),
      prisma.course.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/courses/[id] error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}