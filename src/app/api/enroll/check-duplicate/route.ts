/**
 * GET /api/enroll/check-duplicate
 *
 * Checks whether a given idDocNumber already has a registrant record
 * for the specified course. Returns { isDuplicate: true } if found.
 *
 * Query params:
 *   - idDocNumber : the identity document number to check
 *   - courseId    : the course to check against
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idDocNumber = searchParams.get("idDocNumber")?.trim();
  const courseId = searchParams.get("courseId")?.trim();

  if (!idDocNumber || !courseId) {
    return NextResponse.json(
      { error: "idDocNumber and courseId are required" },
      { status: 400 },
    );
  }

  // Look up a user whose idDocNumber matches, then check for an existing enrol
  // record for this course. idDocNumber is not unique in the schema, so we
  // check all matching users.
  const users = await prisma.user.findMany({
    where: { idDocNumber },
    select: { id: true },
  });

  if (users.length === 0) {
    return NextResponse.json({ isDuplicate: false });
  }

  const userIds = users.map((u) => u.id);
  const existing = await prisma.registrant.findFirst({
    where: {
      courseId,
      userId: { in: userIds },
    },
    select: { id: true },
  });

  return NextResponse.json({ isDuplicate: existing !== null });
}