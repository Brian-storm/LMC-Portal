import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { courseCreateSchema } from "@/lib/validation/course";
import { Prisma } from "@prisma/client";

/**
 * Generate a kebab-case slug from an English string.
 * Appends a random 4-char suffix to avoid collisions.
 */
function generateSlug(nameEn: string): string {
  const base = nameEn
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

/**
 * GET /api/admin/courses
 *
 * Returns all courses with instructor names for the admin courses listing.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        generalInstructor: { select: { nameEn: true, nameZh: true } },
        _count: { select: { registrants: true } },
      },
    });

    // Convert Decimal fields to numbers for JSON serialization
    const serialized = courses.map((c) => ({
      ...c,
      price: Number(c.price),
      ...(c.unitPrice !== null ? { unitPrice: Number(c.unitPrice) } : { unitPrice: null }),
      ...(c.cpdHoursIa !== null ? { cpdHoursIa: Number(c.cpdHoursIa) } : { cpdHoursIa: null }),
    }));

    return NextResponse.json({ courses: serialized });
  } catch (error) {
    console.error("GET /api/admin/courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/courses
 *
 * Creates a new course. Slug is auto-generated from nameEn if not provided.
 * Returns 201 with the created course.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();

    // Auto-generate slug from nameEn if not provided
    if (!body.slug || !body.slug.trim()) {
      body.slug = generateSlug(body.nameEn || "course");
    }

    const parsed = courseCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Handle syllabusItems, schedules, faqs via nested create
    const { syllabusItems, schedules, faqs, ...courseData } = data;

    const course = await prisma.course.create({
      data: {
        ...courseData,
        price: new Prisma.Decimal(courseData.price),
        ...(courseData.cpdHoursIa !== undefined ? { cpdHoursIa: new Prisma.Decimal(courseData.cpdHoursIa) } : {}),
        ...(courseData.unitPrice !== undefined ? { unitPrice: new Prisma.Decimal(courseData.unitPrice) } : {}),
        syllabusItems: syllabusItems
          ? { create: syllabusItems }
          : undefined,
        schedules: schedules
          ? { create: schedules }
          : undefined,
        faqs: faqs
          ? { create: faqs }
          : undefined,
      },
      include: {
        generalInstructor: { select: { nameEn: true, nameZh: true } },
        _count: { select: { registrants: true } },
      },
    });

    return NextResponse.json({
      course: {
        ...course,
        price: Number(course.price),
        ...(course.unitPrice !== null ? { unitPrice: Number(course.unitPrice) } : { unitPrice: null }),
        ...(course.cpdHoursIa !== null ? { cpdHoursIa: Number(course.cpdHoursIa) } : { cpdHoursIa: null }),
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/courses error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A course with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}