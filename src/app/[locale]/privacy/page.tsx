import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, Mail, Cookie } from "lucide-react";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xs p-8 mb-8 shadow-2xs">
          <div className="flex items-center space-x-2 text-blue-900 font-semibold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Legal & Governance</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-xs mt-2">
            Last Updated: August 2026 | LMC Management Consultancy Ltd.
          </p>
        </div>

        {/* Policy Content */}
        <div className="bg-white border border-slate-200 rounded-xs p-8 sm:p-10 space-y-8 shadow-2xs text-xs sm:text-sm leading-relaxed text-slate-600">
          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-900" />
              1. Information We Collect
            </h2>
            <p>
              LMC Management Consultancy Ltd. collects information necessary to
              provide institutional training, client portal services, and
              consultancy updates. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>
                <strong>Personal Identifiers:</strong> Full name, professional
                email address, phone number, and corporate affiliation.
              </li>
              <li>
                <strong>Portal Credentials:</strong> Authentication data and
                course enrollment records associated with student and
                administrator accounts.
              </li>
              <li>
                <strong>Technical Data:</strong> IP address, browser metadata,
                and usage statistics collected automatically via cookies to
                enhance accessibility.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-900" />
              2. How We Use Your Data
            </h2>
            <p>
              We process your data strictly for governance, compliance, and
              service fulfillment:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>
                Processing course enrollments and issuing accredited
                certificates.
              </li>
              <li>Managing client portal security and access verification.</li>
              <li>
                Distributing optional quarterly consultancy bulletins and
                regulatory updates.
              </li>
              <li>
                Complying with statutory obligations under regional educational
                and business frameworks.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-900" />
              3. Data Security & Retention
            </h2>
            <p>
              We enforce enterprise-grade security protocols to protect client
              and student records against unauthorized access, loss, or
              alteration. Personal data is retained only for as long as
              necessary to fulfill contractual obligations or comply with
              statutory retention laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Cookie className="w-4 h-4 text-blue-900" />
              4. Third-Party Disclosure
            </h2>
            <p>
              LMC Management Consultancy Ltd. does not sell, lease, or trade
              personal data. We share information only with trusted
              accreditation bodies, secure cloud infrastructure providers, or
              law enforcement authorities when legally required.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-900" />
              5. Contact & Data Subject Rights
            </h2>
            <p>
              You have the right to request access to, correction of, or erasure
              of your personal data. For privacy inquiries or compliance
              requests, contact our Data Protection Office:
            </p>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs text-xs space-y-1 font-mono text-slate-700">
              <p>Email: privacy@LMCconsulting.hk</p>
              <p>Address: LMC Management Consultancy Ltd., Hong Kong</p>
            </div>
          </section>
        </div>

        {/* Navigation Back */}
        <div className="mt-8 text-center">
          <Link
            href={`/${locale}`}
            className="text-xs uppercase font-semibold text-blue-900 hover:text-blue-800 tracking-wider"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
