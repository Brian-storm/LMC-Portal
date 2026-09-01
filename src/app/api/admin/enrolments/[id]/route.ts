import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { reviewActionSchema } from "@/lib/validation/admin";
import { Prisma } from "@prisma/client";

/**
 * PATCH /api/admin/enrolments/[id]
 *
 * Approves or rejects a single enrolment record.
 * - APPROVE : sets paymentStatus to VERIFIED, optionally stores receiptNumber
 * - REJECT  : sets paymentStatus to REJECTED, stores reason
 *
 * Admin-only — caller must be authenticated with role ADMIN.
 *
 * Flow:
 *  1. Authenticate via next-auth session — reject unauthenticated (401) or non-admin (403)
 *  2. Resolve the enrolment ID from the dynamic route segment
 *  3. Parse and Zod-validate the request body (action, reason, receiptNumber)
 *  4. Look up the registrant by ID — return 404 if not found
 *  5. Re-review prevention: reject with 409 if paymentStatus is not PENDING_VERIFICATION
 *  6. Apply the action: APPROVE → VERIFIED + receiptNumber, REJECT → REJECTED + reason
 *  7. Return the updated enrolment record
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // 1: Enforce admin authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // 2: Resolve the enrolment ID from the dynamic route segment
    const { id } = await params;

    // 3: Parse and validate the request body
    const body = await request.json();
    const parsed = reviewActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { action, reason, receiptNumber } = parsed.data;

    // 4: Find the registrant record
    const registrant = await prisma.registrant.findUnique({
      where: { id },
    });

    if (!registrant) {
      return NextResponse.json(
        { error: "Enrolment not found" },
        { status: 404 },
      );
    }

    // 5: Prevent re-review — if the enrolment has already been processed
    if (registrant.paymentStatus !== "PENDING_VERIFICATION") {
      return NextResponse.json(
        { error: `Enrolment is already ${registrant.paymentStatus.toLowerCase()}, cannot re-review` },
        { status: 409 },
      );
    }

    // 6: Apply the action inside a transaction
    if (action === "APPROVE") {
      const updated = await prisma.registrant.update({
        where: { id },
        data: {
          paymentStatus: "VERIFIED",
          receiptNumber: receiptNumber ?? null,
        },
        select: {
          id: true,
          paymentStatus: true,
          receiptNumber: true,
        },
      });

      return NextResponse.json({ enrolment: updated });
    }

    // action === "REJECT"
    const updated = await prisma.registrant.update({
      where: { id },
      data: {
        paymentStatus: "REJECTED",
        // For now, store the rejection reason in a free-text field — we use
        // payerFullName as a temporary staging field until the schema gains a
        // dedicated rejectionReason column in a future migration.
        payerFullName: reason ?? null,
      },
      select: {
        id: true,
        paymentStatus: true,
        payerFullName: true,
      },
    });

    return NextResponse.json({ enrolment: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("PATCH /api/admin/enrolments/[id] prisma error:", error);
    } else {
      console.error("PATCH /api/admin/enrolments/[id] error:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
