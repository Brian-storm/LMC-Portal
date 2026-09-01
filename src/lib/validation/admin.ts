import { z } from "zod";

// ── Review action schema ──
// The PATCH endpoint accepts one of two actions:
//   APPROVE — sets paymentStatus to VERIFIED, optionally generates a receipt number
//   REJECT  — sets paymentStatus to REJECTED, reason is required
//
// reason is optional at the field level but required when action === REJECT,
// enforced via the .refine() cross-field validation below.
export const reviewActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  reason: z.string().min(1, "reason is required when rejecting").optional(),
  receiptNumber: z.string().min(1, "receiptNumber must not be empty").optional(),
}).refine(
  (data) => {
    // Cross-field rule: a REJECT action without a reason is invalid
    if (data.action === "REJECT" && !data.reason) {
      return false;
    }
    return true;
  },
  { message: "reason is required when action is REJECT", path: ["reason"] },
);

export type ReviewActionInput = z.infer<typeof reviewActionSchema>;
