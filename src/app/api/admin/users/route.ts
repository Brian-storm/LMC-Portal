import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * GET /api/admin/users
 *
 * Returns paginated list of STUDENT-role users with search by name/email.
 *
 * Query params:
 *  - search  : filter by nameEn, nameZh, or email (case-insensitive contains)
 *  - page    : page number (1-based, default 1)
 *  - limit   : items per page (1-100, default 20)
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
    const search = searchParams.get("search") ?? "";
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const where: Prisma.UserWhereInput = {
      role: "STUDENT",
    };
    if (search.trim()) {
      const term = search.trim();
      where.OR = [
        { nameEn: { contains: term, mode: "insensitive" } },
        { nameZh: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          nameEn: true,
          nameZh: true,
          email: true,
          phone: true,
          iaLicense: true,
          createdAt: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}