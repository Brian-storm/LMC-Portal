import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generalFaqUpdateSchema } from "@/lib/validation/faq";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * PATCH /api/admin/faq/[id]
 *
 * Updates a FAQ (partial update). Returns 404 if not found.
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext,
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
    const existing = await prisma.generalFaq.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = generalFaqUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const faq = await prisma.generalFaq.update({
      where: { id },
      data: parsed.data,
      include: {
        category: { select: { id: true, nameZh: true, nameEn: true, nameZhCn: true } },
      },
    });

    return NextResponse.json({ generalFaq: faq });
  } catch (error) {
    console.error("PATCH /api/admin/faq/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/faq/[id]
 *
 * Deletes a FAQ. Returns 404 if not found.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
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
    const existing = await prisma.generalFaq.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await prisma.generalFaq.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/faq/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}