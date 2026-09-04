import "server-only";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { s3Client, s3PrivateBucket } from "@/lib/aws";
import React from "react";
import { renderToStream, Document, Page, View, Text } from "@react-pdf/renderer";
import * as PDFLib from "pdf-lib";
import { configure, lock } from "pdf-lib-encrypt";
import { Readable } from "stream";

import { TEXTS } from "./texts";
import { styles } from "./styles";

// Configure pdf-lib-encrypt with the pdf-lib module (once)
configure(PDFLib);

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
  s3Key: string;
}

// ── Receipt number generator ────────────────────────────────────────────────

const RECEIPT_PREFIX = "RCPT";

/**
 * Generates the next receipt number in the format RCPT-YYYY-NNNNN.
 * Queries the database for the highest existing sequence for the current year
 * and increments by 1.
 */
async function generateReceiptNumber(): Promise<string> {
  const year = new Date().getFullYear().toString();

  // Find the highest receipt number for this year
  const lastReceipt = await prisma.registrant.findFirst({
    where: {
      receiptNumber: {
        startsWith: `${RECEIPT_PREFIX}-${year}-`,
      },
    },
    orderBy: { receiptNumber: "desc" },
    select: { receiptNumber: true },
  });

  // Extract the sequence portion and increment
  let nextSeq = 1;
  if (lastReceipt?.receiptNumber) {
    const parts = lastReceipt.receiptNumber.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  // Pad to 5 digits
  const seqPadded = nextSeq.toString().padStart(5, "0");
  return `${RECEIPT_PREFIX}-${year}-${seqPadded}`;
}

// ── React PDF Document ──────────────────────────────────────────────────────

interface ReceiptDocumentProps {
  receiptNumber: string;
  registrantNameZh: string;
  registrantNameEn: string;
  courseNameZh: string;
  courseNameEn: string;
  iaRefNumber: string | null;
  cpdHours: number;
  fee: string;
  paymentMethod: string;
  paymentDate: string;
  submittedAt: Date;
}

/**
 * ReceiptDocument renders the bilingual (ZH+EN) receipt PDF layout.
 * All hardcoded display strings come from TEXTS; all layout from styles.
 */
const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({
  receiptNumber,
  registrantNameZh,
  registrantNameEn,
  courseNameZh,
  courseNameEn,
  iaRefNumber,
  cpdHours,
  fee,
  paymentMethod,
  paymentDate,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* 1: Header with company name and receipt title */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.companyName}>{TEXTS.companyNameEn}</Text>
          <Text style={styles.companySub}>{TEXTS.companyNameZh}</Text>
        </View>
        <View>
          <Text style={styles.receiptTitle}>{TEXTS.receiptTitleEn}</Text>
          <Text style={styles.receiptTitleZh}>{TEXTS.receiptTitleZh}</Text>
        </View>
      </View>

      {/* 2: Receipt metadata */}
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.receiptNoLabel}</Text>
        <Text style={styles.metaValue}>{receiptNumber}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.dateLabel}</Text>
        <Text style={styles.metaValue}>{paymentDate}</Text>
      </View>

      {/* 3: Registrant info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{TEXTS.registrantSection}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.nameEnLabel}</Text>
        <Text style={styles.metaValue}>{registrantNameEn}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.nameZhLabel}</Text>
        <Text style={styles.metaValue}>{registrantNameZh}</Text>
      </View>

      {/* 4: Course details table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{TEXTS.courseSection}</Text>
      </View>
      <View style={styles.tableHeader}>
        <Text style={styles.colDescription}>{TEXTS.tableDescription}</Text>
        <Text style={styles.colRef}>{TEXTS.tableIaRef}</Text>
        <Text style={styles.colHours}>{TEXTS.tableCpd}</Text>
        <Text style={styles.colAmount}>{TEXTS.tableAmount}</Text>
      </View>
      <View style={styles.tableRow}>
        <Text style={styles.colDescription}>
          {courseNameEn}{"\n"}{courseNameZh}
        </Text>
        <Text style={styles.colRef}>{iaRefNumber ?? TEXTS.dash}</Text>
        <Text style={styles.colHours}>{cpdHours}</Text>
        <Text style={styles.colAmount}>HKD {fee}</Text>
      </View>

      {/* 5: Total */}
      <View style={styles.totalRow}>
        <Text>{TEXTS.totalPrefix}{fee}</Text>
      </View>

      {/* 6: Payment info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{TEXTS.paymentSection}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.methodLabel}</Text>
        <Text style={styles.metaValue}>{paymentMethod}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>{TEXTS.statusLabel}</Text>
        <Text style={styles.metaValue}>{TEXTS.statusVerified}</Text>
      </View>

      {/* 7: Stamp area */}
      <View style={styles.stampSection}>
        <View style={styles.stampBox}>
          <Text style={styles.stampTitle}>{TEXTS.stampTitle}</Text>
          <Text style={styles.stampText}>{TEXTS.stampSubtitle}</Text>
          <Text style={[styles.stampText, { marginTop: 4 }]}>{TEXTS.stampAuthorised}</Text>
        </View>
      </View>

      {/* 8: Footer */}
      <Text style={styles.footer}>
        {TEXTS.footerDisclaimer}{"\n"}
        {TEXTS.footerAddress}
      </Text>
    </Page>
  </Document>
);

// ── Helper: stream → Buffer ─────────────────────────────────────────────────

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

// ── Main: generate receipt PDF, password-protect, upload to S3 ──────────────

export async function generateReceipt(
  registrant: ReceiptRegistrant,
  user: ReceiptUser,
  course: ReceiptCourse,
): Promise<ReceiptResult> {
  // 1: Generate receipt number (auto-incrementing)
  const receiptNumber = await generateReceiptNumber();

  // 2: Format data
  const feeStr = typeof course.price === "number" ? course.price.toFixed(2) : course.price;
  const paymentDate = new Date(registrant.submittedAt).toLocaleDateString("en-CA");
  const paymentMethod = registrant.paymentMethod ?? TEXTS.dash;

  // 3: Render PDF via @react-pdf/renderer
  const pdfStream = await renderToStream(
    <ReceiptDocument
      receiptNumber={receiptNumber}
      registrantNameZh={user.nameZh}
      registrantNameEn={user.nameEn}
      courseNameZh={course.nameZh}
      courseNameEn={course.nameEn}
      iaRefNumber={course.iaRefNumber}
      cpdHours={course.cpdHours}
      fee={feeStr}
      paymentMethod={paymentMethod}
      paymentDate={paymentDate}
      submittedAt={registrant.submittedAt}
    />,
  );
  const pdfBuffer = await streamToBuffer(pdfStream as Readable);

  // 4: Password-protect with pdf-lib-encrypt using the registrant's idDocNumber
  const protectedPdfBuffer = Buffer.from(await lock(pdfBuffer, user.idDocNumber));

  // 5: Upload to S3
  const s3Key = `receipts/${receiptNumber}.pdf`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: s3PrivateBucket,
      Key: s3Key,
      Body: protectedPdfBuffer,
      ContentType: "application/pdf",
    }),
  );

  console.log(`Receipt PDF uploaded to S3: ${s3Key}`);

  return { receiptNumber, s3Key };
}