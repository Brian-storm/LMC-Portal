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
          <div className="flex items-center space-x-2 text-emerald-900 font-semibold text-xs uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Statutory Governance & Compliance Statement</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Personal Data Privacy Policy
          </h1>
          <p className="text-slate-500 text-xs mt-2 font-mono">
            Document Ref: LMC-DP-2026-V2 | Effective Date: August 24, 2026 | LMC
            Management Consultancy Ltd.
          </p>
        </div>

        {/* Policy Content */}
        <div className="bg-white border border-slate-200 rounded-xs p-8 sm:p-10 space-y-8 shadow-2xs text-xs sm:text-sm leading-relaxed text-slate-700">
          <p className="italic text-slate-600 border-l-2 border-emerald-800 pl-4 py-1 bg-slate-50">
            This Policy sets out the statutory obligations and standard
            operating procedures of LMC Management Consultancy Ltd. (&quot;the
            Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
            in relation to the collection, holding, processing, disclosure, and
            transfer of personal data pursuant to the Personal Data (Privacy)
            Ordinance (Cap. 486 of the Laws of Hong Kong SAR)
            (&quot;PDPO&quot;).
          </p>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wide">
              <Eye className="w-4 h-4 text-emerald-800" />
              1. Categories of Personal Data Collected
            </h2>
            <p>
              In the execution of corporate governance, accreditation, and
              institutional consultancy services, the Company may collect and
              process the following classes of personal data from data subjects:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Identity and Contact Data:</strong> Legal full name,
                official corporate email address, contact telephone numbers,
                employer designation, and professional credentials.
              </li>
              <li>
                <strong>Account and Access Data:</strong> Unique user
                identifiers, hashed authentication tokens, access logs, and
                formal course enrollment histories processed through our secure
                enterprise portals.
              </li>
              <li>
                <strong>Technical and Telemetric Data:</strong> Internet
                Protocol (IP) addresses, user agent identifiers, operating
                system parameters, and session telemetry recorded during
                interaction with the Company&apos;s electronic interfaces.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-emerald-800" />
              2. Legal Basis and Specific Purposes of Data Processing
            </h2>
            <p>
              All personal data collected shall be held confidential and
              processed strictly to the extent necessary for the performance of
              contractual obligations or compliance with applicable legal and
              statutory mandates, specifically including:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                Verification of candidate identity for institutional enrollment,
                accreditation assessments, and formal certificate issuance.
              </li>
              <li>
                Administration, maintenance, and security monitoring of client
                portal access controls.
              </li>
              <li>
                Dissemination of statutory compliance notices, regulatory
                advisories, and requested corporate bulletins.
              </li>
              <li>
                Satisfaction of statutory audit obligations, record-keeping
                requirements, and legal directions issued by competent judicial
                or governmental authorities in Hong Kong SAR.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wide">
              <Lock className="w-4 h-4 text-emerald-800" />
              3. Data Protection Safeguards and Retention Protocols
            </h2>
            <p>
              The Company maintains reasonable technical, administrative, and
              physical measures to ensure personal data is safeguarded against
              unauthorized or accidental access, processing, erasure, loss, or
              use. Personal data shall not be retained longer than is necessary
              for the fulfillment of the purpose for which the data is or is to
              be used, subject to statutory retention periods prescribed under
              relevant laws.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wide">
              <Cookie className="w-4 h-4 text-emerald-800" />
              4. Transfer and Disclosure to Third Parties
            </h2>
            <p>
              Personal data collected by the Company will not be sold, rented,
              traded, or otherwise disclosed to third parties, except under the
              following circumscribed circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Authorized Service Providers:</strong> To vetted
                third-party data processors, hosting infrastructure providers,
                and administrative software vendors acting strictly under
                binding non-disclosure and data processing agreements.
              </li>
              <li>
                <strong>Regulatory & Accreditation Authorities:</strong> To
                recognized educational governing bodies or accreditation
                agencies as required for formal certification verification.
              </li>
              <li>
                <strong>Statutory Mandates:</strong> To statutory, regulatory,
                governmental, or law enforcement entities pursuant to a valid
                subpoena, court order, or statutory directive under Hong Kong
                law.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-serif font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2 uppercase tracking-wide">
              <Mail className="w-4 h-4 text-emerald-800" />
              5. Statutory Data Subject Access & Correction Rights
            </h2>
            <p>
              Pursuant to Sections 18 and 22 and Data Protection Principle 6 of
              the PDPO, data subjects possess the right to ascertain whether the
              Company holds their personal data, request a copy thereof, and
              require the correction of any inaccurate data.
            </p>
            <p>
              Formal Data Access Requests (DAR) or Data Correction Requests
              (DCR) should be addressed in writing to our designated Data
              Protection Officer:
            </p>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs text-xs space-y-1 font-mono text-slate-800">
              <p>
                <strong>ATTN:</strong> Data Protection Officer
              </p>
              <p>
                <strong>Entity:</strong> LMC Management Consultancy Ltd.
              </p>
              <p>
                <strong>Email:</strong> privacy@LMCconsulting.hk
              </p>
              <p>
                <strong>Jurisdiction:</strong> Hong Kong Special Administrative
                Region
              </p>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Note: The Company reserves the right to charge a reasonable fee
              for the processing of any compliance Data Access Request as
              permitted under Section 28 of the PDPO.
            </p>
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
