import "server-only";

import { prisma } from "@/lib/prisma";

import { TEXTS } from "./texts";
import { renderReceiptPdf } from "./render";
import { lock, receiptPassword } from "./encrypt";

// ── Data types ──────────────────────────────────────────────────────────────

export interface ReceiptRegistrant {
  id: string;
  paymentMethod: string | null;
  submittedAt: Date;
}

export interface ReceiptUser {
  nameZh: string;
  nameEn: string;
  idDocNumber: string;
  email: string;
}

export interface ReceiptCourse {
  nameZh: string;
  nameEn: string;
  price: number | string;
  iaRefNumber: string | null;
  cpdHours: number;
}

export interface ReceiptResult {
  receiptNumber: string;
  pdfBuffer: Buffer;
}

// ── Receipt number generator ────────────────────────────────────────────────

const RECEIPT_PREFIX = "RCPT";

async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear().toString();

  const lastReceipt = await prisma.registrant.findFirst({
    where: {
      receiptNumber: {
        startsWith: `${RECEIPT_PREFIX}-${year}-`,
      },
    },
    orderBy: { receiptNumber: "desc" },
    select: { receiptNumber: true },
  });

  let nextSeq = 1;
  if (lastReceipt?.receiptNumber) {
    const parts = lastReceipt.receiptNumber.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  const seqPadded = nextSeq.toString().padStart(5, "0");
  return `${RECEIPT_PREFIX}-${year}-${seqPadded}`;
}

// ── Main: generate receipt PDF ──────────────────────────────────────────────

export async function generateReceipt(
  registrant: ReceiptRegistrant,
  user: ReceiptUser,
  course: ReceiptCourse,
): Promise<ReceiptResult> {
  const receiptNumber = await generateReceiptNumber();

  const feeStr = typeof course.price === "number" ? course.price.toFixed(2) : course.price;
  const paymentDate = new Date(registrant.submittedAt).toLocaleDateString("en-CA");
  const paymentMethod = registrant.paymentMethod ?? TEXTS.dash;

  const pdfBuffer = await renderReceiptPdf({
    receiptNumber,
    nameZh: user.nameZh,
    nameEn: user.nameEn,
    courseZh: course.nameZh,
    courseEn: course.nameEn,
    iaRef: course.iaRefNumber,
    cpdHours: course.cpdHours,
    fee: feeStr,
    paymentMethod,
    paymentDate,
  });

  // Password-protect with the first 6 digits of the registrant's idDocNumber
  const protectedPdfBuffer = Buffer.from(await lock(pdfBuffer, receiptPassword(user.idDocNumber)));

  return { receiptNumber, pdfBuffer: protectedPdfBuffer };
}