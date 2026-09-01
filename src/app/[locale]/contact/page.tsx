import Link from "next/link";
import { ArrowLeft, Building2, Phone, Mail, MessageCircle, Clock, MapPin } from "lucide-react";
import { getDictionary } from "@/dictionaries/get-dictionary";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.contactPage;

  const mapSrc = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3691.912345!2d114.178!3d22.297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDE3JzQ5LjIiTiAxMTTCsDEwJzQwLjgiRQ!5e0!3m2!1sen!2shk!4v1`;

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center text-xs font-semibold text-slate-600">
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-1.5 hover:text-[#1b4332] transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>{t.backToPortal}</span>
          </Link>
        </div>

        <header className="bg-white border border-slate-300 border-t-4 border-t-[#1b4332] p-8 shadow-2xs space-y-2">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
            <Building2 className="w-3.5 h-3.5 text-emerald-800" />
            <span>{t.officeTitle}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332] tracking-tight">
            {t.pageTitle}
          </h1>
          <p className="text-slate-500 text-xs font-mono">
            {t.pageSubtitle}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-3 bg-white border border-slate-300 shadow-2xs overflow-hidden">
            <iframe
              src={mapSrc}
              width="100%"
              height="320"
              style={{ border: 0, display: "block" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="LMC Office Location"
            />
          </div>

          <div className="md:col-span-2 bg-white border border-slate-300 shadow-2xs p-6 space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#1b4332] shrink-0 mt-0.5" />
              <div className="text-xs font-mono text-slate-700 leading-relaxed">
                {t.addressLine1}<br />
                {t.addressLine2}<br />
                {t.addressLine3}
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                {t.getInTouch}
              </h3>
              <a
                href={`tel:${t.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3 text-xs font-mono text-slate-700 hover:text-[#1b4332] transition-colors"
              >
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span><strong>{t.phoneLabel}:</strong> {t.phone}</span>
              </a>
              <a
                href={`mailto:${t.email}?subject=Enquiry%20via%20LMC%20Portal`}
                className="flex items-center gap-3 text-xs font-mono text-slate-700 hover:text-[#1b4332] transition-colors"
              >
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span><strong>{t.emailLabel}:</strong> {t.email}</span>
              </a>
              <a
                href={`https://wa.me/${t.whatsapp.replace(/\s/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-xs font-mono text-slate-700 hover:text-[#1b4332] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-slate-500 shrink-0" />
                <span><strong>{t.whatsappLabel}:</strong> {t.whatsapp}</span>
              </a>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {t.officeHours}
              </h3>
              <p className="text-[11px] font-mono text-slate-600">{t.officeHoursMonFri}</p>
              <p className="text-[11px] font-mono text-slate-600">{t.officeHoursSat}</p>
              <p className="text-[11px] font-mono text-slate-500">{t.officeHoursClosed}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}