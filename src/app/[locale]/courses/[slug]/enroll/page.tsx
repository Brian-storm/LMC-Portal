"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function CourseEnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();

  const locale = (params.locale as string) || "en";
  const slug = (params.slug as string) || "";

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

  // Enrollment type toggle: INDIVIDUAL vs ORGANIZATION
  const [enrollmentType, setEnrollmentType] = useState<"INDIVIDUAL" | "ORGANIZATION">("INDIVIDUAL");

  // Multi-registrant rows for ORGANIZATION enrollment
  const [registrantMembers, setRegistrantMembers] = useState<
    { nameZh: string; nameEn: string; email: string; idDocNumber: string }[]
  >([]);

  // Handler for individual registrant member fields
  const handleMemberChange = (
    index: number,
    field: "nameZh" | "nameEn" | "email" | "idDocNumber",
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
      { nameZh: "", nameEn: "", email: "", idDocNumber: "" },
    ]);
  };

  // Remove a member row by index
  const removeMember = (index: number) => {
    setRegistrantMembers((prev) => prev.filter((_, i) => i !== index));
  };

  // Computed head count for ORGANIZATION (payer + registrant members)
  const totalRegistrants = enrollmentType === "ORGANIZATION"
    ? 1 + registrantMembers.length
    : 1;

  // 1: Fetch course data from the API once on mount
  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch(`/api/courses/${slug}`);
        if (!res.ok) {
          setCourseError("Course not found or unavailable.");
          return;
        }
        const data = await res.json();
        setCourse(data.course);
      } catch {
        setCourseError("Failed to load course details.");
      } finally {
        setCourseLoading(false);
      }
    }
    loadCourse();
  }, [slug]);

  // 2: Pre-fill attendee name and email from the authenticated session
  // Session data may load after the initial render, so we update formData
  // once when useSession() resolves.
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
      // Build the registrants array for ORGANIZATION enrollment
      const registrants = enrollmentType === "ORGANIZATION" && registrantMembers.length > 0
        ? registrantMembers
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
      };

      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Enrollment failed. Please try again.");
      }

      const result = await res.json();

      // 3: Redirect to confirmation page with the real registrantId from the API
      router.push(
        `/${locale}/checkout/confirmation?orderId=${result.registrantId}`,
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Network error encountered.",
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
          <span className="text-xs font-semibold">Loading course details...</span>
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
          <p className="text-sm font-bold text-slate-800">{courseError || "Course unavailable."}</p>
          <Link
            href={`/${locale}/courses`}
            className="inline-block bg-[#1b4332] text-white text-xs font-bold px-4 py-2 rounded-xs uppercase tracking-wider"
          >
            Browse Courses
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
            <span>Back to Course Details</span>
          </Link>
        </div>

        {/* Header Header */}
        <header className="border-b-2 border-slate-900 pb-4 bg-white p-5 border-t-4 border-t-[#1b4332] shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-1">
              <Building2 className="w-3.5 h-3.5 text-[#1b4332]" />
              <span>Official CPD Registration</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-500">
              <Lock className="w-3 h-3 text-emerald-700" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1b4332] tracking-tight">
            Course Enrolment Application
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
              <span className="hidden sm:inline">Attendee Details</span>
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
              <span className="hidden sm:inline">Regulatory Declaration</span>
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
              <span className="hidden sm:inline">Payment & Submit</span>
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
                      Enrollment Type
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
                        Individual
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
                        Organization
                      </button>
                    </div>
                    {enrollmentType === "ORGANIZATION" && (
                      <p className="text-[10px] text-slate-500 mt-1.5">
                        Register multiple attendees under a single billing. The person completing this form is the primary contact.
                      </p>
                    )}
                  </div>

                  {/* Payer / Primary Attendee Information (shown for both types) */}
                  <div className="pb-2 border-b border-slate-200">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#1b4332] flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{enrollmentType === "ORGANIZATION" ? "Primary Contact Details" : "Attendee Information"}</span>
                    </h2>
                    {enrollmentType === "ORGANIZATION" && (
                      <p className="text-xs text-amber-700 mt-0.5">The person submitting this enrollment. Group members are added below.</p>
                    )}
                    {enrollmentType === "INDIVIDUAL" && (
                      <p className="text-xs text-slate-500 mt-0.5">Enter details as they appear on your professional license.</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-bold text-slate-700 block">
                        Full Name (English){" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. CHAN Tai Man"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b4332] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="name@company.com"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b4332] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        Contact Number <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+852 9123 4567"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b4332] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="e.g. HSBC / Prudential"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b4332] focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block">
                        IA / License Reg Number{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="iaLicenseNo"
                        required
                        value={formData.iaLicenseNo}
                        onChange={handleInputChange}
                        placeholder="e.g. IA12345678"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:border-[#1b4332] focus:bg-white font-mono"
                      />
                      <p className="text-[10px] text-slate-500">
                        Required for automated CPD hours submission.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Group Member Rows (only for ORGANIZATION) */}
                  {enrollmentType === "ORGANIZATION" && (
                    <div className="pt-2 border-t border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                          <Users className="w-3.5 h-3.5 mr-1" />
                          Group Members ({registrantMembers.length})
                        </h3>
                        <button
                          type="button"
                          onClick={addMember}
                          className="inline-flex items-center space-x-1 text-[#1b4332] hover:text-[#112a1f] disabled:opacity-40 text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Member</span>
                        </button>
                      </div>

                      {registrantMembers.length === 0 && (
                        <p className="text-xs text-slate-400 italic py-2">
                          No additional members added yet. Click &quot;Add Member&quot; to add group attendees.
                        </p>
                      )}

                      {registrantMembers.map((member, index) => (
                        <div
                          key={index}
                          className="border border-slate-200 bg-slate-50/50 p-3 rounded-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-slate-500">
                              Member {index + 1}
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
                              placeholder="Name (Chinese)"
                              value={member.nameZh}
                              onChange={(e) => handleMemberChange(index, "nameZh", e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1b4332]"
                            />
                            <input
                              type="text"
                              placeholder="Name (English) *"
                              required
                              value={member.nameEn}
                              onChange={(e) => handleMemberChange(index, "nameEn", e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1b4332]"
                            />
                            <input
                              type="email"
                              placeholder="Email *"
                              required
                              value={member.email}
                              onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1b4332]"
                            />
                            <input
                              type="text"
                              placeholder="ID / License No. *"
                              required
                              value={member.idDocNumber}
                              onChange={(e) => handleMemberChange(index, "idDocNumber", e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-xs px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1b4332]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={
                        !formData.fullName ||
                        !formData.email ||
                        !formData.iaLicenseNo ||
                        (enrollmentType === "ORGANIZATION" &&
                          registrantMembers.some(
                            (m) => !m.nameEn || !m.email || !m.idDocNumber,
                          ))
                      }
                      onClick={() => setStep(2)}
                      className="inline-flex items-center space-x-1.5 bg-[#1b4332] hover:bg-[#112a1f] disabled:opacity-50 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors"
                    >
                      <span>Proceed to Declaration</span>
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
                      <span>Compliance & Eligibility Declaration</span>
                    </h2>
                  </div>

                  <div className="bg-amber-50/80 border border-amber-200 p-3 text-xs text-amber-900 space-y-1 rounded-xs">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>CPD Filing Requirement Notice</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Attendance records will be submitted directly to relevant
                      accreditation bodies. Full attendance and identity
                      verification are required to earn accredited CPD hours.
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
                        I declare that the information provided is accurate and
                        matches my professional registration records.
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
                        I agree to the{" "}
                        <Link
                          href={`/${locale}/terms`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#1b4332] underline hover:text-emerald-900 font-semibold"
                        >
                          Institutional Terms of Registration
                        </Link>
                        , CPD Attendance Monitoring Policy, and Cancellation
                        Rules.
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs uppercase font-bold tracking-wider rounded-xs"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={
                        !formData.declaredEligible || !formData.agreedToTerms
                      }
                      onClick={() => setStep(3)}
                      className="inline-flex items-center space-x-1.5 bg-[#1b4332] hover:bg-[#112a1f] disabled:opacity-50 text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors"
                    >
                      <span>Proceed to Payment</span>
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
                      <span>Select Payment Method</span>
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
                          Credit Card (Visa / Mastercard)
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
                          FPS / Alipay HK / WeChat Pay HK
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
                          Corporate Billing / Bank Transfer
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
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center space-x-2 bg-[#1b4332] hover:bg-[#112a1f] disabled:opacity-50 text-white font-bold px-6 py-2.5 text-xs uppercase tracking-wider rounded-xs transition-all shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Processing Enrolment...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Complete Enrolment</span>
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
                Order Summary
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Course
                </span>
                <p className="font-serif font-bold text-slate-900 leading-snug mt-0.5">
                  {course.nameEn}
                </p>
              </div>

              {schedule && (
                <div className="flex justify-between py-1.5 border-t border-slate-100 text-slate-600">
                  <span>Schedule:</span>
                  <span className="font-mono font-bold text-slate-800 text-right">
                    {schedule.dateAndTime}
                  </span>
                </div>
              )}

              <div className="flex justify-between py-1.5 border-t border-slate-100 text-slate-600">
                <span>Seats Available:</span>
                <span className="font-mono font-bold text-slate-800">
                  {schedule?.quotaRemaining ?? course.capacity}
                </span>
              </div>

              {enrollmentType === "ORGANIZATION" && (
                <div className="flex justify-between py-1.5 border-t border-slate-100 text-slate-600">
                  <span>Registrants:</span>
                  <span className="font-mono font-bold text-slate-800">{totalRegistrants}</span>
                </div>
              )}

              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 uppercase">
                  Total Fee:
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
                  Official Tax Invoice & Attendance Certificate issued
                  immediately upon course completion.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}