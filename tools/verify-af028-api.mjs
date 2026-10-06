import assert from "node:assert/strict";
import { randomInt, randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { encode } from "next-auth/jwt";

/** Validate the API and database targets before creating any test data. */
function readTestConfiguration() {
  // 1: Require explicit local-only endpoints and a disposable test signing secret.
  const apiBaseUrl = process.env.AF028_API_BASE_URL;
  const databaseUrl = process.env.AF028_TEST_DATABASE_URL;
  const authSecret = process.env.AF028_TEST_AUTH_SECRET;
  if (!apiBaseUrl || !databaseUrl || !authSecret) {
    throw new Error("Set AF028_API_BASE_URL, AF028_TEST_DATABASE_URL, and AF028_TEST_AUTH_SECRET");
  }

  // 2: Refuse to send requests or test writes to anything except the isolated local test DB.
  const apiUrl = new URL(apiBaseUrl);
  const testDatabaseUrl = new URL(databaseUrl);
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (!localHosts.has(apiUrl.hostname) || !localHosts.has(testDatabaseUrl.hostname)) {
    throw new Error("AF-028 API smoke checks are restricted to loopback hosts");
  }
  if (testDatabaseUrl.pathname !== "/lmc_af028_test") {
    throw new Error("AF028_TEST_DATABASE_URL must target the dedicated lmc_af028_test database");
  }

  return { apiBaseUrl: apiUrl.origin, databaseUrl, authSecret };
}

/** Build a small roster containing the exact template headers and one valid student. */
function createCsvRoster(email, idDocumentNumber) {
  // 1: Keep the fields synthetic and satisfy the current student row validators.
  return [
    "Chinese Name (中文姓名),English Name (英文姓名),Email (電郵),Phone (電話),ID Document No. (證件號碼),ID Doc Type (證件類型),IA License (IA牌照),Organization (機構)",
    `測試學員,Test Student,${email},+852 9123 4567,${idDocumentNumber},HKID,,`,
  ].join("\n");
}

/** Build a fresh multipart body so each request re-uploads the same logical roster. */
function createFormData(csv, mapping) {
  // 1: Attach a new File instance and include a JSON mapping only for mapped requests.
  const formData = new FormData();
  formData.set("file", new File([csv], "af028-smoke.csv", { type: "text/csv" }));
  if (mapping !== undefined) formData.set("mapping", JSON.stringify(mapping));
  return formData;
}

/** Exercise the stateless preview/confirm endpoints with an admin JWT and isolated DB. */
async function main() {
  // 1: Create a disposable Prisma client and synthetic identity values for this run.
  const { apiBaseUrl, databaseUrl, authSecret } = readTestConfiguration();
  const database = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  const runId = randomUUID();
  const email = `af028-${runId}@example.test`;
  const digits = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const idDocumentNumber = `A${digits}1`;
  const csv = createCsvRoster(email, idDocumentNumber);

  try {
    // 2: Create a signed ADMIN session cookie without reading or printing project secrets.
    const token = await encode({
      token: {
        sub: `af028-${runId}`,
        userId: `af028-${runId}`,
        role: "ADMIN",
        email: `af028-admin-${runId}@example.test`,
      },
      secret: authSecret,
      salt: "authjs.session-token",
    });
    const origin = new URL(apiBaseUrl).origin;
    const cookie = `authjs.session-token=${token}`;

    // 3: Verify auth/origin checks, raw inspection, mapping rejection, and read-only preview.
    const unauthorizedResponse = await fetch(
      new URL("/api/admin/import/registrants/preview", apiBaseUrl),
      { method: "POST", headers: { origin }, body: createFormData(csv) },
    );
    assert.equal(unauthorizedResponse.status, 401, "Missing session must be denied");

    const crossOriginResponse = await fetch(
      new URL("/api/admin/import/registrants/preview", apiBaseUrl),
      {
        method: "POST",
        headers: { cookie, origin: "https://attacker.example" },
        body: createFormData(csv),
      },
    );
    assert.equal(crossOriginResponse.status, 403, "Cross-origin requests must be denied");

    const inspectResponse = await fetch(
      new URL("/api/admin/import/registrants/preview", apiBaseUrl),
      { method: "POST", headers: { cookie, origin }, body: createFormData(csv) },
    );
    assert.equal(inspectResponse.status, 200);
    const inspection = await inspectResponse.json();
    assert.equal(inspection.totalRows, 1);
    assert.equal(inspection.sampleRows.length, 1);
    assert.equal(inspection.suggestedMapping.length, 8);

    // 4: Reject an invalid source index, then verify a valid mapped preview writes nothing.
    const invalidMapping = inspection.suggestedMapping.map((entry) => ({ ...entry }));
    invalidMapping[0].sourceIndex = 999;
    const invalidMappingResponse = await fetch(
      new URL("/api/admin/import/registrants/preview", apiBaseUrl),
      {
        method: "POST",
        headers: { cookie, origin },
        body: createFormData(csv, invalidMapping),
      },
    );
    assert.equal(invalidMappingResponse.status, 422);

    const mappedPreviewResponse = await fetch(
      new URL("/api/admin/import/registrants/preview", apiBaseUrl),
      {
        method: "POST",
        headers: { cookie, origin },
        body: createFormData(csv, inspection.suggestedMapping),
      },
    );
    assert.equal(mappedPreviewResponse.status, 200);
    const mappedPreview = await mappedPreviewResponse.json();
    assert.equal(mappedPreview.validCount, 1);
    assert.equal(mappedPreview.errorCount, 0);
    assert.equal(await database.user.findUnique({ where: { email } }), null);

    // 5: Confirm re-uploads the file, creates one STUDENT, and rejects a duplicate replay.
    const confirmUrl = new URL("/api/admin/import/registrants/confirm", apiBaseUrl);
    const confirmResponse = await fetch(confirmUrl, {
      method: "POST",
      headers: { cookie, origin },
      body: createFormData(csv, inspection.suggestedMapping),
    });
    assert.equal(confirmResponse.status, 200);
    const confirmation = await confirmResponse.json();
    assert.equal(confirmation.imported, 1);
    const createdUser = await database.user.findUnique({ where: { email } });
    assert.equal(createdUser?.role, "STUDENT");

    const duplicateConfirmResponse = await fetch(confirmUrl, {
      method: "POST",
      headers: { cookie, origin },
      body: createFormData(csv, inspection.suggestedMapping),
    });
    assert.equal(duplicateConfirmResponse.status, 422);
    assert.equal((await duplicateConfirmResponse.json()).imported, 0);

    console.log(
      "AF-028 API smoke passed: auth/origin, inspect, invalid mapping, read-only preview, confirm, and duplicate replay",
    );
  } finally {
    // 6: Remove only the synthetic user created by this smoke run and close its DB client.
    await database.user.deleteMany({ where: { email: { in: [email] } } });
    await database[String.fromCharCode(36) + "disconnect"]();
  }
}

main().catch((error) => {
  // 1: Print a concise failure without including test credentials or roster values.
  console.error("AF-028 API smoke failed:", error instanceof Error ? error.name : "UnknownError");
  process.exitCode = 1;
});
