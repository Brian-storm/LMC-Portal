import assert from "node:assert/strict";
import test from "node:test";
import type { Prisma, PrismaClient } from "@prisma/client";

import {
  createUsersAtomically,
  mapRegistrantTableRows,
  parseRegistrantFile,
  RegistrantImportConflictError,
  validateRegistrantRows,
  type ExistingRegistrantValues,
  type ValidatedRow,
} from "./registrants";
import type { ImportTable } from "../types";

/** Create one valid row fixture with stable physical source-row metadata. */
function makeRow(overrides: Partial<ValidatedRow> = {}): ValidatedRow {
  // 1: Provide all required student fields and allow each test to override targeted values.
  return {
    nameZh: "陳嘉明",
    nameEn: "Ming Chan",
    email: "ming@example.test",
    phone: "+852 9123 4567",
    idDocNumber: "A1234567",
    idDocType: "HKID",
    iaLicense: "",
    organization: "",
    rowNumber: 2,
    errors: [],
    valid: true,
    ...overrides,
  };
}

/** Build an in-memory Prisma transaction runner that commits staged writes only on success. */
function makeFakeDatabase(existingByLookup: Array<Record<string, unknown> | null> = []) {
  // 1: Hold staged rows separately so a rejected callback proves rollback semantics.
  const committedRows: Array<Record<string, unknown>> = [];
  let lookupIndex = 0;
  const database = {
    $transaction: async (
      callback: (transaction: Prisma.TransactionClient) => Promise<void>,
    ) => {
      const pendingRows: Array<Record<string, unknown>> = [];
      const transaction = {
        user: {
          findFirst: async () => {
            const result = existingByLookup[lookupIndex] ?? null;
            lookupIndex += 1;
            return result;
          },
          create: async ({ data }: { data: Record<string, unknown> }) => {
            pendingRows.push(data);
            return data;
          },
        },
      } as unknown as Prisma.TransactionClient;

      // 2: Commit staged records only if the transaction callback completes normally.
      await callback(transaction);
      committedRows.push(...pendingRows);
    },
  } as unknown as Pick<PrismaClient, "$transaction">;

  return { database, committedRows };
}

test("parseRegistrantFile reads raw CSV source headers without exact template matching", async () => {
  // 1: Supply a CSV with arbitrary labels and a leading blank physical line.
  const file = Buffer.from("\nFull name,Contact Email\nMing Chan,ming@example.test", "utf-8");

  // 2: Preserve those headers and row numbers for the mapping stage.
  const result = await parseRegistrantFile(file, "ROSTER.CSV");
  assert.equal(result.success, true);
  assert.deepEqual(result.table?.columns, [
    { index: 0, header: "Full name" },
    { index: 1, header: "Contact Email" },
  ]);
  assert.deepEqual(result.table?.rows[0], {
    rowNumber: 3,
    values: ["Ming Chan", "ming@example.test"],
  });
});

test("mapRegistrantTableRows applies source indices and keeps optional destinations blank", () => {
  // 1: Map arbitrary source columns to target fields while leaving optional destinations absent.
  const table: ImportTable = {
    columns: [
      { index: 0, header: "Contact Email" },
      { index: 1, header: "Member Name" },
    ],
    rows: [{ rowNumber: 9, values: ["ming@example.test", "Ming Chan"] }],
  };
  const mapping = [
    { sourceIndex: 0, targetField: "email" },
    { sourceIndex: 1, targetField: "nameEn" },
  ];

  // 2: The returned row uses the exact physical row and defaults omitted optional data to blank.
  assert.deepEqual(mapRegistrantTableRows(table, mapping), [
    {
      rowNumber: 9,
      nameZh: "",
      nameEn: "Ming Chan",
      email: "ming@example.test",
      phone: "",
      idDocNumber: "",
      idDocType: "",
      iaLicense: "",
      organization: "",
    },
  ]);
});

test("validateRegistrantRows detects intra-file duplicates at the later source row", () => {
  // 1: Two otherwise valid rows share an email but retain distinct physical source rows.
  const rows = [
    makeRow({ rowNumber: 4, email: "duplicate@example.test" }),
    makeRow({ rowNumber: 11, email: " DUPLICATE@example.test ", idDocNumber: "B1234567" }),
  ];
  const existingValues: ExistingRegistrantValues = {
    emails: new Set(),
    idDocs: new Set(),
    licenses: new Set(),
  };

  // 2: Keep the first row valid and report the duplicate on the later original row number.
  const validated = validateRegistrantRows(rows, existingValues);
  assert.equal(validated[0]?.valid, true);
  assert.equal(validated[1]?.valid, false);
  assert.equal(validated[1]?.errors[0]?.row, 11);
  assert.equal(validated[1]?.errors[0]?.field, "email");
});

test("createUsersAtomically stages all new users as STUDENT rows", async () => {
  // 1: Use a fake transaction runner that records writes only after successful completion.
  const { database, committedRows } = makeFakeDatabase([null, null]);

  // 2: Create two valid records and ensure the transaction writes only new student users.
  await createUsersAtomically(
    [makeRow(), makeRow({ rowNumber: 3, email: "second@example.test", idDocNumber: "B1234567" })],
    database,
  );
  assert.equal(committedRows.length, 2);
  assert.deepEqual(committedRows.map((row) => row.role), ["STUDENT", "STUDENT"]);
});

test("createUsersAtomically rolls back earlier staged rows on a later identity conflict", async () => {
  // 1: Allow the first row, then report a conflicting existing user for the second row.
  const { database, committedRows } = makeFakeDatabase([
    null,
    { email: "exists@example.test", idDocNumber: "Z1234567", iaLicense: null },
  ]);
  const rows = [
    makeRow({ rowNumber: 5, email: "first@example.test", idDocNumber: "A1234567" }),
    makeRow({ rowNumber: 12, email: "exists@example.test", idDocNumber: "Z1234567" }),
  ];

  // 2: The conflict is surfaced and no staged row reaches the fake committed store.
  const error = await createUsersAtomically(rows, database).catch((caught: unknown) => caught);
  assert.ok(error instanceof RegistrantImportConflictError);
  assert.equal(error.failedCount, rows.length);
  assert.deepEqual(committedRows, []);
});
