"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Building2,
  CreditCard,
  User,
  Award,
  Lock,
  ChevronRight,
  AlertCircle,
  FileCheck,
  Building,
} from "lucide-react";

export default function CourseEnrollmentPage() {
  const params = useParams();
  const router = useRouter();

  const locale = (params.locale as string) || "en";
  const slug = (params.slug as string) || "";

  // Form State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      // Simulate API call to process enrolment & payment session
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to confirmation page upon success
      router.push(`/${locale}/dashboard/enrolments/demo-123/confirmation`);
    } catch (error) {
      console.error("Enrolment submission failed:", error);
      setIsSubmitting(false);
    }
  };

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
                  <div className="pb-2 border-b border-slate-200">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#1b4332] flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Attendee Information</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter details as they appear on your professional license.
                    </p>
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

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={
                        !formData.fullName ||
                        !formData.email ||
                        !formData.iaLicenseNo
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
                          onClick={(e) => e.stopPropagation()} // Prevents the checkbox from toggling twice when clicking the link
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
                        <span>Processing Enrolment...</span>
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

          {/* Right Summary Sidebar */}
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
                  Regulatory Compliance & Ethics in Financial Practice
                </p>
              </div>

              <div className="flex justify-between py-1.5 border-t border-slate-100 text-slate-600">
                <span>Accreditation Code:</span>
                <span className="font-mono font-bold text-slate-800">
                  IA-2026-CPD01
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-t border-slate-100 text-slate-600">
                <span>CPD Value:</span>
                <span className="font-bold text-[#1b4332] bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                  3.0 Hours
                </span>
              </div>

              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 uppercase">
                  Total Fee:
                </span>
                <span className="text-lg font-serif font-bold text-[#1b4332]">
                  HK$ 1,200
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
