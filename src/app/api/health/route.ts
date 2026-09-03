import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/health
 *
 * Lightweight health check that verifies the server can read environment
 * variables and execute a database query against RDS.
 * Used to confirm that Amplify SSR + RDS connectivity is working after deploy.
 */
export async function GET() {
  try {
    // Verify database connectivity with a minimal query
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      database: "connected",
      envLoaded: Boolean(process.env.DATABASE_URL),
      awsConfig: {
        region: process.env.APP_AWS_REGION ?? null,
        s3PublicBucket: process.env.APP_S3_PUBLIC_BUCKET ?? null,
        s3PrivateBucket: process.env.APP_S3_PRIVATE_BUCKET ?? null,
        sesRegion: process.env.APP_SES_REGION ?? null,
        sesFromAddress: process.env.APP_SES_FROM_ADDRESS ?? null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/health error:", error);
    return NextResponse.json(
      { status: "error", message },
      { status: 500 },
    );
  }
}