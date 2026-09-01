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
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { getDictionary } from "@/dictionaries/get-dictionary";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.privacyPage;

  return (
    <>
      <Breadcrumbs
        currentLocale={locale}
        items={[{ label: dict.breadcrumbs.privacy, href: "/privacy" }]}
        dict={dict.breadcrumbs}
      />
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
            <span>{t.complianceBadge}</span>
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
              <span>{t.dpoRegistry}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
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
              {t.govFramework}{" "}
              <strong className="text-slate-700">{t.govFrameworkValue}</strong>
            </p>
          </div>
        </header>

        <main className="bg-white border border-slate-300 p-8 sm:p-12 shadow-2xs space-y-10 text-xs sm:text-sm leading-relaxed text-slate-700">
          <div className="border-l-4 border-[#1b4332] bg-slate-50/90 p-5 border-y border-r border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1b4332]">
              <AlertCircle className="w-4 h-4 text-emerald-800" />
              <span>{t.noticeTitle}</span>
            </div>
            <p className="italic text-slate-700 text-xs sm:text-sm leading-relaxed">
              {t.noticeText}
            </p>
          </div>

          <Section icon={Eye} title={t.s1Title}>
            <p>{t.s1Intro}</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong>{t.s1Bullet1Label}</strong> {t.s1Bullet1}
              </li>
              <li>
                <strong>{t.s1Bullet2Label}</strong> {t.s1Bullet2}
              </li>
              <li>
                <strong>{t.s1Bullet3Label}</strong> {t.s1Bullet3}
              </li>
            </ul>
          </Section>

          <Section icon={FileText} title={t.s2Title}>
            <p>{t.s2Intro}</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>{t.s2Bullet1}</li>
              <li>{t.s2Bullet2}</li>
              <li>{t.s2Bullet3}</li>
              <li>{t.s2Bullet4}</li>
            </ul>
          </Section>

          <Section icon={Lock} title={t.s3Title}>
            <p>{t.s3Para}</p>
          </Section>

          <Section icon={Cookie} title={t.s4Title}>
            <p>{t.s4Intro}</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong>{t.s4Bullet1Label}</strong> {t.s4Bullet1}
              </li>
              <li>
                <strong>{t.s4Bullet2Label}</strong> {t.s4Bullet2}
              </li>
              <li>
                <strong>{t.s4Bullet3Label}</strong> {t.s4Bullet3}
              </li>
            </ul>
          </Section>

          <section className="space-y-4">
            <h2 className="text-sm sm:text-base font-serif font-bold text-[#1b4332] border-b border-slate-200 pb-2.5 flex items-center gap-2 uppercase tracking-wide">
              <Mail className="w-4 h-4 text-[#1b4332]" />
              <span>{t.s5Title}</span>
            </h2>
            <p>{t.s5Para1}</p>
            <p>{t.s5Para2}</p>

            <div className="bg-[#f6f8f6] border border-slate-300 p-5 rounded-xs text-xs space-y-2 font-mono text-slate-800">
              <div className="flex items-center space-x-1.5 text-[#1b4332] font-bold pb-1 border-b border-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.dpoTitle}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <p>
                  <strong>{t.dpoEntity}</strong> {t.dpoEntityValue}
                </p>
                <p>
                  <strong>{t.dpoEmail}</strong> {t.dpoEmailValue}
                </p>
                <p>
                  <strong>{t.dpoStatutory}</strong> {t.dpoStatutoryValue}
                </p>
                <p>
                  <strong>{t.dpoJurisdiction}</strong> {t.dpoJurisdictionValue}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic pt-1">
              {t.feeNote}
            </p>
          </section>
        </main>

        <div className="pt-2 pb-12 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold gap-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center space-x-1.5 text-[#1b4332] hover:text-emerald-900 tracking-wider uppercase bg-white px-4 py-2.5 border border-slate-300 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.returnHome}</span>
          </Link>
          <p className="text-slate-400 font-mono text-[11px]">
            &copy; {new Date().getFullYear()} LMC Management Consultancy Ltd.{" "}
            {t.copyright}
          </p>
        </div>
      </div>
      </div>
    </>
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