import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/upload/confirm
 *
 * Records the S3 object key of an uploaded payment proof in the database.
 * Called by the frontend after the file has been successfully PUT to S3.
 *
 * Body: { registrantId, key }
 *
 * Returns: { success: true } on completion.
 */
export async function POST(request: NextRequest) {
  try {
    // 1: Authenticate the request
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2: Parse the request body
    const body = await request.json();
    const { registrantId, key } = body as {
      registrantId?: string;
      key?: string;
    };

    if (!registrantId || !key) {
      return NextResponse.json(
        { error: "Missing required fields: registrantId, key" },
        { status: 400 },
      );
    }

    // 3: Validate the key format matches the expected pattern
    //    Pattern: uploads/{registrantId}/{timestamp}-{sanitized-filename}
    const keyPattern = /^uploads\/[a-zA-Z0-9]+\/\d+-[a-zA-Z0-9._-]+$/;
    if (!keyPattern.test(key)) {
      return NextResponse.json(
        { error: "Invalid key format" },
        { status: 400 },
      );
    }

    // 4: Verify the registrant exists and belongs to the current user or the user is an admin
    const registrant = await prisma.registrant.findUnique({
      where: { id: registrantId },
      select: { userId: true },
    });

    if (!registrant) {
      return NextResponse.json({ error: "Registrant not found" }, { status: 404 });
    }

    const isOwner = registrant.userId === session.user.id;
    const isAdmin = !isOwner && !!(await prisma.admin.findUnique({ where: { userId: session.user.id } }));

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "You are not authorized to confirm upload for this registrant" },
        { status: 403 },
      );
    }

    // 5: Update the registrant record with the payment proof S3 key
    await prisma.registrant.update({
      where: { id: registrantId },
      data: { paymentProofUrl: key },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/upload/confirm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}