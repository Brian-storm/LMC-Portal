import assert from "node:assert/strict";
import { randomInt, randomUUID } from "node:crypto";
import test from "node:test";
import { PrismaClient } from "@prisma/client";

import { createUsersAtomically, RegistrantImportConflictError, type ValidatedRow } from "./registrants";

const testDatabaseUrl = process.env.AF028_TEST_DATABASE_URL;

/** Permit database integration only against the dedicated local AF-028 test database. */
function isDedicatedLocalTestDatabase(databaseUrl: string | undefined): boolean {
  // 1: Reject absent URLs, non-loopback hosts, and database names outside the isolated test DB.
  if (!databaseUrl) return false;
  try {
    const parsedUrl = new URL(databaseUrl);
    return (
      ["127.0.0.1", "localhost", "::1"].includes(parsedUrl.hostname) &&
      parsedUrl.pathname === "/lmc_af028_test"
    );
  } catch {
    return false;
  }
}

/** Build a valid student row with a unique test identity and physical source row. */
function makeDatabaseRow(suffix: string, rowNumber: number): ValidatedRow {
  // 1: Use a valid HKID-shaped value and unique email for safe test cleanup.
  const digits = String(randomInt(0, 1_000_000)).padStart(6, "0");
  return {
    nameZh: "測試學員",
    nameEn: "Test Student",
    email: `af028-${suffix}-${rowNumber}@example.test`,
    phone: "+852 9123 4567",
    idDocNumber: `A${digits}1`,
    idDocType: "HKID",
    iaLicense: "",
    organization: "",
    rowNumber,
    errors: [],
    valid: true,
  };
}

test(
  "PostgreSQL integration creates complete batches and rolls back earlier writes on conflict",
  { skip: isDedicatedLocalTestDatabase(testDatabaseUrl) ? false : "Set AF028_TEST_DATABASE_URL to the isolated loopback lmc_af028_test database" },
  async () => {
    // 1: Connect a dedicated Prisma client directly to the isolated loopback test database.
    const client = new PrismaClient({
      datasources: { db: { url: testDatabaseUrl } },
    });
    const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
    const rollbackFirst = makeDatabaseRow(suffix, 101);
    const existing = makeDatabaseRow(suffix, 102);
    const successfulFirst = makeDatabaseRow(suffix, 201);
    const successfulSecond = makeDatabaseRow(suffix, 202);
    const fixtureEmails = [
      rollbackFirst.email,
      existing.email,
      successfulFirst.email,
      successfulSecond.email,
    ];

    try {
      // 2: Create a known conflicting user; the first row of the tested batch must roll back.
      await client.user.create({
        data: {
          nameZh: existing.nameZh,
          nameEn: existing.nameEn,
          email: existing.email,
          phone: existing.phone,
          idDocNumber: existing.idDocNumber,
          idDocType: "HKID",
          role: "STUDENT",
        },
      });
      await assert.rejects(
        createUsersAtomically([rollbackFirst, existing], client),
        RegistrantImportConflictError,
      );
      assert.equal(await client.user.findUnique({ where: { email: rollbackFirst.email } }), null);
      assert.ok(await client.user.findUnique({ where: { email: existing.email } }));

      // 3: Verify a valid batch persists every row through the same transaction helper.
      await createUsersAtomically([successfulFirst, successfulSecond], client);
      const persisted = await client.user.findMany({
        where: { email: { in: [successfulFirst.email, successfulSecond.email] } },
      });
      assert.equal(persisted.length, 2);
      assert.ok(persisted.every((user) => user.role === "STUDENT"));
    } finally {
      // 4: Delete only rows created by this test run, leaving the isolated database otherwise intact.
      await client.user.deleteMany({ where: { email: { in: fixtureEmails } } });
      await client.$disconnect();
    }
  },
);
