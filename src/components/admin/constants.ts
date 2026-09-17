import type { PaymentStatus, PaymentMethod } from "./types";

// ── Status tab definitions ──

export const STATUS_TABS: { label: string; value: PaymentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING_VERIFICATION" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
];

export const STATUS_BADGE: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING_VERIFICATION: { label: "Pending", variant: "outline" },
  VERIFIED: { label: "Verified", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "secondary" },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  FPS: "FPS",
  ALIPAY: "Alipay",
  E_BANKING: "E-Banking",
  CHEQUE: "Cheque",
  CASH: "Cash",
  CORPORATE_INVOICE: "Corporate Invoice",
};

export const ID_DOC_TYPE_LABELS: Record<string, string> = {
  HKID: "HKID",
  PASSPORT: "Passport",
  PERMIT: "Permit",
  OTHER: "Other",
};

// Pre-defined rejection reasons mapped to short labels
export const REJECTION_REASONS = [
  {
    value: "Payment proof is illegible, please re-upload a clear copy.",
    label: "Illegible",
  },
  {
    value: "Uploaded slip is invalid — please provide the correct payment proof.",
    label: "Invalid slip",
  },
  {
    value: "Blurry image — please re-upload a clearer photo/screenshot of the payment slip.",
    label: "Blurry image",
  },
  {
    value: "Incorrect payment amount — please verify the amount and re-upload.",
    label: "Incorrect value",
  },
] as const;