import Link from "next/link";
import { Scale, BookOpen, ShieldAlert, Award, ArrowLeft } from "lucide-react";

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
          <div className="flex items-center space-x-2 text-blue-900 font-semibold text-xs uppercase tracking-wider mb-2">
            <Scale className="w-4 h-4" />
            <span>Institutional Governance</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-slate-500 text-xs mt-2">
            Effective Date: August 2026 | LMC Management Consultancy Ltd.
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-white border border-slate-200 rounded-xs p-8 sm:p-10 space-y-8 shadow-2xs text-xs sm:text-sm leading-relaxed text-slate-600">
          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing the LMC Management Consultancy Ltd. platform,
              enrolling in courses, or using client portal services, you agree
              to comply with these Terms & Conditions. If you do not accept
              these terms, you must refrain from using our services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-900" />
              2. Course Enrollment & Certification
            </h2>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>
                Course registrations are verified upon confirmation of payment
                or corporate authorization.
              </li>
              <li>
                Attendance and assessment pass marks must meet accredited
                standards to receive official certificates.
              </li>
              <li>
                Course materials provided remain the intellectual property of
                LMC Management Consultancy Ltd.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-900" />
              3. Intellectual Property Rights
            </h2>
            <p>
              All curriculum designs, consultancy documentation, software
              interfaces, trademarks, and logos displayed on this portal are
              protected by intellectual property laws. Unauthorized
              reproduction, distribution, or commercial exploitation is strictly
              prohibited.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-900" />
              4. Portal Account Responsibility
            </h2>
            <p>
              Users assigned portal accounts are responsible for maintaining
              credentials confidentiality. Any unauthorized access under your
              account must be reported immediately to our support team at{" "}
              <span className="font-mono text-slate-800">
                info@LMCconsulting.hk
              </span>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2">
              5. Limitation of Liability
            </h2>
            <p>
              While LMC Management Consultancy Ltd. strives to deliver accurate
              professional advisory and educational materials, services are
              provided on an "as is" basis. LMC accepts no liability for
              indirect losses arising from platform downtime or third-party
              usage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2">
              6. Governing Law
            </h2>
            <p>
              These Terms & Conditions are governed by and construed in
              accordance with the laws of the Hong Kong Special Administrative
              Region. Any disputes arising shall be subject to the exclusive
              jurisdiction of the Hong Kong courts.
            </p>
          </section>
        </div>

        {/* Navigation Back */}
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center text-xs uppercase font-semibold text-blue-900 hover:text-blue-800 tracking-wider gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
