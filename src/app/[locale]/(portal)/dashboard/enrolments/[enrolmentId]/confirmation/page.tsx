"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Award,
  ArrowRight,
  Printer,
  FileText,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export default function EnrollmentConfirmationPage() {
  const params = useParams();

  const locale = (params.locale as string) || "en";
  const enrolmentId = (params.enrolmentId as string) || "DEMO-88392";

  // Mock enrollment record
  const enrolment = {
    id: enrolmentId,
    transactionDate: "25 August 2026",
    courseTitle: "Regulatory Compliance & Ethics in Financial Practice",
    courseCode: "IA-2026-CPD01",
    cpdHours: "3.0 Hours",
    accreditationBody: "Insurance Authority (IA) / HKIB",
    attendeeName: "CHAN Tai Man",
    licenseNo: "IA12345678",
    email: "taiman.chan@example.com",
    paymentMethod: "Credit Card (Visa ending in 4242)",
    amountPaid: "HK$ 1,200",
    schedule: "15 September 2026 (Tuesday), 14:00 - 17:00",
    venue: "Main Campus Auditorium, Central, Hong Kong / Live Stream",
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans print:bg-white print:py-0 print:px-0">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Action Controls (Hidden when printing) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href={`/${locale}/dashboard`}
            className="text-xs font-bold text-slate-600 hover:text-[#1b4332] transition-colors flex items-center space-x-1"
          >
            <span>&larr; Go to Dashboard</span>
          </Link>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xs transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Receipt</span>
            </button>
            <button
              onClick={() => alert("Downloading PDF Invoice...")}
              className="inline-flex items-center space-x-1.5 bg-[#1b4332] hover:bg-[#112a1f] text-white text-xs font-bold px-3 py-1.5 rounded-xs transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Tax Invoice (PDF)</span>
            </button>
          </div>
        </div>

        {/* Official Receipt Card */}
        <div className="bg-white border border-slate-300 p-6 sm:p-8 shadow-2xs print:shadow-none print:border-none space-y-6">
          {/* Status Banner */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xs flex items-start space-x-3 print:border-emerald-500">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h1 className="text-base font-bold text-emerald-950 font-serif">
                Enrolment Confirmed & Payment Received
              </h1>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Thank you for your application. An official tax invoice and
                attendance instructions have been emailed to{" "}
                <span className="font-bold text-emerald-950">
                  {enrolment.email}
                </span>
                .
              </p>
            </div>
          </div>

          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                <Building2 className="w-3.5 h-3.5 text-[#1b4332]" />
                <span>
                  Executive Education & Continuing Professional Development
                </span>
              </div>
              <h2 className="text-xl font-serif font-bold text-[#1b4332]">
                Official Enrolment Confirmation & Tax Receipt
              </h2>
            </div>
            <div className="text-right font-mono text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-800">Ref:</span>{" "}
                {enrolment.id}
              </div>
              <div className="text-[11px] text-slate-500">
                {enrolment.transactionDate}
              </div>
            </div>
          </div>

          {/* Course Details Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              Registered Module
            </h3>
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xs space-y-3 text-xs">
              <div>
                <h4 className="text-base font-serif font-bold text-slate-900">
                  {enrolment.courseTitle}
                </h4>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-slate-600 text-[11px]">
                  <span className="font-mono font-semibold bg-white px-2 py-0.5 border border-slate-200">
                    Code: {enrolment.courseCode}
                  </span>
                  <span className="flex items-center space-x-1 font-bold text-[#1b4332]">
                    <Award className="w-3.5 h-3.5" />
                    <span>CPD Rating: {enrolment.cpdHours}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200 text-slate-700">
                <div className="flex items-start space-x-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Schedule:
                    </span>
                    <span>{enrolment.schedule}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">
                      Location / Access:
                    </span>
                    <span>{enrolment.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendee & Payment Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Attendee Meta */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                Attendee & License Record
              </h3>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered Name:</span>
                  <span className="font-bold text-slate-900">
                    {enrolment.attendeeName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IA / License Reg No:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {enrolment.licenseNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Notification Email:</span>
                  <span className="text-slate-900">{enrolment.email}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                Payment Details
              </h3>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="text-slate-900">
                    {enrolment.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                    PAID IN FULL
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="font-serif text-base text-[#1b4332]">
                    {enrolment.amountPaid}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Steps for Professional CPD */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-[#1b4332]" />
              <span>Important Attendee Instructions</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside leading-relaxed">
              <li>
                <strong>CPD Verification:</strong> Attendance will be recorded
                via sign-in at the venue or digital log-ins during live streams.
                Full participation is mandatory to claim CPD hours.
              </li>
              <li>
                <strong>Materials & Links:</strong> E-coursebooks and access
                credentials will be available on your learner dashboard 48 hours
                prior to session commencement.
              </li>
              <li>
                <strong>Certificate Issuance:</strong> Upon successful
                completion and attendance auditing, your certificate of
                completion will be available for direct download on your
                dashboard.
              </li>
            </ul>
          </div>
        </div>

        {/* Dashboard Link Footer */}
        <div className="text-center pt-2 print:hidden">
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center space-x-2 bg-[#1b4332] hover:bg-[#112a1f] text-white font-bold px-5 py-2.5 text-xs uppercase tracking-wider rounded-xs shadow-2xs transition-colors"
          >
            <span>Access Learner Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
