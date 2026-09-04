import "server-only";

import nodemailer from "nodemailer";
import { sesClient, sesFromAddress } from "@/lib/aws";
import type { EmailRecipient, EmailCourseInfo, EmailReceiptInfo, SendReceiptEmailParams } from "./types";
import { buildEmailContent } from "./templates";

// ── Nodemailer SES transport ────────────────────────────────────────────────

/**
 * Creates a nodemailer transport using the existing SES client.
 * Uses a type assertion because the SES transport option is not typed
 * in the nodemailer type definitions for AWS SDK v3.
 */
function createTransport() {
  return nodemailer.createTransport({
    SES: { ses: sesClient },
  } as nodemailer.TransportOptions);
}

// ── Main: send receipt email via SES ────────────────────────────────────────

/**
 * Sends the receipt email via SES with the PDF as an attachment.
 * BCCs the admin (from address) for audit trail.
 * On failure, logs the error but does NOT throw — the caller should not
 * roll back approval if only the email fails.
 */
export async function sendReceiptEmail(params: SendReceiptEmailParams): Promise<void> {
  const { recipient, course, receipt, pdfBuffer, pdfFilename } = params;

  // Build bilingual email content
  const { subject, html } = buildEmailContent(recipient, course, receipt);

  try {
    const transporter = createTransport();

    await transporter.sendMail({
      from: sesFromAddress,
      to: recipient.email,
      bcc: sesFromAddress, // BCC admin for audit trail
      subject,
      html,
      attachments: [
        {
          filename: pdfFilename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    console.log(`Receipt email sent to ${recipient.email} for receipt ${receipt.receiptNumber}`);
  } catch (error) {
    // Log the failure but do not propagate — the receipt PDF is already stored in the DB
    console.error(`FAILED to send receipt email for ${receipt.receiptNumber} to ${recipient.email}:`, error);
  }
}

// Re-export types for convenience
export type { EmailRecipient, EmailCourseInfo, EmailReceiptInfo, SendReceiptEmailParams };