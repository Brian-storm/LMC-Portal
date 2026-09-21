"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { EnrollPageDict } from "@/dictionaries/types";
import { ProgressTracker } from "./ProgressTracker";
import { AttendeeDetailsStep } from "./AttendeeDetailsStep";
import { ScheduleSelectionStep } from "./ScheduleSelectionStep";
import { RegulatoryDeclarationStep } from "./RegulatoryDeclarationStep";
import { PaymentMethodStep } from "./PaymentMethodStep";
import { SummarySidebar } from "./SummarySidebar";

interface CourseData {
  id: string;
  nameZh: string;
  nameEn: string;
  nameCn: string | null;
  price: string;
  unitPrice?: string;
  registrationStatus: string;
  capacity: number;
  schedules: {
    id: string;
    dateAndTime: string;
    venue: string;
    quotaRemaining: number;
    instructor?: { name: string; title: string; bio: string };
    topics: {
      syllabusItem: {
        id: string;
        moduleNumber: number;
        titleZh: string;
        titleEn: string;
        duration: string;
        topicsZh: string[];
        topicsEn: string[];
      };
    }[];
  }[];
}

// Map form payment method labels to API PaymentMethod enum values
const paymentMethodMap: Record<string, string> = {
  fps: "FPS",
  alipay: "ALIPAY",
  direct_transfer: "CORPORATE_INVOICE",
};

interface EnrollmentWizardProps {
  dict: EnrollPageDict;
  currentLocale: string;
  slug: string;
}

