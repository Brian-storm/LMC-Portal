import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * GET /api/admin/enrolments
 *
 * Returns paginated enrolments grouped into parent+children:
 * - INDIVIDUAL enrolment -> flat row (no children).
 * - ORGANIZATION enrolment -> enroller's organization as parent with `members[]` children.
 *
 * For ORGANIZATION, the enroller (organization representative) has NO registrant row.
 * The parent row uses the enroller's User record (for organization name, email).
 * All registrant rows become children in `members[]`.
 * Pagination counts parent-level rows (1 per group, 1 per individual).
 *
 * Query params:
 *  - status  : filter by PaymentStatus
 *  - page    : page number (1-based, default 1)
 *  - limit   : items per page (1-100, default 10)
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
    const status = searchParams.get("status") as Prisma.EnumPaymentStatusFilter["equals"] | null;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

    const whereBase: Prisma.RegistrantWhereInput = {};
    if (status) {
      whereBase.paymentStatus = status;
    }

    // Step 1: Count total parent-level rows
    //   - INDIVIDUAL registrants = 1 parent each
    //   - ORGANIZATION registrants: 1 parent per unique groupId
    const [individualTotal, groupTotalRaw] = await Promise.all([
      prisma.registrant.count({ where: { ...whereBase, enrollmentType: "INDIVIDUAL" } }),
      prisma.registrant.groupBy({
        by: ["groupId"],
        where: { ...whereBase, enrollmentType: "ORGANIZATION", groupId: { not: null } },
        _count: { id: true },
      }),
    ]);
    const groupTotal = groupTotalRaw.length; // one parent per unique group
    const totalParents = individualTotal + groupTotal;

    // Step 2: Fetch all registrants for the requested page, ordered by submittedAt
    //   We fetch extra rows to ensure we capture enough parents after folding groups.
    //   Strategy: fetch enough raw rows to cover the page, then fold on the server.
    const fetchExtra = limit * 5; // generous buffer
    const rawRegistrants = await prisma.registrant.findMany({
      where: whereBase,
      skip: 0,
      take: (page * limit) + fetchExtra,
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        enrollmentType: true,
        groupId: true,
        enrollerUserId: true,
        paymentStatus: true,
        paymentMethod: true,
        fee: true,
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
            idDocNumber: true,
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
            nameCn: true,
            iaRefNumber: true,
            cpdHours: true,
          },
        },
      },
    });

    // Step 3: Fold ORGANIZATION siblings into parent+children
    //   Group raw registrants by groupId
    const groupMap = new Map<string, typeof rawRegistrants>();
    for (const r of rawRegistrants) {
      if (r.enrollmentType === "ORGANIZATION" && r.groupId) {
        const existing = groupMap.get(r.groupId) ?? [];
        existing.push(r);
        groupMap.set(r.groupId, existing);
      }
    }

    // Step 3b: Gather unique enroller User IDs from group members and fetch their User records
    const enrollerUserIds = [...new Set(rawRegistrants.filter(r => r.enrollerUserId).map(r => r.enrollerUserId!))];
    const enrollers = enrollerUserIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: enrollerUserIds } },
          select: { id: true, organization: true, nameEn: true, nameZh: true, email: true },
        })
      : [];
    const enrollerOrgMap = new Map(enrollers.map(e => [e.id, e]));

    // Build parent-level list preserving relative order (first row in group sets position)
    const seenGroupIds = new Set<string>();
    const parentRows: (Omit<typeof rawRegistrants[number], "fee"> & {
      fee: number | null;
      registrantCount: number | null;
      members?: Array<{
        id: string;
        fee: number | null;
        user: typeof rawRegistrants[number]["user"];
      }>;
    })[] = [];

    for (const r of rawRegistrants) {
      // Convert Decimal fee to number for JSON serialization
      const feeNum = r.fee ? Number(r.fee) : null;
      if (r.enrollmentType === "INDIVIDUAL") {
        parentRows.push({ ...r, fee: feeNum, registrantCount: null });
      } else if (r.groupId && !seenGroupIds.has(r.groupId)) {
        seenGroupIds.add(r.groupId);
        const members = groupMap.get(r.groupId) ?? [];

        // Enroller has NO registrant row. Fetch org info from User table.
        const enrollerInfo = r.enrollerUserId ? enrollerOrgMap.get(r.enrollerUserId) : undefined;

        // Total fee = sum of ALL members' individual fees (enroller has no fee)
        const totalFee = members.reduce((sum, m) => sum + (m.fee ? Number(m.fee) : 0), 0);

        // Use the first member's shared attributes for the parent row
        const firstMember = members[0];

        parentRows.push({
          ...firstMember,
          // Override with enroller's user info (for org name, email)
          user: {
            id: enrollerInfo?.id ?? firstMember.user.id,
            nameEn: enrollerInfo?.nameEn ?? firstMember.user.nameEn,
            nameZh: enrollerInfo?.nameZh ?? firstMember.user.nameZh,
            email: enrollerInfo?.email ?? firstMember.user.email,
            idDocNumber: "",  // Enroller is not a registrant — no ID doc
            iaLicense: null,  // Enroller is not a registrant — no IA license
            organization: enrollerInfo?.organization ?? firstMember.user.organization,
          },
          fee: totalFee > 0 ? totalFee : null,
          registrantCount: members.length,  // Enroller NOT counted
          members: members.map((m) => ({
            id: m.id,
            fee: m.fee ? Number(m.fee) : null,
            user: m.user,
          })),
        });
      }
    }

    // Step 4: Slice to the requested page
    const startIdx = (page - 1) * limit;
    const pageRows = parentRows.slice(startIdx, startIdx + limit);

    return NextResponse.json({
      enrolments: pageRows,
      pagination: {
        page,
        limit,
        total: totalParents,
        totalPages: Math.ceil(totalParents / limit),
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
