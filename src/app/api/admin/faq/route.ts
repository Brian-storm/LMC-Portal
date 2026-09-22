import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generalFaqCreateSchema } from "@/lib/validation/faq";

/**
 * GET /api/admin/faq
 *
 * Returns paginated FAQs with category relation.
 * Supports page (1-based, default 1) and limit (max 100, default 20) query params.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const [generalFaqs, total] = await Promise.all([
      prisma.generalFaq.findMany({
        orderBy: [{ categoryId: "asc" }, { order: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, nameZh: true, nameEn: true, nameZhCn: true } },
        },
      }),
      prisma.generalFaq.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      generalFaqs,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("GET /api/admin/faq error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/admin/faq
 *
 * Creates a new FAQ. Validates with Zod, returns 201 on success.
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
    const parsed = generalFaqCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const faq = await prisma.generalFaq.create({
      data: parsed.data,
      include: {
        category: { select: { id: true, nameZh: true, nameEn: true, nameZhCn: true } },
      },
    });

    return NextResponse.json({ generalFaq: faq }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/faq error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}