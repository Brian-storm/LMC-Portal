import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearFeatureFlagCache, FEATURE_FLAGS } from "@/lib/feature-flags";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  if (!(key in FEATURE_FLAGS)) {
    return NextResponse.json({ error: `Unknown feature flag: ${key}` }, { status: 400 });
  }
  try {
    const body = await _req.json();
    const enabled = Boolean(body.enabled);
    const flag = await prisma.featureFlag.upsert({
      where: { key },
      update: { enabled },
      create: { key, enabled, description: FEATURE_FLAGS[key as keyof typeof FEATURE_FLAGS] },
    });
    clearFeatureFlagCache();
    return NextResponse.json(flag);
  } catch (err) {
    console.error(`Failed to update feature flag ${key}:`, err);
    return NextResponse.json(
      { error: "Failed to update feature flag" },
      { status: 500 },
    );
  }
}