// ── Types matching the API response ──

export type PaymentStatus = "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "REFUNDED";
export type EnrollmentType = "INDIVIDUAL" | "ORGANIZATION";
export type PaymentMethod = "FPS" | "ALIPAY" | "E_BANKING" | "CHEQUE" | "CASH" | "CORPORATE_INVOICE";

export interface EnrolmentUser {
  id: string;
  nameEn: string;
  nameZh: string;
  email: string;
  phone: string;
  idDocType: string | null;
  idDocNumber: string;
  iaLicense: string | null;
  organization: string | null;
}

export interface EnrolmentSchedule {
  id: string;
  dateAndTime: string;
  sessionDate: string | null;
  startTime: string;
  endTime: string;
  venue: string;
  venueEn: string | null;
  venueZh: string | null;
  cpdHoursIa: number;
  instructors: Array<{
    instructor: { id: string; nameEn: string; nameZh: string };
  }>;
  topics: Array<{
    syllabusItem: { id: string; titleEn: string; titleZh: string };
    sortOrder: number;
  }>;
}

export interface EnrolmentMember {
  id: string;
  fee: number | null;
  user: EnrolmentUser;
  schedules: Array<{ schedule: EnrolmentSchedule }>;
}

export interface EnrolmentCourse {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string;
  nameCn: string | null;
  iaRefNumber: string | null;
  cpdHours: number;
}

export interface Enrolment {
  id: string;
  enrollmentType: EnrollmentType;
  groupId: string | null;
  registrantCount: number | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  fee: number | null;
  isThirdPartyPay: boolean;
  payerFullName: string | null;
  paymentProofUrl: string | null;
  receiptNumber: string | null;
  submittedAt: string;
  user: EnrolmentUser;
  course: EnrolmentCourse;
  schedules: Array<{ schedule: EnrolmentSchedule }>;
  members?: EnrolmentMember[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}