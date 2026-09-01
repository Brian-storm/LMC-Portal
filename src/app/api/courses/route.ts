import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { courseCreateSchema } from "@/lib/validation/course";
import { Prisma } from "@prisma/client";

/**
 * GET /api/courses
 *
 * Returns a paginated list of open courses. Supports the following query params:
 *  - locale   : field-selection locale (en | zh-hk | zh-cn)
 *  - category : filter by category string
 *  - search   : fuzzy title/description search (matched against locale fields)
 *  - page     : page number (1-based, default 1)
 *  - limit    : items per page (1-100, default 10)
 *  - cpdHoursMin / cpdHoursMax : inclusive CPD hour range
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const locale = searchParams.get("locale") ?? "en";
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
    const cpdHoursMin = searchParams.get("cpdHoursMin");
    const cpdHoursMax = searchParams.get("cpdHoursMax");

    // Pick localized fields based on locale
    const nameField = locale === "zh-hk" || locale === "zh-cn" ? "nameZh" : "nameEn";
    const descriptionField = locale === "zh-hk" || locale === "zh-cn" ? "descriptionZh" : "descriptionEn";

    const where: Prisma.CourseWhereInput = { isOpen: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { [nameField]: { contains: search, mode: "insensitive" } },
        { [descriptionField]: { contains: search, mode: "insensitive" } },
      ];
    }

    if (cpdHoursMin || cpdHoursMax) {
      where.cpdHours = {};
      if (cpdHoursMin) {
        (where.cpdHours as Prisma.IntFilter).gte = parseInt(cpdHoursMin, 10);
      }
      if (cpdHoursMax) {
        (where.cpdHours as Prisma.IntFilter).lte = parseInt(cpdHoursMax, 10);
      }
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          slug: true,
          nameZh: true,
          nameEn: true,
          descriptionZh: true,
          descriptionEn: true,
          category: true,
          iaRefNumber: true,
          cpdHours: true,
          price: true,
          capacity: true,
          registrationStatus: true,
          deliveryMode: true,
          language: true,
          createdAt: true,
          // Include active schedules so the front-end can show upcoming dates
          schedules: {
            where: { isActive: true },
            select: {
              id: true,
              dateAndTime: true,
              venue: true,
              quotaRemaining: true,
            },
            orderBy: { dateAndTime: "asc" },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/courses
 *
 * Creates a new course. Requires admin authentication.
 * Accepts nested instructors (by ID), syllabusItems, schedules, and FAQs.
 * Returns 409 if the slug already exists.
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
    const parsed = courseCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Separate nested relations from flat course fields
    const { instructors, syllabusItems, schedules, faqs, ...courseData } = parsed.data;

    const existing = await prisma.course.findUnique({ where: { slug: courseData.slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A course with this slug already exists." },
        { status: 409 },
      );
    }

    const course = await prisma.course.create({
      data: {
        ...courseData,
        instructors: instructors?.length
          ? { create: instructors.map((i) => ({ instructorId: i.instructorId })) }
          : undefined,
        syllabusItems: syllabusItems?.length
          ? { create: syllabusItems }
          : undefined,
        schedules: schedules?.length
          ? { create: schedules }
          : undefined,
        faqs: faqs?.length
          ? { create: faqs }
          : undefined,
      },
      include: {
        instructors: { include: { instructor: true } },
        syllabusItems: true,
        schedules: true,
        faqs: true,
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}