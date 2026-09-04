import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
        instructors: {
          include: {
            instructor: { select: { nameEn: true, nameZh: true } },
          },
        },
        _count: { select: { registrants: true } },
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("GET /api/admin/courses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}