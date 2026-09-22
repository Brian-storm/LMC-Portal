import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// Schema for PATCH request body — only these fields are accepted
const UpdateUserSchema = z.object({
  nameZh: z.string().min(1, "nameZh is required").optional(),
  nameEn: z.string().min(1, "nameEn is required").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().min(1, "phone is required").optional(),
  iaLicense: z.string().optional().nullable(),
  idDocNumber: z.string().optional().nullable(),
  idDocType: z.enum(["HKID", "PASSPORT", "PERMIT", "OTHER"]).optional().nullable(),
  organization: z.string().optional().nullable(),
  isMember: z.boolean().optional(),
  memberId: z.string().optional().nullable(),
});

// Fields that are NEVER allowed to be updated via this endpoint
const FORBIDDEN_FIELDS = new Set([
  "role",
  "passwordHash",
  "paymentStatus",
  "receiptNumber",
  "receiptPdfData",
  "paymentProofUrl",
  "registrants",
]);

/**
 * GET /api/admin/users/[id]
 *
 * Returns full user profile including fields not exposed by the list endpoint.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        nameZh: true,
        nameEn: true,
        email: true,
        phone: true,
        iaLicense: true,
        idDocNumber: true,
        idDocType: true,
        organization: true,
        isMember: true,
        memberId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users/[id]
 *
 * Updates user profile fields. Only explicitly allowed fields are accepted.
 * Any attempt to update role, passwordHash, or registrant/payment fields is rejected.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    // Verify the user exists before attempting update
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();

    // Check for forbidden fields in the request body
    const incomingKeys = Object.keys(body);
    const forbiddenAttempted = incomingKeys.filter((key) => FORBIDDEN_FIELDS.has(key));
    if (forbiddenAttempted.length > 0) {
      return NextResponse.json(
        { error: `Cannot update restricted fields: ${forbiddenAttempted.join(", ")}` },
        { status: 400 },
      );
    }

    // Validate the allowed fields
    const parsed = UpdateUserSchema.safeParse(body);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return NextResponse.json(
        { error: "Validation failed", fieldErrors },
        { status: 400 },
      );
    }

    // If no valid fields provided, return early
    const updateData = parsed.data;
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided for update" },
        { status: 400 },
      );
    }

    // Transform updateData: strip undefined, convert null to Prisma's { set: null }
    const cleanedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        cleanedData[key] = value === null ? { set: null } : value;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: cleanedData,
      select: {
        id: true,
        role: true,
        nameZh: true,
        nameEn: true,
        email: true,
        phone: true,
        iaLicense: true,
        idDocNumber: true,
        idDocType: true,
        organization: true,
        isMember: true,
        memberId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("PATCH /api/admin/users/[id] prisma error:", error);
    } else {
      console.error("PATCH /api/admin/users/[id] error:", error);
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}