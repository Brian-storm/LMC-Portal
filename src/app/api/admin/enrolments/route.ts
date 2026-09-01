import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * GET /api/admin/enrolments
 *
 * Returns a paginated list of enrolments (registrants) with user + course info.
 * Supports filtering by paymentStatus.
 * Admin-only — caller must be authenticated with role ADMIN.
 *
 * Query params:
 *  - status       : filter by PaymentStatus (PENDING_VERIFICATION | VERIFIED | REJECTED | REFUNDED)
 *  - page         : page number (1-based, default 1)
 *  - limit        : items per page (1-100, default 10)
 *
 * Flow:
 *  1. Authenticate via next-auth session — reject unauthenticated (401) or non-admin (403)
 *  2. Parse and sanitize query params (page/limit are clamped to safe ranges)
 *  3. Build Prisma where clause with optional paymentStatus filter
 *  4. Fetch registrants with nested user + course selects in a single paginated query
 *  5. Return JSON with enrolments array + pagination metadata
 */
export async function GET(request: NextRequest) {
  try {
    // 1: Enforce admin authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // 2: Parse query params
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") as Prisma.EnumPaymentStatusFilter["equals"] | null;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

    // 3: Build where clause — optional filter by payment status
    const where: Prisma.RegistrantWhereInput = {};
    if (status) {
      where.paymentStatus = status;
    }

    // 4: Fetch enrolments with user and course data, paginated
    const [registrants, total] = await Promise.all([
      prisma.registrant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { submittedAt: "desc" },
        select: {
          id: true,
          enrollmentType: true,
          groupId: true,
          paymentStatus: true,
          paymentMethod: true,
          isThirdPartyPay: true,
          payerFullName: true,
          paymentProofUrl: true,
          receiptNumber: true,
          submittedAt: true,
          user: {
            select: {
              id: true,
              nameEn: true,
              nameZh: true,
              email: true,
              iaLicense: true,
              organization: true,
            },
          },
          course: {
            select: {
              id: true,
              slug: true,
              nameEn: true,
              nameZh: true,
              iaRefNumber: true,
              cpdHours: true,
            },
          },
        },
      }),
      prisma.registrant.count({ where }),
    ]);

    return NextResponse.json({
      enrolments: registrants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/enrolments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
