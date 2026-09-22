/**
 * POST /api/admin/import/registrants/confirm
 *
 * Confirm an import: write all valid rows from the preview session to the database
 * inside a Prisma transaction. Returns counts of imported/failed rows.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getImportSession, deleteImportSession } from "@/lib/data/import/temp-store";
import type { ImportError } from "@/lib/data/types";

// Prisma-generated IdDocType enum values
type IdDocTypeValue = "HKID" | "PASSPORT" | "PERMIT" | "OTHER";

/** Map a normalized string to the Prisma IdDocType enum. */
function toIdDocType(value: string | null): IdDocTypeValue | null {
  if (value === "HKID" || value === "PASSPORT" || value === "PERMIT" || value === "OTHER") {
    return value;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // 1: Auth check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // 2: Parse request body
    const body = await request.json();
    const { importId } = body as { importId?: string };
    if (!importId || typeof importId !== "string") {
      return NextResponse.json({ error: "importId is required" }, { status: 400 });
    }

    // 3: Retrieve preview session
    const importSession = getImportSession(importId);
    if (!importSession) {
      return NextResponse.json(
        { error: "Import session not found or expired. Please re-upload the file." },
        { status: 404 },
      );
    }

    // 4: Filter to valid rows only
    const validRows = importSession.rows.filter((r) => r.valid);
    if (validRows.length === 0) {
      return NextResponse.json(
        { error: "No valid rows to import." },
        { status: 400 },
      );
    }

    // 5: Write valid rows to the database in a transaction
    const confirmErrors: ImportError[] = [];
    let imported = 0;

    await prisma.$transaction(async (tx) => {
      for (const row of validRows) {
        try {
          // Normalize idDocType to the enum value
          const idDocTypeUpper = row.idDocType?.trim().toUpperCase() || "";
          const normalizedDocType = toIdDocType(
            idDocTypeUpper === "HONG KONG ID" ? "HKID" : idDocTypeUpper,
          );

          // Check if user with this email already exists (race condition guard)
          const existing = await tx.user.findUnique({
            where: { email: row.email.trim() },
            select: { id: true },
          });

          if (existing) {
            // Update existing user instead of creating duplicate
            await tx.user.update({
              where: { id: existing.id },
              data: {
                nameZh: row.nameZh.trim(),
                nameEn: row.nameEn.trim(),
                phone: row.phone.trim(),
                idDocNumber: row.idDocNumber.trim(),
                idDocType: normalizedDocType,
                iaLicense: row.iaLicense?.trim() || null,
                organization: row.organization?.trim() || null,
              },
            });
          } else {
            await tx.user.create({
              data: {
                nameZh: row.nameZh.trim(),
                nameEn: row.nameEn.trim(),
                email: row.email.trim().toLowerCase(),
                phone: row.phone.trim(),
                idDocNumber: row.idDocNumber.trim(),
                idDocType: normalizedDocType,
                iaLicense: row.iaLicense?.trim() || null,
                organization: row.organization?.trim() || null,
                role: "STUDENT",
              },
            });
          }

          imported++;
        } catch (err) {
          // Log the specific error for debugging
          console.error(`Failed to import row ${row.rowNumber} (${row.email}):`, err);
          confirmErrors.push({
            row: row.rowNumber,
            field: "_row",
            message: err instanceof Error ? err.message : "Unknown database error",
          });
        }
      }
    });

    // 6: Clean up the temp session
    deleteImportSession(importId);

    // 7: Return result
    return NextResponse.json({
      imported,
      failed: confirmErrors.length,
      errors: confirmErrors,
    });
  } catch (error) {
    console.error("POST /api/admin/import/registrants/confirm error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}