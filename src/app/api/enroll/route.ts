import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { enrollSchema } from "@/lib/validation/enroll";
import { Prisma } from "@prisma/client";

/**
 * POST /api/enroll
 *
 * Creates one or more registrant records for a course.
 * Accepts authenticated sessions (preferred) or guest enrollees via
 * email/fullName/phone fields in the request body.
 *
 * Body:
 *  - courseId          : target course
 *  - scheduleIds       : array of schedule IDs to enroll in
 *  - enrollmentType    : INDIVIDUAL | ORGANIZATION
 *  - paymentMethod     : FPS | ALIPAY | E_BANKING | CHEQUE | CASH | CORPORATE_INVOICE
 *  - registrants[]     : required for ORGANIZATION (nameZh, nameEn, email, idDocNumber)
 *  - isThirdPartyPay   : optional, default false
 *  - payerFullName     : optional
 *  - email             : optional — required when no session (guest enrolment)
 *  - fullName          : optional — used when no session
 *  - phone             : optional — used when no session
 *  - company           : optional
 *  - iaLicenseNo       : optional
 *
 * Returns 201 { registrantId, groupId } on success.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    const body = await request.json();
    const parsed = enrollSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { courseId, scheduleIds, enrollmentType, paymentMethod, registrants, isThirdPartyPay, payerFullName, email, fullName, phone, company, iaLicenseNo, idDocNumber } =
      parsed.data;

    // 1: Resolve the user — from authenticated session or guest info
    let userId: string;
    if (session?.user?.id) {
      userId = session.user.id;
      // Lock: for authenticated users, always use the profile's name and email.
      // The submitted fullName/email values are ignored to prevent fraud.
      const profile = await prisma.user.findUnique({
        where: { id: userId },
        select: { nameEn: true, nameZh: true, email: true },
      });
      if (!profile) {
        return NextResponse.json(
          { error: "User profile not found" },
          { status: 400 },
        );
      }
      // Override any submitted name/email with the profile's values
      // so the receipt and email always use the verified identity.
      parsed.data.fullName = profile.nameEn;
      parsed.data.email = profile.email;

      // Update the user's idDocNumber if provided (e.g. first-time HKID entry)
      if (idDocNumber) {
        await prisma.user.update({
          where: { id: userId },
          data: { idDocNumber },
        });
      }
      // Update the user's idDocType if provided
      if (parsed.data.idDocType) {
        await prisma.user.update({
          where: { id: userId },
          data: { idDocType: parsed.data.idDocType },
        });
      }
    } else {
      // Guest enrolment: email is required
      if (!email) {
        return NextResponse.json(
          { error: "Email is required for guest enrolment" },
          { status: 400 },
        );
      }
      // Look up existing user by email, or create a bare-minimum user record
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        userId = existingUser.id;
        // Update the existing guest user with the submitted idDocNumber if missing
        if (idDocNumber && (!existingUser.idDocNumber || existingUser.idDocNumber.startsWith("guest-"))) {
          await prisma.user.update({
            where: { id: userId },
            data: { idDocNumber },
          });
        }
        // Update existing guest user with submitted idDocType if they don't have one
        if (parsed.data.idDocType && !existingUser.idDocType) {
          await prisma.user.update({
            where: { id: userId },
            data: { idDocType: parsed.data.idDocType },
          });
        }
      } else {
        const guestName = fullName || "Guest";
        const newUser = await prisma.user.create({
          data: {
            nameZh: guestName,
            nameEn: guestName,
            idDocNumber: idDocNumber || `guest-${crypto.randomUUID().slice(0, 8)}`,
            idDocType: parsed.data.idDocType ?? undefined,
            phone: phone || "",
            email,
            iaLicense: iaLicenseNo || null,
            organization: company || null,
          },
        });
        userId = newUser.id;
      }
    }

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

    // 2: Validate ALL selected schedules belong to this course and are active
    const schedules = await prisma.schedule.findMany({
      where: { id: { in: scheduleIds }, courseId, isActive: true },
    });

    if (schedules.length !== scheduleIds.length) {
      return NextResponse.json(
        { error: "One or more schedules not found or inactive" },
        { status: 404 },
      );
    }

    const headCount = enrollmentType === "ORGANIZATION" ? (registrants?.length ?? 1) : 1;

    // Check ALL schedules have sufficient quota (all-or-nothing)
    const lowQuota = schedules.find((s) => s.quotaRemaining < headCount);
    if (lowQuota) {
      return NextResponse.json(
        { error: `Schedule ${lowQuota.dateAndTime} has insufficient seats` },
        { status: 400 },
      );
    }

    // ── 3. Atomic quota decrement + registrant + schedule links creation ──
    const groupId = `grp_${crypto.randomUUID()}`;

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Decrement quota for ALL selected schedules atomically
        const updatedCount = await tx.schedule.updateMany({
          where: { id: { in: scheduleIds }, courseId, quotaRemaining: { gte: headCount } },
          data: { quotaRemaining: { decrement: headCount } },
        });

        if (updatedCount.count !== scheduleIds.length) {
          throw new Error("SCHEDULE_FULL");
        }

        const isGroupEnrollment = registrants && registrants.length > 0;
        let registrantId: string | null = null;
        let createdRegistrants: { id: string }[] = [];

        if (isGroupEnrollment) {
          // ORGANIZATION: create one registrant per group member
          const rows = registrants.map((r) => ({
            courseId,
            userId,
            idDocType: r.idDocType ?? undefined,
            enrollmentType,
            groupId,
            paymentStatus: "PENDING_VERIFICATION" as const,
            paymentMethod,
            isThirdPartyPay,
            payerFullName: payerFullName ?? null,
          }));

          await tx.registrant.createMany({ data: rows });

          createdRegistrants = await tx.registrant.findMany({
            where: { groupId, courseId },
            orderBy: { submittedAt: "asc" },
            select: { id: true },
          });

          registrantId = createdRegistrants[0]?.id ?? null;
        } else {
          // INDIVIDUAL: create single registrant
          const created = await tx.registrant.create({
            data: {
              courseId,
              userId,
              idDocType: parsed.data.idDocType ?? undefined,
              enrollmentType,
              groupId: null,
              paymentStatus: "PENDING_VERIFICATION",
              paymentMethod,
              isThirdPartyPay,
              payerFullName: payerFullName ?? null,
            },
            select: { id: true },
          });

          createdRegistrants = [created];
          registrantId = created.id;
        }

        // Create RegistrantSchedule links: each registrant × each schedule
        const linkData = createdRegistrants.flatMap((reg) =>
          scheduleIds.map((sId) => ({
            registrantId: reg.id,
            scheduleId: sId,
          })),
        );

        await tx.registrantSchedule.createMany({ data: linkData });

        return { registrantId };
      });

      return NextResponse.json(
        { registrantId: result.registrantId, groupId },
        { status: 201 },
      );
    } catch (error) {
      if (error instanceof Error && error.message === "SCHEDULE_FULL") {
        return NextResponse.json(
          { error: "One or more selected schedules have no remaining seats" },
          { status: 400 },
        );
      }
      // Handle unique constraint violation (duplicate courseId + userId)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return NextResponse.json(
          { error: "You are already enrolled in this course. Duplicate enrollments are not allowed." },
          { status: 409 },
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
