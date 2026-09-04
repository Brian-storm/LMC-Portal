import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/upload/confirm
 *
 * Records the S3 object key of an uploaded payment proof in the database.
 * Called by the frontend after the file has been successfully PUT to S3.
 *
 * Body: { registrantId, key, email? }
 *
 * Returns: { success: true } on completion.
 */
export async function POST(request: NextRequest) {
  try {
    // 1: Parse the request body
    const body = await request.json();
    const { registrantId, key, email } = body as {
      registrantId?: string;
      key?: string;
      email?: string;
    };

    if (!registrantId || !key) {
      return NextResponse.json(
        { error: "Missing required fields: registrantId, key" },
        { status: 400 },
      );
    }

    // 2: Validate the key format matches the expected pattern
    //    Pattern: uploads/{registrantId}/{timestamp}-{sanitized-filename}
    const keyPattern = /^uploads\/[a-zA-Z0-9]+\/\d+-[a-zA-Z0-9._-]+$/;
    if (!keyPattern.test(key)) {
      return NextResponse.json(
        { error: "Invalid key format" },
        { status: 400 },
      );
    }

    // 3: Resolve userId — from authenticated session or guest email
    const session = await auth();
    let userId: string | undefined;

    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      if (!email) {
        return NextResponse.json(
          { error: "Email is required for guest upload. Please sign in or provide your enrollment email." },
          { status: 401 },
        );
      }
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { error: "No user found with this email. Please sign in first." },
          { status: 404 },
        );
      }
      userId = user.id;
    }

    // 4: Verify the registrant exists and belongs to the resolved user
    const registrant = await prisma.registrant.findUnique({
      where: { id: registrantId },
      select: { userId: true },
    });

    if (!registrant) {
      return NextResponse.json({ error: "Registrant not found" }, { status: 404 });
    }

    const isOwner = registrant.userId === userId;
    const isAdmin = !isOwner && session?.user?.id && !!(await prisma.admin.findUnique({ where: { userId: session.user.id } }));

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