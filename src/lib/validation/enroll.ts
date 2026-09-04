import { z } from "zod";

// ── Enums ──

const enrollmentTypeEnum = z.enum(["INDIVIDUAL", "ORGANIZATION"]);
const paymentMethodEnum = z.enum(["FPS", "ALIPAY", "E_BANKING", "CHEQUE", "CASH", "CORPORATE_INVOICE"]);

// ── Group member schema (used when enrollmentType === ORGANIZATION) ──

const registrantSchema = z.object({
  nameZh: z.string().min(1, "nameZh is required"),
  nameEn: z.string().min(1, "nameEn is required"),
  email: z.string().email("Invalid email format"),
  idDocNumber: z.string().min(1, "idDocNumber is required"),
});

// ── Enrollment request schema ──
// courseId + scheduleId identify the course and its specific session.
// enrollmentType dictates whether this is individual or group registration.
// For ORGANIZATION enrollment, the registrants array is required (.refine below).
// isThirdPartyPay + payerFullName allow a third party to pay on behalf of the enrollee.

export const enrollSchema = z
  .object({
    courseId: z.string().min(1, "courseId is required"),
    scheduleId: z.string().min(1, "scheduleId is required"),
    enrollmentType: enrollmentTypeEnum,
    paymentMethod: paymentMethodEnum,
    registrants: z.array(registrantSchema).optional(),
    isThirdPartyPay: z.boolean().default(false),
    payerFullName: z.string().optional(),
    // Guest enrollee fields — used when no authenticated session exists
    email: z.string().email("Invalid email format").optional(),
    fullName: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    iaLicenseNo: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.enrollmentType === "ORGANIZATION") {
        return data.registrants && data.registrants.length > 0;
      }
      return true;
    },
    { message: "registrants array is required for ORGANIZATION enrollment", path: ["registrants"] },
  );

export type EnrollInput = z.infer<typeof enrollSchema>;