import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/dashboard
 *
 * Returns aggregate stats for the admin dashboard:
 *  - totalEnrolments: count of all registrants
 *  - pendingCount: count of PENDING_VERIFICATION registrants
 *  - verifiedCount: count of VERIFIED registrants
 *  - rejectedCount: count of REJECTED registrants
 *  - courseCount: count of courses
 *  - userCount: count of users (excluding admins)
 *  - recentEnrolments: last 5 registrants with user + course info
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

    const [
      totalEnrolments,
      pendingCount,
      verifiedCount,
      rejectedCount,
      courseCount,
      userCount,
      recentEnrolments,
    ] = await Promise.all([
      prisma.registrant.count(),
      prisma.registrant.count({ where: { paymentStatus: "PENDING_VERIFICATION" } }),
      prisma.registrant.count({ where: { paymentStatus: "VERIFIED" } }),
      prisma.registrant.count({ where: { paymentStatus: "REJECTED" } }),
      prisma.course.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.registrant.findMany({
        orderBy: { submittedAt: "desc" },
        take: 5,
        include: {
          user: { select: { nameEn: true, nameZh: true, email: true } },
          course: { select: { nameEn: true, nameZh: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalEnrolments,
      pendingCount,
      verifiedCount,
      rejectedCount,
      courseCount,
      userCount,
      recentEnrolments,
    });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}