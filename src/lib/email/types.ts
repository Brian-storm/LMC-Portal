// ── Data types for email sending ────────────────────────────────────────────

export interface EmailRecipient {
  email: string;
  nameZh: string;
  nameEn: string;
}

export interface EmailCourseInfo {
  nameZh: string;
  nameEn: string;
}

export interface EmailReceiptInfo {
  receiptNumber: string;
  fee: string;
}

export interface SendReceiptEmailParams {
  recipient: EmailRecipient;
  course: EmailCourseInfo;
  receipt: EmailReceiptInfo;
  pdfBuffer: Buffer;
  pdfFilename: string;
}