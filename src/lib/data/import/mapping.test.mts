import assert from "node:assert/strict";
import test from "node:test";

import {
  suggestColumnMapping,
  validateColumnMapping,
  type TargetFieldDefinition,
} from "./mapping";
import type { ImportTableColumn } from "../types";

const targets: TargetFieldDefinition[] = [
  { key: "name", header: "Name", required: true },
  { key: "email", header: "Email", required: true },
  { key: "phone", header: "Phone", required: true },
  { key: "organization", header: "Organization", required: false },
];

test("suggestColumnMapping auto-maps only unique normalized exact headers", () => {
  // 1: Include a reordered unique match, a duplicate label, and a blank label.
  const sourceColumns: ImportTableColumn[] = [
    { index: 0, header: " email " },
    { index: 1, header: "Name" },
    { index: 2, header: "NAME" },
    { index: 3, header: "" },
    { index: 4, header: "Organization" },
  ];

  // 2: Only unique exact matches are suggested; ambiguous Name columns stay unresolved.
  assert.deepEqual(suggestColumnMapping(sourceColumns, targets), [
    { sourceIndex: 0, targetField: "email" },
    { sourceIndex: 4, targetField: "organization" },
  ]);
});

test("validateColumnMapping accepts one-to-one required mappings and omitted optional fields", () => {
  // 1: Supply every required target once while leaving optional organization unmapped.
  const sourceColumns = [
    { index: 0, header: "Email Address" },
    { index: 1, header: "Full Name" },
    { index: 2, header: "Mobile" },
  ];
  const rawMapping = [
    { sourceIndex: 0, targetField: "email" },
    { sourceIndex: 1, targetField: "name" },
    { sourceIndex: 2, targetField: "phone" },
  ];

  // 2: The validated mapping keeps the exact uploaded source positions.
  const result = validateColumnMapping(sourceColumns, rawMapping, targets);
  assert.equal(result.valid, true);
  assert.deepEqual(result.mapping, rawMapping);
  assert.deepEqual(result.errors, []);
});

test("validateColumnMapping rejects reused sources, reused targets, and missing required targets", () => {
  // 1: Try to assign the same source twice and omit a required destination.
  const sourceColumns = [
    { index: 0, header: "Email" },
    { index: 1, header: "Name" },
  ];
  const rawMapping = [
    { sourceIndex: 0, targetField: "email" },
    { sourceIndex: 0, targetField: "name" },
    { sourceIndex: 1, targetField: "email" },
  ];

  // 2: Return explicit errors rather than accepting ambiguous mappings.
  const result = validateColumnMapping(sourceColumns, rawMapping, targets);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.message.includes("already assigned")));
  assert.ok(result.errors.some((error) => error.message.includes("already mapped")));
  assert.ok(result.errors.some((error) => error.field === "phone"));
});

test("validateColumnMapping rejects unknown targets, invalid indices, and non-array input", () => {
  // 1: Combine an unknown target, an out-of-range column, and a non-integer column index.
  const sourceColumns = [{ index: 0, header: "Email" }];
  const rawMapping = [
    { sourceIndex: 0, targetField: "notARegistrantField" },
    { sourceIndex: 4, targetField: "email" },
    { sourceIndex: 0.5, targetField: "name" },
  ];

  // 2: Each invalid part is reported, and malformed mapping containers fail clearly.
  const result = validateColumnMapping(sourceColumns, rawMapping, targets);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.message.includes("Unknown target field")));
  assert.ok(result.errors.some((error) => error.message.includes("Source column index")));

  const malformed = validateColumnMapping(sourceColumns, null, targets);
  assert.equal(malformed.valid, false);
  assert.equal(malformed.errors[0]?.field, "_mapping");

  const excessive = validateColumnMapping(
    sourceColumns,
    Array.from({ length: targets.length + 1 }, () => ({ sourceIndex: 0, targetField: "email" })),
    targets,
  );
  assert.equal(excessive.valid, false);
  assert.equal(excessive.errors[0]?.message, "Too many source-column mappings");
});
