/**
 * GET /api/enroll/check-duplicate
 *
 * Checks whether a given user is already enrolled in a course.
 * Accepts either userId (for authenticated users) or idDocNumber (for guests).
 *
 * Query params:
 *   - courseId     : the course to check against (required)
 *   - userId       : the user's ID (preferred for authenticated lookups)
 *   - idDocNumber  : identity document number (fallback for guests)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId")?.trim();
  const userId = searchParams.get("userId")?.trim();
  const idDocNumber = searchParams.get("idDocNumber")?.trim();

  if (!courseId) {
    return NextResponse.json(
      { error: "courseId is required" },
      { status: 400 },
    );
  }

  let userIds: string[] = [];

  if (userId) {
    userIds = [userId];
  } else if (idDocNumber) {
    const users = await prisma.user.findMany({
      where: { idDocNumber },
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
  } else {
    return NextResponse.json(
      { error: "Either userId or idDocNumber is required" },
      { status: 400 },
    );
  }

  if (userIds.length === 0) {
    return NextResponse.json({ isDuplicate: false });
  }

  const existing = await prisma.registrant.findFirst({
    where: {
      courseId,
      userId: { in: userIds },
    },
    select: { id: true },
  });

  return NextResponse.json({ isDuplicate: existing !== null });
}