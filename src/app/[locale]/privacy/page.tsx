import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Mail,
  Cookie,
  ArrowLeft,
  Building2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function PrivacyPage({ params }: PageProps) {
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
            <span>Statutory Compliance: PDPO (Cap. 486)</span>
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
              <span>Data Protection Officer Registry</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
              <span>Statutory Governance & Compliance Statement</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332] tracking-tight">
              Personal Data Privacy Policy
            </h1>
            <p className="text-slate-500 text-xs font-mono pt-1">
              Document Reference:{" "}
              <strong className="text-slate-700">LMC-DP-2026-V2</strong> |
              Effective Date:{" "}
              <strong className="text-slate-700">August 24, 2026</strong> |
              Governing Framework:{" "}
              <strong className="text-slate-700">
                Personal Data (Privacy) Ordinance (Cap. 486)
              </strong>
            </p>
          </div>
        </header>

        {/* Core Privacy Content Container */}
        <main className="bg-white border border-slate-300 p-8 sm:p-12 shadow-2xs space-y-10 text-xs sm:text-sm leading-relaxed text-slate-700">
          {/* Executive Summary / Ordinance Notice Box */}
          <div className="border-l-4 border-[#1b4332] bg-slate-50/90 p-5 border-y border-r border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1b4332]">
              <AlertCircle className="w-4 h-4 text-emerald-800" />
              <span>Statutory Notice of Compliance</span>
            </div>
            <p className="italic text-slate-700 text-xs sm:text-sm leading-relaxed">
              This Policy sets out the statutory obligations and standard
              operating procedures of LMC Management Consultancy Ltd. (&quot;the
              Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
              in relation to the collection, holding, processing, disclosure,
              and transfer of personal data pursuant to the Personal Data
              (Privacy) Ordinance (Cap. 486 of the Laws of Hong Kong SAR)
              (&quot;PDPO&quot;).
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <Eye className="w-4 h-4 text-[#1b4332]" />
              <span>1. Categories of Personal Data Collected</span>
            </h2>
            <p>
              In the execution of corporate governance, executive education, and
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
                identifiers, hashed authentication tokens, secure session access
                logs, and formal course enrollment or CPD accreditation
                histories processed through our secure enterprise portals.
              </li>
              <li>
                <strong>Technical and Telemetric Data:</strong> Internet
                Protocol (IP) addresses, user agent identifiers, operating
                system parameters, and electronic session telemetry recorded
                during interaction with the Company&apos;s digital interfaces.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-[#1b4332]" />
              <span>
                2. Legal Basis and Specific Purposes of Data Processing
              </span>
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
                regulatory CPD accreditation assessments, and formal certificate
                issuance.
              </li>
              <li>
                Administration, maintenance, and security monitoring of client
                portal access controls and multi-factor authentication systems.
              </li>
              <li>
                Dissemination of statutory compliance notices, regulatory
                governance advisories, and requested corporate training
                bulletins.
              </li>
              <li>
                Satisfaction of statutory audit obligations, financial
                record-keeping requirements, and legal directions issued by
                competent judicial or governmental authorities in Hong Kong SAR.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <Lock className="w-4 h-4 text-[#1b4332]" />
              <span>3. Data Protection Safeguards and Retention Protocols</span>
            </h2>
            <p>
              The Company maintains reasonable technical, administrative, and
              physical security measures to ensure personal data is safeguarded
              against unauthorized or accidental access, processing, erasure,
              loss, or misuse. Personal data shall not be retained longer than
              is necessary for the fulfillment of the purpose for which the data
              is or is to be used, subject strictly to statutory retention
              periods prescribed under relevant Hong Kong laws.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <Cookie className="w-4 h-4 text-[#1b4332]" />
              <span>4. Transfer and Disclosure to Third Parties</span>
            </h2>
            <p>
              Personal data collected by the Company will not be sold, rented,
              traded, or otherwise disclosed to third parties, except under the
              following circumscribed circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong>Authorized Service Providers:</strong> To vetted
                third-party data processors, enterprise cloud hosting
                infrastructure providers, and administrative software vendors
                acting strictly under binding non-disclosure and data processing
                agreements.
              </li>
              <li>
                <strong>Regulatory & Accreditation Authorities:</strong> To
                recognized educational governing bodies or statutory
                accreditation agencies (such as relevant insurance or financial
                regulators) as required for formal professional certification
                verification.
              </li>
              <li>
                <strong>Statutory Mandates:</strong> To statutory, regulatory,
                governmental, or law enforcement entities pursuant to a valid
                subpoena, court order, or statutory directive under the laws of
                Hong Kong SAR.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <Mail className="w-4 h-4 text-[#1b4332]" />
              <span>5. Statutory Data Subject Access & Correction Rights</span>
            </h2>
            <p>
              Pursuant to Sections 18 and 22 and Data Protection Principle 6
              (DPP6) of the Personal Data (Privacy) Ordinance, data subjects
              possess the statutory right to ascertain whether the Company holds
              their personal data, request a copy thereof, and require the
              correction of any inaccurate data records.
            </p>
            <p>
              Formal Data Access Requests (DAR) or Data Correction Requests
              (DCR) should be addressed in writing to our designated Data
              Protection Officer:
            </p>

            {/* DPO Contact Box */}
            <div className="bg-[#f6f8f6] border border-slate-300 p-5 rounded-xs text-xs space-y-2 font-mono text-slate-800">
              <div className="flex items-center space-x-1.5 text-[#1b4332] font-bold pb-1 border-b border-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>Designated Data Protection Officer (DPO)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <p>
                  <strong>Corporate Entity:</strong> LMC Management Consultancy
                  Ltd.
                </p>
                <p>
                  <strong>DPO Email:</strong> privacy@LMCconsulting.hk
                </p>
                <p>
                  <strong>Statutory Basis:</strong> PDPO (Cap. 486) Sections 18
                  & 22
                </p>
                <p>
                  <strong>Jurisdiction:</strong> Hong Kong SAR
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic pt-1">
              Note: The Company reserves the right to charge a reasonable fee
              for the administrative processing of any formal compliance Data
              Access Request as permitted under Section 28 of the PDPO.
            </p>
          </section>
        </main>

        {/* Footer Return Navigation & Copyright */}
        <div className="pt-2 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold gap-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center space-x-1.5 text-[#1b4332] hover:text-emerald-900 tracking-wider uppercase bg-white px-4 py-2.5 border border-slate-300 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
          <p className="text-slate-400 font-mono text-[11px]">
            © {new Date().getFullYear()} LMC Management Consultancy Ltd. All
            Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
