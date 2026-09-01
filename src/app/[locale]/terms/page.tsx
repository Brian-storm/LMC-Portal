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
  CheckCircle,
} from "lucide-react";
import { getDictionary } from "@/dictionaries/get-dictionary";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.termsPage;

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#1b4332] selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-1.5 hover:text-[#1b4332] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{t.backToPortal}</span>
          </Link>
          <div className="hidden sm:flex items-center space-x-1 text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 border border-slate-200 rounded-xs shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>{t.regulatoryVersion}</span>
          </div>
        </div>

        <header className="bg-white border border-slate-300 border-t-4 border-t-[#1b4332] p-8 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-2 text-[11px] font-bold text-[#1b4332] uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-[#1b4332]" />
              <span>{t.companyHeader}</span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] font-mono text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.companyRegNumber}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
              <Scale className="w-3.5 h-3.5 text-emerald-800" />
              <span>{t.statutoryBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332] tracking-tight">
              {t.pageTitle}
            </h1>
            <p className="text-slate-500 text-xs font-mono pt-1">
              {t.docRef}{" "}
              <strong className="text-slate-700">{t.docRefCode}</strong> |{" "}
              {t.effDate}{" "}
              <strong className="text-slate-700">{t.effDateValue}</strong> |{" "}
              {t.govLaw}{" "}
              <strong className="text-slate-700">{t.govLawValue}</strong>
            </p>
          </div>
        </header>

        <main className="bg-white border border-slate-300 p-8 sm:p-12 shadow-2xs space-y-10 text-xs sm:text-sm leading-relaxed text-slate-700">
          <div className="border-l-4 border-[#1b4332] bg-slate-50/90 p-5 border-y border-r border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1b4332]">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>{t.bindingNoticeTitle}</span>
            </div>
            <p className="italic text-slate-700 text-xs sm:text-sm leading-relaxed">
              {t.bindingNoticeText}
            </p>
          </div>

          <Section icon={FileText} title={t.s1Title}>
            <p>{t.s1Para1}</p>
            <p>{t.s1Para2}</p>
          </Section>

          <Section icon={BookOpen} title={t.s2Title}>
            <p>{t.s2Para1}</p>
            <p>{t.s2Para2}</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>{t.s2Bullet1}</li>
              <li>{t.s2Bullet2}</li>
              <li>{t.s2Bullet3}</li>
            </ul>
          </Section>

          <Section icon={ShieldAlert} title={t.s3Title}>
            <p>{t.s3Para1}</p>
            <p>{t.s3Para2}</p>
          </Section>

          <Section icon={AlertTriangle} title={t.s4Title}>
            <p>{t.s4Para1}</p>
            <p>{t.s4Para2}</p>
          </Section>

          <section className="space-y-4">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <Building2 className="w-4 h-4 text-[#1b4332]" />
              <span>{t.s5Title}</span>
            </h2>
            <p>{t.s5Para1}</p>
            <p>{t.s5Para2}</p>

            <div className="bg-[#f6f8f6] border border-slate-300 p-5 rounded-xs text-xs space-y-2 font-mono text-slate-800">
              <div className="flex items-center space-x-1.5 text-[#1b4332] font-bold pb-1 border-b border-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.contactTitle}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <p>
                  <strong>{t.corporateEntity}</strong> {t.corporateEntityValue}
                </p>
                <p>
                  <strong>{t.legalDepartment}</strong> {t.legalDepartmentValue}
                </p>
                <p>
                  <strong>{t.regulatoryCompliance}</strong>{" "}
                  {t.regulatoryComplianceValue}
                </p>
                <p>
                  <strong>{t.jurisdiction}</strong> {t.jurisdictionValue}
                </p>
              </div>
            </div>
          </section>
        </main>

        <div className="pt-2 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center space-x-1.5 text-[#1b4332] hover:text-emerald-900 tracking-wider uppercase bg-white px-4 py-2.5 border border-slate-300 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.returnHome}</span>
          </Link>
          <p className="text-slate-400 font-mono text-[11px] mt-3 sm:mt-0">
            &copy; {new Date().getFullYear()} LMC Management Consultancy Ltd.{" "}
            {t.copyright}
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
        <Icon className="w-4 h-4 text-[#1b4332]" />
        <span>{title}</span>
      </h2>
      {children}
    </section>
  );
}