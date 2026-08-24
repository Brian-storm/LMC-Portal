import Link from "next/link";
import {
  FileText,
  Scale,
  ShieldAlert,
  BookOpen,
  AlertTriangle,
  Building2,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xs p-8 mb-8 shadow-2xs">
          <div className="flex items-center space-x-2 text-emerald-900 font-semibold text-xs uppercase tracking-wider mb-2">
            <Scale className="w-4 h-4 text-emerald-800" />
            <span>Institutional Legal Agreement</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Terms & Conditions of Service
          </h1>
          <p className="text-slate-500 text-xs mt-2 font-mono">
            Document Ref: LMC-TOS-2026-V1 | Effective Date: August 24, 2026 |
            LMC Management Consultancy Ltd.
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-white border border-slate-200 rounded-xs p-8 sm:p-10 space-y-8 shadow-2xs text-xs sm:text-sm leading-relaxed text-slate-700">
          <p className="italic text-slate-600 border-l-2 border-emerald-800 pl-4 py-1 bg-slate-50">
            PLEASE READ THESE TERMS AND CONDITIONS (&quot;TERMS&quot;) CAREFULLY
            BEFORE ACCESSING OR USING THE SERVICES, PORTALS, OR TRAINING
            PROGRAMMES PROVIDED BY LMC MANAGEMENT CONSULTANCY LTD. (&quot;THE
            COMPANY&quot;). ACCESS TO OR USE OF ANY SERVICES CONSTITUTES
            UNCONDITIONAL ACCEPTANCE OF AND COMPLIANCE WITH THESE TERMS.
          </p>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-emerald-800" />
              1. Binding Agreement & Scope of Services
            </h2>
            <p>
              1.1 These Terms constitute a legally binding agreement between you
              (&quot;User&quot;, &quot;Client&quot;, or &quot;Student&quot;) and
              LMC Management Consultancy Ltd., a company incorporated under the
              laws of Hong Kong SAR.
            </p>
            <p>
              1.2 The Company provides corporate governance consultancy,
              executive education, accredited institutional training programmes,
              and secure client portals (collectively, the
              &quot;Services&quot;).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wide">
              <BookOpen className="w-4 h-4 text-emerald-800" />
              2. Intellectual Property Rights & Licensing
            </h2>
            <p>
              2.1 All course materials, consultancy frameworks, curriculum
              content, trademarks, graphics, and proprietary portal software
              remain the exclusive intellectual property of the Company or its
              accredited licensors.
            </p>
            <p>
              2.2 Upon formal enrollment, the Company grants the User a limited,
              non-exclusive, non-transferable, revocable license to access
              course materials strictly for personal or internal corporate
              educational purposes. User shall not:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                Reproduce, redistribute, sell, or commercially exploit any
                proprietary courseware or publications without express written
                consent.
              </li>
              <li>
                Decompile, reverse engineer, or extract source code from the
                Company&apos;s digital portals.
              </li>
              <li>
                Remove, obscure, or alter any copyright notices or proprietary
                designations.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-emerald-800" />
              3. User Account Security & Portal Access
            </h2>
            <p>
              3.1 Users assigned credentials to access the client portal are
              solely responsible for maintaining the strict confidentiality of
              their account usernames and authentication credentials.
            </p>
            <p>
              3.2 Account credentials are non-transferable and designated for
              individual use. The Company reserves the right to immediately
              terminate portal access without refund if credential sharing or
              unauthorized access is detected.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-emerald-800" />
              4. Limitation of Liability & Professional Disclaimer
            </h2>
            <p>
              4.1 Consultancy materials and educational courseware provided by
              the Company are intended solely for general regulatory,
              compliance, and professional development purposes and do not
              constitute formal legal or financial advice.
            </p>
            <p>
              4.2 To the maximum extent permitted under Hong Kong law, the
              Company shall not be liable for any indirect, incidental,
              punitive, or consequential damages resulting from reliance on
              training materials or service interruptions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wide">
              <Building2 className="w-4 h-4 text-emerald-800" />
              5. Governing Law & Dispute Resolution
            </h2>
            <p>
              5.1 These Terms shall be governed by, construed, and enforced in
              accordance with the laws of the Hong Kong Special Administrative
              Region.
            </p>
            <p>
              5.2 Any dispute, controversy, or claim arising out of or relating
              to these Terms or the breach, termination, or invalidity thereof
              shall be submitted to the exclusive jurisdiction of the Courts of
              the Hong Kong Special Administrative Region.
            </p>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs text-xs space-y-1 font-mono text-slate-800">
              <p>
                <strong>Entity:</strong> LMC Management Consultancy Ltd.
              </p>
              <p>
                <strong>Legal Inquiries:</strong> legal@LMCconsulting.hk
              </p>
              <p>
                <strong>Jurisdiction:</strong> Hong Kong SAR
              </p>
            </div>
          </section>
        </div>

        {/* Navigation Back */}
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}`}
            className="text-xs uppercase font-semibold text-emerald-900 hover:text-emerald-700 tracking-wider transition-colors"
          >
            ← Return to Corporate Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