export default function EnrollmentWizard({ dict, currentLocale: locale, slug }: EnrollmentWizardProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // Course state
  const [course, setCourse] = useState<CourseData | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [courseError, setCourseError] = useState("");

  // Form State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    nameZh: "",
    email: "",
    phone: "",
    company: "",
    iaLicenseNo: "",
    agreedToTerms: false,
    declaredEligible: false,
    paymentMethod: "fps",
  });

  // Identity document type: HKID, Passport, Permit, or Other
  const [idDocType, setIdDocType] = useState<"HKID" | "PASSPORT" | "PERMIT" | "OTHER">("HKID");

  // HKID single field — user enters full number incl. check digit (e.g. A1234567)
  const [hkidNumber, setHkidNumber] = useState("");

  // Passport number (alternative to HKID)
  const [passportNumber, setPassportNumber] = useState("");

  // 2024/09/09 — New identity document types
  const [permitNumber, setPermitNumber] = useState("");
  const [otherIdDocVal, setOtherIdDocVal] = useState("");

  // Selected schedule IDs (multi-select for course sessions)
  const [selectedScheduleIds, setSelectedScheduleIds] = useState<string[]>([]);

  // Field-level validation errors: field name → error message
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Enrollment type toggle: INDIVIDUAL vs ORGANIZATION
  const [enrollmentType, setEnrollmentType] = useState<"INDIVIDUAL" | "ORGANIZATION">("INDIVIDUAL");

  // Multi-registrant rows for ORGANIZATION enrollment
  const [registrantMembers] = useState<
    {
      nameZh: string;
      nameEn: string;
      email: string;
      idDocType: "HKID" | "PASSPORT" | "PERMIT" | "OTHER";
      hkidNumber: string;
      passportNumber: string;
      permitNumber: string;
      otherIdDocVal: string;
      idDocNumber: string;
    }[]
  >([]);

  const totalRegistrants = enrollmentType === "ORGANIZATION"
    ? registrantMembers.length
    : 0;
  // For ORGANIZATION, total fee = per-person fee × number of registrants (enroller pays sum)
  const registrantMultiplier = enrollmentType === "ORGANIZATION" && totalRegistrants > 0 ? totalRegistrants : 1;

  // Toggle a schedule ID in/out of the selected set
  const toggleSchedule = (scheduleId: string) => {
    setSelectedScheduleIds((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((id) => id !== scheduleId)
        : [...prev, scheduleId],
    );
  };

  // 1: Fetch course data from the API once on mount
  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/courses/${slug}`);
        if (!res.ok) {
          setCourseError(dict.courseNotFound);
          return;
        }
        const data = await res.json();
        setCourse(data.course);
      } catch {
        setCourseError(dict.fetchFailed);
      } finally {
        setCourseLoading(false);
      }
    }
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // 2: Pre-fill attendee name and email from the authenticated session
  useEffect(() => {
    if (session?.user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData((prev) => ({
        ...prev,
        fullName: session.user.name || prev.fullName,
        email: session.user.email || prev.email,
        company: session.user.organization || prev.company,
      }));
    }
  }, [session]);

  // Validate a single field and update fieldErrors state
  const validateField = (name: string, value: string) => {
    let error = "";

    if (name === "fullName" && !value.trim()) {
      error = dict.validation.required;
    } else if (name === "email") {
      if (!value.trim()) {
        error = dict.validation.required;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = dict.validation.invalidEmail;
      }
    } else if (name === "phone" && !value.trim()) {
      error = dict.validation.required;
    } else if (name === "iaLicenseNo" && !value.trim()) {
      error = dict.validation.required;
    } else if (name === "hkidNumber") {
      if (idDocType === "HKID") {
        if (!value.trim()) {
          error = dict.validation.required;
        } else if (!/^[A-Za-z]{1,2}\d{6}[0-9A]$/.test(value.toUpperCase())) {
          error = dict.validation.invalidHkidFormat;
        }
      }
    } else if (name === "passportNumber") {
      if (idDocType === "PASSPORT" && !value.trim()) {
        error = dict.validation.required;
      }
    } else if (name === "permitNumber") {
      if (idDocType === "PERMIT" && !value.trim()) {
        error = dict.validation.required;
      } else if (idDocType === "PERMIT" && value.trim().length < 4) {
        error = dict.validation.invalidPermit;
      }
    } else if (name === "otherIdDocVal") {
      if (idDocType === "OTHER" && !value.trim()) {
        error = dict.validation.required;
      }
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[name] = error;
      } else {
        delete next[name];
      }
      return next;
    });

    return error;
  };

  // Derived: combined identity document number for API submission — raw value, no wrapping
  const getCombinedIdDocNumber = () => {
    if (idDocType === "HKID") {
      if (!hkidNumber) return "";
      return hkidNumber.toUpperCase();
    } else if (idDocType === "PASSPORT") {
      return passportNumber.trim();
    } else if (idDocType === "PERMIT") {
      return permitNumber.trim();
    }
    // OTHER: prefix with "Others: "
    return otherIdDocVal.trim() ? `Others: ${otherIdDocVal.trim()}` : "";
  };

  // Derived: whether the primary identity document is validly filled
  const idDocValid = idDocType === "HKID"
    ? hkidNumber.length > 0 && !fieldErrors.hkidNumber
    : idDocType === "PASSPORT"
      ? passportNumber.trim().length > 0 && !fieldErrors.passportNumber
      : idDocType === "PERMIT"
        ? permitNumber.trim().length >= 4 && !fieldErrors.permitNumber
        : otherIdDocVal.trim().length > 0 && !fieldErrors.otherIdDocVal;

  // Derived: whether step 1 fields all pass validation
  const step1Valid =
    formData.fullName.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.iaLicenseNo.trim().length > 0 &&
    idDocValid &&
    !fieldErrors.fullName &&
    !fieldErrors.email &&
    !fieldErrors.phone &&
    !fieldErrors.iaLicenseNo &&
    enrollmentType !== "ORGANIZATION";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Pre-flight duplicate check (authenticated users only)
      if (session?.user?.id && course?.id) {
        const dupRes = await fetch(`/api/enroll/check-duplicate?userId=${encodeURIComponent(session.user.id)}&courseId=${encodeURIComponent(course.id)}`);
        const dupData = await dupRes.json();
        if (dupData.isDuplicate) {
          setIsSubmitting(false);
          throw new Error(dict.errors.alreadyEnrolled);
        }
      }
      // Build the combined identity document number from the split HKID fields
      const idDocNumber = getCombinedIdDocNumber();

      // Build the registrants array for ORGANIZATION enrollment (currently blocked — always empty)
      const registrants = [] as { nameZh: string; nameEn: string; email: string; idDocType: string; idDocNumber: string }[];

      const payload = {
        courseId: course!.id,
        scheduleIds: selectedScheduleIds.length > 0 ? selectedScheduleIds : [course!.schedules[0]?.id].filter(Boolean),
        enrollmentType,
        paymentMethod: paymentMethodMap[formData.paymentMethod] || "E_BANKING",
        ...(registrants.length > 0 && { registrants }),
        // Always include the contact/identity fields. The API overrides name/email
        // with the profile when a real session exists, and uses them for guest
        // enrolment when the session isn't recognized — so sending them on both
        // paths is safe and avoids the "Email is required for guest enrolment" 400.
        email: session?.user?.email || formData.email || undefined,
        fullName: session?.user?.name || formData.fullName || undefined,
        nameZh: formData.nameZh || undefined,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        iaLicenseNo: formData.iaLicenseNo || undefined,
        idDocType: idDocType,
        idDocNumber: idDocNumber || undefined,
      };

      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let body: Record<string, unknown>;
        try {
          body = await res.json();
        } catch {
          body = {};
        }
        // Surface validation field errors from the API response
        const apiMessage: string = typeof body.error === "string" ? body.error : dict.errors.enrollmentFailed;
        const detailMessages = body.details
          ? Object.entries(body.details as Record<string, string[]>)
              .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
              .join("; ")
          : "";
        const message = detailMessages ? `${apiMessage}: ${detailMessages}` : apiMessage;
        throw new Error(message);
      }

      const result = await res.json();

      // Redirect to confirmation page with the real registrantId from the API
      // For guest users, also pass the email so the upload route can verify ownership
      const emailParam = !session?.user && formData.email
        ? `&email=${encodeURIComponent(formData.email)}`
        : "";
      router.push(
        `/${locale}/checkout/confirmation?registrantId=${result.registrantId}&pm=${formData.paymentMethod}${emailParam}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : dict.errors.networkError,
      );
      setIsSubmitting(false);
    }
  };

  // Handle identity document type change — clears errors for all identity fields
  const handleIdDocTypeChange = (type: "HKID" | "PASSPORT" | "PERMIT" | "OTHER") => {
    setIdDocType(type);
    setFieldErrors((prev) => {
      const n = { ...prev };
      delete n.hkidNumber;
      delete n.passportNumber;
      delete n.permitNumber;
      delete n.otherIdDocVal;
      return n;
    });
  };

  // Loading state while course data is being fetched
  if (courseLoading) {
    return (
      <div className="bg-[#f6f8f6] text-slate-800 min-h-screen flex items-center justify-center font-sans">
        <div className="flex items-center space-x-2 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-semibold">{dict.loading}</span>
        </div>
      </div>
    );
  }

  // Error state if the course could not be loaded
  if (courseError || !course) {
    return (
      <div className="bg-[#f6f8f6] text-slate-800 min-h-screen flex items-center justify-center font-sans">
        <div className="max-w-md bg-white border border-slate-300 p-6 shadow-2xs text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <p className="text-sm font-bold text-slate-800">{courseError || dict.courseUnavailable}</p>
          <Link
            href={`/${locale}/courses`}
            className="inline-block bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-xs uppercase tracking-wider"
          >
            {dict.browseCourses}
          </Link>
        </div>
      </div>
    );
  }

  // Per-session unit price is the sole source of truth (never fall back to course.price)
  const unitPrice = course.unitPrice ?? "0";
  const totalSessions = course.schedules?.length || 0;
  const selectedCount = selectedScheduleIds.length;
  const isAllSelected = selectedCount === totalSessions && totalSessions > 0;

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
          <Link
            href={`/${locale}/courses/${slug}`}
            className="flex items-center space-x-1 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{dict.backToCourseDetails}</span>
          </Link>
        </div>

        {/* Header */}
        <header className="border-b-2 border-slate-900 pb-4 bg-white p-5 border-t-4 border-t-primary shadow-2xs">
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-primary tracking-tight">
            {dict.pageTitle}
          </h1>
        </header>

        {/* Progress Tracker */}
        <ProgressTracker step={step} dict={dict} />

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Form Panel */}
          <div className="lg:col-span-2 bg-white border border-slate-300 p-6 shadow-2xs space-y-6">
            <form onSubmit={handleSubmit}>
{/* STEP 1: ATTENDEE DETAILS */}
              {step === 1 && (
                <AttendeeDetailsStep
                  formData={formData}
                  fieldErrors={fieldErrors}
                  enrollmentType={enrollmentType}
                  session={session}
                  dict={dict}
                  locale={locale}
                  step1Valid={step1Valid}
                  idDocType={idDocType}
                  hkidNumber={hkidNumber}
                  passportNumber={passportNumber}
                  permitNumber={permitNumber}
                  otherIdDocVal={otherIdDocVal}
                  onInputChange={handleInputChange}
                  onValidateField={validateField}
                  onEnrollmentTypeChange={(type) => setEnrollmentType(type)}
                  onIdDocTypeChange={handleIdDocTypeChange}
                  onHkidChange={setHkidNumber}
                  onPassportChange={setPassportNumber}
                  onPermitChange={setPermitNumber}
                  onOtherIdChange={setOtherIdDocVal}
                  onProceed={() => setStep(2)}
                />
              )}

              {/* STEP 2: SCHEDULE SELECTION */}
              {step === 2 && (
                <ScheduleSelectionStep
                  schedules={course.schedules}
                  selectedScheduleIds={selectedScheduleIds}
                  dict={dict}
                  locale={locale}
                  onToggle={toggleSchedule}
                  onBack={() => setStep(1)}
                  onProceed={() => setStep(3)}
                />
              )}

              {/* STEP 3: REGULATORY DECLARATION */}
              {step === 3 && (
                <RegulatoryDeclarationStep
                  declaredEligible={formData.declaredEligible}
                  agreedToTerms={formData.agreedToTerms}
                  dict={dict}
                  locale={locale}
                  onInputChange={handleInputChange}
                  onBack={() => setStep(2)}
                  onProceed={() => setStep(4)}
                />
              )}

              {/* STEP 4: PAYMENT METHOD & SUBMIT */}
              {step === 4 && (
                <PaymentMethodStep
                  paymentMethod={formData.paymentMethod}
                  submitError={submitError}
                  isSubmitting={isSubmitting}
                  dict={dict}
                  onInputChange={handleInputChange}
                  onBack={() => setStep(3)}
                />
              )}
            </form>
          </div>

          {/* Right Summary Sidebar */}
          <SummarySidebar
            course={course}
            selectedScheduleIds={selectedScheduleIds}
            selectedCount={selectedCount}
            totalSessions={totalSessions}
            unitPrice={unitPrice}
            isAllSelected={isAllSelected}
            enrollmentType={enrollmentType}
            totalRegistrants={totalRegistrants}
            registrantMultiplier={registrantMultiplier}
            dict={dict}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}