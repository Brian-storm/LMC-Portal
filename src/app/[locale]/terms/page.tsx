import Link from "next/link";
import {
  FileText,
  Scale,
  ShieldAlert,
  BookOpen,
  AlertTriangle,
  Building2,
  ArrowLeft,
  ShieldCheck,
  Printer,
  CheckCircle,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#1b4332] selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation & Controls */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-1.5 hover:text-[#1b4332] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Institutional Portal</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-1 text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 border border-slate-200 rounded-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>Official Regulatory Version: 2026.Q3</span>
          </div>
        </div>

        {/* Institutional Header Card */}
        <header className="bg-white border border-slate-300 border-t-4 border-t-[#1b4332] p-8 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-2 text-[11px] font-bold text-[#1b4332] uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-[#1b4332]" />
              <span>LMC Management Consultancy Ltd. — Hong Kong SAR</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>HKSAR Company Reg. No. 3284901</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
              <Scale className="w-3.5 h-3.5 text-emerald-800" />
              <span>Statutory & Institutional Compliance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332] tracking-tight">
              Terms & Conditions of Service
            </h1>
            <p className="text-slate-500 text-xs font-mono pt-1">
              Document Reference:{" "}
              <strong className="text-slate-700">LMC-TOS-2026-V1</strong> |
              Effective Date:{" "}
              <strong className="text-slate-700">August 24, 2026</strong> |
              Governing Law:{" "}
              <strong className="text-slate-700">Hong Kong SAR</strong>
            </p>
          </div>
        </header>

        {/* Core Legal Container */}
        <main className="bg-white border border-slate-300 p-8 sm:p-12 shadow-2xs space-y-10 text-xs sm:text-sm leading-relaxed text-slate-700">
          {/* Executive Summary / Binding Notice Box */}
          <div className="border-l-4 border-[#1b4332] bg-slate-50/90 p-5 border-y border-r border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1b4332]">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Binding Legal Notice</span>
            </div>
            <p className="italic text-slate-700 text-xs sm:text-sm leading-relaxed">
              PLEASE READ THESE TERMS AND CONDITIONS (&quot;TERMS&quot;)
              CAREFULLY BEFORE ACCESSING OR USING THE SERVICES, PORTALS, OR
              TRAINING PROGRAMMES PROVIDED BY LMC MANAGEMENT CONSULTANCY LTD.
              (&quot;THE COMPANY&quot;). ACCESS TO OR USE OF ANY SERVICES
              CONSTITUTES UNCONDITIONAL ACCEPTANCE OF AND COMPLIANCE WITH THESE
              TERMS.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-[#1b4332]" />
              <span>1. Binding Agreement & Scope of Services</span>
            </h2>
            <p>
              1.1 These Terms constitute a legally binding agreement between you
              (&quot;User&quot;, &quot;Client&quot;, or &quot;Student&quot;) and
              LMC Management Consultancy Ltd., a corporate entity duly
              incorporated and operating under the laws of the Hong Kong Special
              Administrative Region.
            </p>
            <p>
              1.2 The Company provides corporate governance consultancy,
              executive education, accredited institutional training programmes
              (including Insurance Authority / regulatory CPD certified
              modules), and secure client web portals (collectively, the
              &quot;Services&quot;).
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <BookOpen className="w-4 h-4 text-[#1b4332]" />
              <span>2. Intellectual Property Rights & Licensing</span>
            </h2>
            <p>
              2.1 All course materials, regulatory compliance frameworks,
              curriculum content, professional trademarks, data graphics, and
              proprietary portal software remain the exclusive intellectual
              property of the Company or its accredited institutional licensors.
            </p>
            <p>
              2.2 Upon formal enrollment and clearance of applicable fees, the
              Company grants the User a limited, non-exclusive,
              non-transferable, revocable license to access course materials
              strictly for personal professional development or internal
              corporate governance educational purposes. The User expressly
              agrees not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                Reproduce, redistribute, republish, sell, or commercially
                exploit any proprietary courseware, CPD notes, or publications
                without prior express written consent from the Company
                directorate.
              </li>
              <li>
                Decompile, reverse engineer, scrape, or extract source code from
                the Company&apos;s digital training portals or assessment
                systems.
              </li>
              <li>
                Remove, obscure, or alter any statutory copyright notices,
                branding, or proprietary regulatory designations.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-[#1b4332]" />
              <span>3. User Account Security & Attendance Monitoring</span>
            </h2>
            <p>
              3.1 Users assigned secure credentials to access the client portal
              or live webinar training sessions are solely responsible for
              maintaining the strict confidentiality of their usernames,
              passwords, and multi-factor authentication tokens.
            </p>
            <p>
              3.2 For accredited CPD training courses, account credentials and
              attendance tracking logs are tied directly to individual
              professional licenses (e.g., HKFI, IA registration numbers).
              Credential sharing, proxy attendance, or multi-user login sharing
              is strictly prohibited and will result in immediate termination of
              portal access and forfeiture of accredited hours without refund or
              appeal.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-[#1b4332]" />
              <span>4. Limitation of Liability & Professional Disclaimer</span>
            </h2>
            <p>
              4.1 Consultancy materials, corporate governance blueprints, and
              educational courseware provided by the Company are structured
              solely for general regulatory, compliance awareness, and
              professional development purposes, and do not constitute formal
              binding legal, tax, or financial counsel.
            </p>
            <p>
              4.2 To the maximum extent permitted under the laws of Hong Kong
              SAR, the Company, its directors, officers, and instructors shall
              not be held liable for any indirect, incidental, punitive, or
              consequential economic damages arising from operational reliance
              on training materials, technical platform service interruptions,
              or regulatory filing delays.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <Building2 className="w-4 h-4 text-[#1b4332]" />
              <span>5. Governing Law & Dispute Resolution</span>
            </h2>
            <p>
              5.1 These Terms shall be governed by, construed, and enforced in
              accordance with the substantive laws of the Hong Kong Special
              Administrative Region.
            </p>
            <p>
              5.2 Any dispute, controversy, or claim arising out of or relating
              to these Terms, or the breach, termination, or invalidity thereof,
              shall be submitted to the exclusive jurisdiction of the Courts of
              the Hong Kong Special Administrative Region.
            </p>

            {/* Corporate Contact Block */}
            <div className="bg-[#f6f8f6] border border-slate-300 p-5 rounded-xs text-xs space-y-2 font-mono text-slate-800">
              <div className="flex items-center space-x-1.5 text-[#1b4332] font-bold pb-1 border-b border-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>Institutional Registry & Legal Inquiries</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <p>
                  <strong>Corporate Entity:</strong> LMC Management Consultancy
                  Ltd.
                </p>
                <p>
                  <strong>Legal Department:</strong> legal@LMCconsulting.hk
                </p>
                <p>
                  <strong>Regulatory Compliance:</strong>{" "}
                  compliance@LMCconsulting.hk
                </p>
                <p>
                  <strong>Jurisdiction:</strong> Hong Kong SAR
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer Return Navigation */}
        <div className="pt-2 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center space-x-1.5 text-[#1b4332] hover:text-emerald-900 tracking-wider uppercase bg-white px-4 py-2.5 border border-slate-300 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
          <p className="text-slate-400 font-mono text-[11px] mt-3 sm:mt-0">
            © {new Date().getFullYear()} LMC Management Consultancy Ltd. All
            Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
