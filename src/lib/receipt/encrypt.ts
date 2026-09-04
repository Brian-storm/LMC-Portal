import "server-only";

import * as PDFLib from "pdf-lib";
import { configure, lock } from "pdf-lib-encrypt";

// Configure pdf-lib-encrypt once at module level.
// Both generate.tsx and the download route import from here,
// so configure() is called exactly once regardless of Turbopack's bundling.
configure(PDFLib);

export { lock };

/**
 * Extracts the first 6 consecutive digits from an ID document number.
 *
 * Examples:
 *   "A123456(7)"  → "123456"
 *   "IA12345678"  → "123456"
 *   "1234567890"  → "123456"
 *   "ABC"         → "000000" (fallback if fewer than 6 digits exist)
 */
export function receiptPassword(idDocNumber: string): string {
  const digits = idDocNumber.replace(/\D/g, "");
  return digits.length >= 6 ? digits.slice(0, 6) : digits.padEnd(6, "0");
}