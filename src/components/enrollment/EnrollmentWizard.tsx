"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Building2,
  CreditCard,
  User,
  Lock,
  ChevronRight,
  AlertCircle,
  FileCheck,
  Building,
  Loader2,
  Plus,
  Users,
  Trash2,
} from "lucide-react";
import type { EnrollPageDict } from "@/dictionaries/types";

interface CourseData {
  id: string;
  nameEn: string;
  price: string;
  registrationStatus: string;
  capacity: number;
  schedules: {
    id: string;
    dateAndTime: string;
    venue: string;
    quotaRemaining: number;
  }[];
}

// Map form payment method labels to API PaymentMethod enum values
const paymentMethodMap: Record<string, string> = {
  credit_card: "E_BANKING",
  fps_alipay: "FPS",
  corporate_invoice: "CORPORATE_INVOICE",
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Form Data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    iaLicenseNo: "",
    agreedToTerms: false,
    declaredEligible: false,
    paymentMethod: "credit_card",
  });

  // Identity document type: HKID or Passport
  const [idDocType, setIdDocType] = useState<"HKID" | "PASSPORT">("HKID");

  // Split HKID fields — user enters prefix and check digit separately
  const [hkidPrefix, setHkidPrefix] = useState("");
  const [hkidCheckDigit, setHkidCheckDigit] = useState("");

  // Passport number (alternative to HKID)
  const [passportNumber, setPassportNumber] = useState("");

  // Field-level validation errors: field name → error message
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Enrollment type toggle: INDIVIDUAL vs ORGANIZATION
  const [enrollmentType, setEnrollmentType] = useState<"INDIVIDUAL" | "ORGANIZATION">("INDIVIDUAL");

  // Multi-registrant rows for ORGANIZATION enrollment
  const [registrantMembers, setRegistrantMembers] = useState<
    {
      nameZh: string;
      nameEn: string;
      email: string;
      idDocType: "HKID" | "PASSPORT";
      hkidPrefix: string;
      hkidCheckDigit: string;
      passportNumber: string;
      idDocNumber: string;
    }[]
  >([]);

  // Compute combined idDocNumber for a member
  const getMemberIdDocNumber = (member: {
    idDocType: "HKID" | "PASSPORT";
    hkidPrefix: string;
    hkidCheckDigit: string;
    passportNumber: string;
  }) => {
    if (member.idDocType === "HKID") {
      if (!member.hkidPrefix || !member.hkidCheckDigit) return "";
      return `${member.hkidPrefix}(${member.hkidCheckDigit.toUpperCase()})`;
    }
    return member.passportNumber.trim();
  };

  // Handler for individual registrant member fields
  const handleMemberChange = (
    index: number,
    field: "nameZh" | "nameEn" | "email" | "idDocType" | "hkidPrefix" | "hkidCheckDigit" | "passportNumber" | "idDocNumber",
    value: string,
  ) => {
    setRegistrantMembers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Add a blank member row
  const addMember = () => {
    setRegistrantMembers((prev) => [
      ...prev,
      { nameZh: "", nameEn: "", email: "", idDocType: "HKID", hkidPrefix: "", hkidCheckDigit: "", passportNumber: "", idDocNumber: "" },
    ]);
  };

  // Remove a member row by index
  const removeMember = (index: number) => {
    setRegistrantMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const totalRegistrants = enrollmentType === "ORGANIZATION"
    ? 1 + registrantMembers.length
    : 1;

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
    } else if (name === "hkidPrefix") {
      if (idDocType === "HKID") {
        if (!value.trim()) {
          error = dict.validation.required;
        } else if (!/^[A-Za-z]{1,2}\d{6}$/.test(value)) {
          error = dict.validation.invalidHkidPrefix;
        }
      }
    } else if (name === "hkidCheckDigit") {
      if (idDocType === "HKID") {
        if (!value.trim()) {
          error = dict.validation.required;
        } else if (!/^[0-9A]$/.test(value.toUpperCase())) {
          error = dict.validation.invalidHkidCheckDigit;
        }
      }
    } else if (name === "passportNumber") {
      if (idDocType === "PASSPORT" && !value.trim()) {
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

  // Derived: combined identity document number for API submission
  const getCombinedIdDocNumber = () => {
    if (idDocType === "HKID") {
      if (!hkidPrefix || !hkidCheckDigit) return "";
      return `${hkidPrefix}(${hkidCheckDigit.toUpperCase()})`;
    }
    return passportNumber.trim();
  };

  // Derived: whether the primary identity document is validly filled
  const idDocValid = idDocType === "HKID"
    ? hkidPrefix.length > 0 && hkidCheckDigit.length > 0 && !fieldErrors.hkidPrefix && !fieldErrors.hkidCheckDigit
    : passportNumber.trim().length > 0 && !fieldErrors.passportNumber;

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
    (enrollmentType !== "ORGANIZATION" ||
      !registrantMembers.some(
        (m) =>
          !m.nameEn ||
          !m.email ||
          (m.idDocType === "HKID"
            ? !m.hkidPrefix || !m.hkidCheckDigit
            : !m.passportNumber.trim()),
      ));

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
      // Build the combined identity document number from the split HKID fields
      const idDocNumber = getCombinedIdDocNumber();

      // Build the registrants array for ORGANIZATION enrollment, computing combined idDocNumber per member
      const registrants = enrollmentType === "ORGANIZATION" && registrantMembers.length > 0
        ? registrantMembers.map((m) => ({
            nameZh: m.nameZh,
            nameEn: m.nameEn,
            email: m.email,
            idDocNumber: getMemberIdDocNumber(m),
          }))
        : [];

      const payload = {
        courseId: course!.id,
        scheduleId: course!.schedules[0]?.id,
        enrollmentType,
        paymentMethod: paymentMethodMap[formData.paymentMethod] || "E_BANKING",
        ...(registrants.length > 0 && { registrants }),
        ...(!session?.user && {
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          company: formData.company || undefined,
          iaLicenseNo: formData.iaLicenseNo || undefined,
        }),
        // Include idDocNumber for both authenticated and guest users
        idDocNumber: idDocNumber || undefined,
      };

      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        // Surface validation field errors from the API response
        const apiMessage = body.error || dict.errors.enrollmentFailed;
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
      router.push(
        `/${locale}/checkout/confirmation?orderId=${result.registrantId}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : dict.errors.networkError,
      );
      setIsSubmitting(false);
    }
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
            className="inline-block bg-[#1b4332] text-white text-xs font-bold px-4 py-2 rounded-xs uppercase tracking-wider"
          >
            {dict.browseCourses}
          </Link>
        </div>
      </div>
    );
  }

  const schedule = course.schedules?.[0];
  const fee = course.price;

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
          <Link
            href={`/${locale}/courses/${slug}`}
            className="flex items-center space-x-1 hover:text-[#1b4332] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{dict.backToCourseDetails}</span>
          </Link>
        </div>

        {/* Header Header */}
        <header className="border-b-2 border-slate-900 pb-4 bg-white p-5 border-t-4 border-t-[#1b4332] shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">
              <Building2 className="w-3.5 h-3.5 text-[#1b4332]" />
              <span>{dict.officialCpdRegistration}</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-500">
              <Lock className="w-3 h-3 text-emerald-700" />
              <span>{dict.sslEncrypted}</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1b4332] tracking-tight">
            {dict.pageTitle}
          </h1>
        </header>

        {/* Progress Tracker */}
        <div className="bg-white border border-slate-300 p-4 shadow-2xs">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold uppercase tracking-wider">
            <div
              className={`pb-2 border-b-2 flex items-center justify-center space-x-1.5 ${
                step >= 1
                  ? "border-[#1b4332] text-[#1b4332]"
                  : "border-slate-200 text-slate-400"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-current flex items-center justify-center text-[10px]">
                1
              </span>
              <span className="hidden sm:inline">{dict.step1Title}</span>
            </div>
            <div
              className={`pb-2 border-b-2 flex items-center justify-center space-x-1.5 ${
                step >= 2
                  ? "border-[#1b4332] text-[#1b4332]"
                  : "border-slate-200 text-slate-400"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-current flex items-center justify-center text-[10px]">
                2
              </span>
              <span className="hidden sm:inline">{dict.step2Title}</span>
            </div>
            <div
              className={`pb-2 border-b-2 flex items-center justify-center space-x-1.5 ${
                step >= 3
                  ? "border-[#1b4332] text-[#1b4332]"
                  : "border-slate-200 text-slate-400"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-current flex items-center justify-center text-[10px]">
                3
              </span>
              <span className="hidden sm:inline">{dict.step3Title}</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Form Panel */}
          <div className="lg:col-span-2 bg-white border border-slate-300 p-6 shadow-2xs space-y-6">
            <form onSubmit={handleSubmit}>
              {/* STEP 1: ATTENDEE DETAILS */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Enrollment Type Toggle — Individual vs Organization */}
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                      <Users className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                      {dict.formLabels.enrollmentType}
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => { setEnrollmentType("INDIVIDUAL"); setRegistrantMembers([]); }}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xs border transition-colors ${
                          enrollmentType === "INDIVIDUAL"
                            ? "bg-[#1b4332] text-white border-[#1b4332]"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <User className="w-3.5 h-3.5 inline mr-1" />
                        {dict.formLabels.individual}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnrollmentType("ORGANIZATION")}
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xs border transition-colors ${
                          enrollmentType === "ORGANIZATION"
                            ? "bg-[#1b4332] text-white border-[#1b4332]"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 inline mr-1" />
                        {dict.formLabels.organization}
                      </button>
                    </div>
                    {enrollmentType === "ORGANIZATION" && (
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        {dict.formLabels.orgDescription}
                      </p>
                    )}
                  </div>

                  {/* Payer / Primary Attendee Information (shown for both types) */}
                  <div className="pb-2 border-b border-slate-200">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#1b4332] flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{enrollmentType === "ORGANIZATION" ? dict.formLabels.primaryContact : dict.formLabels.attendeeInfo}</span>
                    </h2>
                    {enrollmentType === "ORGANIZATION" && (
                      <p className="text-xs text-amber-700 mt-0.5">{dict.formLabels.orgHelperText}</p>
                    )}
                    {enrollmentType === "INDIVIDUAL" && (
                      <p className="text-xs text-slate-500 mt-0.5">{dict.formLabels.individualHelperText}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-slate-700 block">
                        {dict.formLabels.fullName}{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        onBlur={(e) => validateField("fullName", e.target.value)}
                        placeholder={dict.formLabels.fullNamePlaceholder}
                        className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
                          fieldErrors.fullName ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-[#1b4332]"
                        }`}
                      />
                      {fieldErrors.fullName && (
                        <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors.fullName}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        {dict.formLabels.email} <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={(e) => validateField("email", e.target.value)}
                        placeholder={dict.formLabels.emailPlaceholder}
                        className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
                          fieldErrors.email ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-[#1b4332]"
                        }`}
                      />
                      {fieldErrors.email && (
                        <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors.email}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        {dict.formLabels.phone} <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={(e) => validateField("phone", e.target.value)}
                        placeholder={dict.formLabels.phonePlaceholder}
                        className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
                          fieldErrors.phone ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-[#1b4332]"
                        }`}
                      />
                      {fieldErrors.phone && (
                        <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors.phone}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        {dict.formLabels.company}
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder={dict.formLabels.companyPlaceholder}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b4332] focus:bg-white"
                      />
                    </div>

<div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        {dict.formLabels.iaLicense}{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="iaLicenseNo"
                        required
                        value={formData.iaLicenseNo}
                        onChange={handleInputChange}
                        onBlur={(e) => validateField("iaLicenseNo", e.target.value)}
                        placeholder={dict.formLabels.iaLicensePlaceholder}
                        className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
                          fieldErrors.iaLicenseNo ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-[#1b4332]"
                        }`}
                      />
                      <p className="text-[10px] text-slate-500">
                        {dict.formLabels.iaLicenseHint}
                      </p>
                      {fieldErrors.iaLicenseNo && (
                        <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors.iaLicenseNo}</span>
                        </p>
                      )}
                    </div>

                  {/* Identity Document Section — inside the grid, spans 2 cols */}
                  <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-2">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{dict.formLabels.idDocType}</span>
                    </h3>
                    <div className="flex space-x-2 mb-3">
                      <button
                        type="button"
                        onClick={() => { setIdDocType("HKID"); setFieldErrors((prev) => { const n = { ...prev }; delete n.hkidPrefix; delete n.hkidCheckDigit; delete n.passportNumber; return n; }); }}
                        className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs border transition-colors ${
                          idDocType === "HKID"
                            ? "bg-[#1b4332] text-white border-[#1b4332]"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <User className="w-3 h-3 inline mr-1" />
                        {dict.formLabels.hkid}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIdDocType("PASSPORT"); setFieldErrors((prev) => { const n = { ...prev }; delete n.hkidPrefix; delete n.hkidCheckDigit; delete n.passportNumber; return n; }); }}
                        className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs border transition-colors ${
                          idDocType === "PASSPORT"
                            ? "bg-[#1b4332] text-white border-[#1b4332]"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <FileCheck className="w-3 h-3 inline mr-1" />
                        {dict.formLabels.passport}
                      </button>
                    </div>

                    {idDocType === "HKID" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block text-xs">
                            {dict.formLabels.hkidPrefix} <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            value={hkidPrefix}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setHkidPrefix(val);
                              validateField("hkidPrefix", val);
                            }}
                            onBlur={(e) => validateField("hkidPrefix", e.target.value)}
                            placeholder={dict.formLabels.hkidPrefixPlaceholder}
                            maxLength={8}
                            className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 font-mono focus:outline-none focus:bg-white ${
                              fieldErrors.hkidPrefix ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-[#1b4332]"
                            }`}
                          />
                          {fieldErrors.hkidPrefix && (
                            <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{fieldErrors.hkidPrefix}</span>
                            </p>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-slate-700 block text-xs">
                            {dict.formLabels.hkidCheckDigit} <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs pointer-events-none">(</span>
                            <input
                              type="text"
                              value={hkidCheckDigit}
                              onChange={(e) => {
                                // Only allow a single alphanumeric character
                                const val = e.target.value.replace(/[^0-9A-Za-z]/g, "").slice(0, 1);
                                setHkidCheckDigit(val);
                                validateField("hkidCheckDigit", val);
                              }}
                              onBlur={(e) => validateField("hkidCheckDigit", e.target.value)}
                              maxLength={1}
                              className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 font-mono text-center focus:outline-none focus:bg-white pl-6 ${
                                fieldErrors.hkidCheckDigit ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-[#1b4332]"
                              }`}
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs pointer-events-none">)</span>
                          </div>
                          <p className="text-[10px] text-slate-400">{dict.formLabels.hkidCheckDigitHint}</p>
                          {fieldErrors.hkidCheckDigit && (
                            <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
                              <AlertCircle className="w-3 h-3 shrink-0" />
                              <span>{fieldErrors.hkidCheckDigit}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {idDocType === "PASSPORT" && (
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-xs">
                          {dict.formLabels.passportNumber} <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          value={passportNumber}
                          onChange={(e) => {
                            setPassportNumber(e.target.value);
                            validateField("passportNumber", e.target.value);
                          }}
                          onBlur={(e) => validateField("passportNumber", e.target.value)}
                          placeholder={dict.formLabels.passportPlaceholder}
                          className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
                            fieldErrors.passportNumber ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-[#1b4332]"
                          }`}
                        />
                        {fieldErrors.passportNumber && (
                          <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{fieldErrors.passportNumber}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  </div>

                  {/* Dynamic Group Member Rows (only for ORGANIZATION) */}
                  {enrollmentType === "ORGANIZATION" && (
                    <div className="pt-2 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                          <Users className="w-3.5 h-3.5 mr-1" />
                          {dict.formLabels.groupMembers} ({registrantMembers.length})
                        </h3>
                        <button
                          type="button"
                          onClick={addMember}
                          className="inline-flex items-center space-x-1 text-[#1b4332] hover:text-[#112a1f] disabled:opacity-40 text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{dict.formLabels.addMember}</span>
                        </button>
                      </div>

                      {registrantMembers.length === 0 && (
                        <p className="text-xs text-slate-400 italic py-2">
                          {dict.formLabels.noMembers}
                        </p>
                      )}

                      {registrantMembers.map((member, index) => (
                        <div
                          key={index}
                          className="border border-slate-200 bg-slate-50/50 p-3 rounded-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-slate-500">
                              {dict.formLabels.memberLabel} {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeMember(index)}
                              className="text-rose-600 hover:text-rose-800 p-0.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder={dict.formLabels.nameZhPlaceholder}
                              value={member.nameZh}
                              onChange={(e) => handleMemberChange(index, "nameZh", e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1b4332]"
                            />
                            <input
                              type="text"
                              placeholder={`${dict.formLabels.nameEnPlaceholder} *`}
                              required
                              value={member.nameEn}
                              onChange={(e) => handleMemberChange(index, "nameEn", e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1b4332]"
                            />
                            <input
                              type="email"
                              placeholder={`${dict.formLabels.emailPlaceholderShort} *`}
                              required
                              value={member.email}
                              onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1b4332]"
                            />
                          </div>
                          {/* Identity document type toggle + split HKID input for this member */}
                          <div className="sm:col-span-2 flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleMemberChange(index, "idDocType", "HKID")}
                              className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xs border transition-colors ${
                                member.idDocType === "HKID"
                                  ? "bg-[#1b4332] text-white border-[#1b4332]"
                                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                              }`}
                            >
                              <User className="w-2.5 h-2.5 inline mr-0.5" />
                              {dict.formLabels.hkid}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMemberChange(index, "idDocType", "PASSPORT")}
                              className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xs border transition-colors ${
                                member.idDocType === "PASSPORT"
                                  ? "bg-[#1b4332] text-white border-[#1b4332]"
                                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
                              }`}
                            >
                              <FileCheck className="w-2.5 h-2.5 inline mr-0.5" />
                              {dict.formLabels.passport}
                            </button>
                          </div>
                          {member.idDocType === "HKID" ? (
                            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder={dict.formLabels.hkidPrefixPlaceholder}
                                  value={member.hkidPrefix}
                                  onChange={(e) => handleMemberChange(index, "hkidPrefix", e.target.value.toUpperCase())}
                                  maxLength={8}
                                  className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#1b4332]"
                                />
                              </div>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[10px] pointer-events-none">(</span>
                                <input
                                  type="text"
                                  value={member.hkidCheckDigit}
                                  onChange={(e) => handleMemberChange(index, "hkidCheckDigit", e.target.value.replace(/[^0-9A-Za-z]/g, "").slice(0, 1))}
                                  maxLength={1}
                                  placeholder=" "
                                  className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 font-mono text-center focus:outline-none focus:border-[#1b4332] pl-6"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[10px] pointer-events-none">)</span>
                              </div>
                            </div>
                          ) : (
                            <div className="sm:col-span-2">
                              <input
                                type="text"
                                placeholder={dict.formLabels.passportPlaceholder}
                                value={member.passportNumber}
                                onChange={(e) => handleMemberChange(index, "passportNumber", e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1b4332]"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={!step1Valid}
                      onClick={() => setStep(2)}
                      className="inline-flex items-center space-x-1.5 bg-[#1b4332] hover:bg-[#112a1f] disabled:opacity-50 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors"
                    >
                      <span>{dict.navigation.proceedToDeclaration}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: REGULATORY DECLARATION */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#1b4332] flex items-center space-x-2">
                      <FileCheck className="w-4 h-4" />
                      <span>{dict.step2.title}</span>
                    </h2>
                  </div>

                  <div className="bg-amber-50/80 border border-amber-200 p-3 text-xs text-amber-900 space-y-1 rounded-xs">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>{dict.step2.cpdNoticeTitle}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {dict.step2.cpdNoticeText}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 text-xs text-slate-700">
                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="declaredEligible"
                        checked={formData.declaredEligible}
                        onChange={handleInputChange}
                        className="mt-0.5 border-slate-400 text-[#1b4332] focus:ring-0 accent-[#1b4332]"
                      />
                      <span className="leading-relaxed">
                        {dict.step2.declarationLabel}
                      </span>
                    </label>

                    <label className="flex items-start space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="agreedToTerms"
                        checked={formData.agreedToTerms}
                        onChange={handleInputChange}
                        className="mt-0.5 border-slate-400 text-[#1b4332] focus:ring-0 accent-[#1b4332]"
                      />
                      <span className="leading-relaxed">
                        {dict.step2.termsLabel}{" "}
                        <Link
                          href={`/${locale}/terms`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#1b4332] underline hover:text-emerald-900 font-semibold"
                        >
                          {dict.step2.termsLinkText}
                        </Link>
                        {dict.step2.termsSuffix}
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs uppercase font-bold tracking-wider rounded-xs"
                    >
                      {dict.step2.backButton}
                    </button>
                    <button
                      type="button"
                      disabled={
                        !formData.declaredEligible || !formData.agreedToTerms
                      }
                      onClick={() => setStep(3)}
                      className="inline-flex items-center space-x-1.5 bg-[#1b4332] hover:bg-[#112a1f] disabled:opacity-50 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors"
                    >
                      <span>{dict.navigation.proceedToPayment}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PAYMENT METHOD & SUBMIT */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#1b4332] flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>{dict.step3.title}</span>
                    </h2>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="flex items-center justify-between p-3 border border-slate-300 rounded-xs cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit_card"
                          checked={formData.paymentMethod === "credit_card"}
                          onChange={handleInputChange}
                          className="text-[#1b4332] accent-[#1b4332]"
                        />
                        <span className="font-bold text-slate-800">
                          {dict.step3.creditCard}
                        </span>
                      </div>
                      <CreditCard className="w-4 h-4 text-slate-400" />
                    </label>

                    <label className="flex items-center justify-between p-3 border border-slate-300 rounded-xs cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="fps_alipay"
                          checked={formData.paymentMethod === "fps_alipay"}
                          onChange={handleInputChange}
                          className="text-[#1b4332] accent-[#1b4332]"
                        />
                        <span className="font-bold text-slate-800">
                          {dict.step3.fpsAlipay}
                        </span>
                      </div>
                      <Building2 className="w-4 h-4 text-slate-400" />
                    </label>

                    <label className="flex items-center justify-between p-3 border border-slate-300 rounded-xs cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="corporate_invoice"
                          checked={
                            formData.paymentMethod === "corporate_invoice"
                          }
                          onChange={handleInputChange}
                          className="text-[#1b4332] accent-[#1b4332]"
                        />
                        <span className="font-bold text-slate-800">
                          {dict.step3.corporateBilling}
                        </span>
                      </div>
                      <Building className="w-4 h-4 text-slate-400" />
                    </label>
                  </div>

                  {/* Inline error display when the API returns 4xx/5xx */}
                  {submitError && (
                    <div
                      className="flex items-start space-x-2 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xs text-xs"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs uppercase font-bold tracking-wider rounded-xs"
                    >
                      {dict.step3.backButton}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center space-x-2 bg-[#1b4332] hover:bg-[#112a1f] disabled:opacity-50 text-white font-bold px-6 py-2.5 text-xs uppercase tracking-wider rounded-xs transition-all shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{dict.step3.processing}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{dict.step3.submitButton}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Right Summary Sidebar — populated from real API data */}
          <aside className="lg:col-span-1 bg-white border border-slate-300 p-4 shadow-2xs space-y-4">
            <div className="pb-2 border-b border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {dict.summary.title}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {dict.summary.course}
                </span>
                <p className="font-serif font-bold text-slate-900 leading-snug mt-0.5">
                  {course.nameEn}
                </p>
              </div>

              {schedule && (
                <div className="flex justify-between py-1.5 border-t border-slate-100 text-slate-600">
                  <span>{dict.summary.schedule}</span>
                  <span className="font-mono font-bold text-slate-800 text-right">
                    {schedule.dateAndTime}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1.5 border-t border-slate-100 text-slate-600">
                <span>{dict.summary.seatsAvailable}</span>
                <span className="font-mono font-bold text-slate-800">
                  {schedule?.quotaRemaining ?? course.capacity}
                </span>
              </div>

              {enrollmentType === "ORGANIZATION" && (
                <div className="flex justify-between py-1.5 border-t border-slate-100 text-slate-600">
                  <span>{dict.summary.registrants}</span>
                  <span className="font-mono font-bold text-slate-800">{totalRegistrants}</span>
                </div>
              )}

              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 uppercase">
                  {dict.summary.totalFee}
                </span>
                <span className="text-lg font-serif font-bold text-[#1b4332]">
                  HK$ {enrollmentType === "ORGANIZATION" ? (parseFloat(String(fee)) * totalRegistrants).toLocaleString() : fee}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1.5">
              <div className="flex items-start space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1b4332] shrink-0 mt-0.5" />
                <span>
                  {dict.summary.invoiceNotice}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}