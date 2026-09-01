import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { enrollSchema } from "@/lib/validation/enroll";
import { Prisma } from "@prisma/client";

/**
 * POST /api/enroll
 *
 * Creates one or more registrant records for a course.
 * Requires an authenticated user session.
 *
 * Body:
 *  - courseId          : target course
 *  - scheduleId        : target schedule whose quota is decremented
 *  - enrollmentType    : INDIVIDUAL | ORGANIZATION
 *  - paymentMethod     : FPS | ALIPAY | E_BANKING | CHEQUE | CASH | CORPORATE_INVOICE
 *  - registrants[]     : required for ORGANIZATION (nameZh, nameEn, email, idDocNumber)
 *  - isThirdPartyPay   : optional, default false
 *  - payerFullName     : optional
 *
 * Returns 201 { registrantId, groupId } on success.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = enrollSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { courseId, scheduleId, enrollmentType, paymentMethod, registrants, isThirdPartyPay, payerFullName } =
      parsed.data;

    // 1. Validate course exists and is open for registration
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, isOpen: true, registrationStatus: true },
    });

    if (!course || !course.isOpen) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (course.registrationStatus !== "OPEN" && course.registrationStatus !== "FEW_SEATS") {
      return NextResponse.json(
        { error: "Course registration is not open" },
        { status: 400 },
      );
    }

    // 2. Validate schedule exists for this course
    const schedule = await prisma.schedule.findFirst({
      where: { id: scheduleId, courseId, isActive: true },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const headCount = enrollmentType === "ORGANIZATION" ? (registrants?.length ?? 1) : 1;

    if (schedule.quotaRemaining < headCount) {
      return NextResponse.json(
        { error: "No remaining seats for this schedule" },
        { status: 400 },
      );
    }

    // ── 3. Atomic quota decrement + registrant creation ──
    // Use a single Prisma transaction so that the quota check, decrement,
    // and registrant INSERT are all-or-nothing. This prevents race conditions
    // when multiple users submit the enrollment simultaneously.
    // updateMany with { quotaRemaining: { gte: headCount } } acts as an
    // optimistic lock — if another request consumed the last seat, count is 0.
    //
    // groupId: a shared UUID for ORGANIZATION enrollments linking all members
    // together; for INDIVIDUAL the groupId is null (single registrant).
    const groupId = `grp_${crypto.randomUUID()}`;

    try {
      const result = await prisma.$transaction(async (tx) => {
        const updated = await tx.schedule.updateMany({
          where: { id: scheduleId, courseId, quotaRemaining: { gte: headCount } },
          data: { quotaRemaining: { decrement: headCount } },
        });

        if (updated.count === 0) {
          throw new Error("SCHEDULE_FULL");
        }

        // Build the registrant rows: for ORGANIZATION, create one row per
        // group member (all sharing the same groupId); for INDIVIDUAL, a
        // single row with groupId = null.
        const rows = registrants && registrants.length > 0
          ? registrants.map(() => ({
              courseId,
              userId,
              enrollmentType,
              groupId,
              paymentStatus: "PENDING_VERIFICATION" as const,
              paymentMethod,
              isThirdPartyPay,
              payerFullName: payerFullName ?? null,
            }))
          : [
              {
                courseId,
                userId,
                enrollmentType,
                groupId: null,
                paymentStatus: "PENDING_VERIFICATION" as const,
                paymentMethod,
                isThirdPartyPay,
                payerFullName: payerFullName ?? null,
              },
            ];

        await tx.registrant.createMany({ data: rows });

        const created = await tx.registrant.findFirst({
          where: { groupId, courseId },
          orderBy: { submittedAt: "asc" },
          select: { id: true },
        });

        return { registrantId: created?.id ?? null };
      });

      return NextResponse.json(
        { registrantId: result.registrantId, groupId },
        { status: 201 },
      );
    } catch (error) {
      if (error instanceof Error && error.message === "SCHEDULE_FULL") {
        return NextResponse.json(
          { error: "No remaining seats for this schedule" },
          { status: 400 },
        );
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("POST /api/enroll prisma error:", error);
    } else {
      console.error("POST /api/enroll error:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
