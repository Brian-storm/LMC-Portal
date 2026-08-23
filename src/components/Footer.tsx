import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand & Institutional Overview */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="bg-white text-slate-900 px-2.5 py-1 font-bold font-serif text-lg tracking-wider">
                LMC
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-white text-base leading-none tracking-tight">
                  LMC Consultancy
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest pt-0.5">
                  Management & CPD Training
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              Hong Kong’s professional compliance and management consultancy.
              Delivering accredited Continuing Professional Development (CPD)
              modules for finance and insurance practitioners.
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Accredited Provider Standards</span>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              CPD Training & Directory
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  href="/courses"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Insurance Law & Ethics 2026
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Anti-Money Laundering (AML)
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Risk Governance & Compliance
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Browse All CPD Modules
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals & Resources */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Portals & Services
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  href="/portal"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Student Verification Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/portal/admin"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Institutional Staff Access
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors flex items-center"
                >
                  About LMC Consultancy
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-white transition-colors flex items-center"
                >
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Office Info */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              Hong Kong Advisory Office
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 text-slate-500 shrink-0 mt-0.5" />
                <span>Central District, Hong Kong SAR</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-500 shrink-0" />
                <a
                  href="mailto:info@lmc-consultancy.hk"
                  className="hover:text-white transition-colors"
                >
                  info@lmc-consultancy.hk
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-slate-500 shrink-0" />
                <span>+852 2123 4567</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="bg-slate-950 py-4 border-t border-slate-800/80 text-[11px] text-slate-500">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>
            © {new Date().getFullYear()} LMC Management Consultancy Ltd. All
            rights reserved.
          </p>
          <div className="flex space-x-4 text-slate-400">
            <Link
              href="/privacy"
              className="hover:text-slate-200 transition-colors"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <Link
              href="/terms"
              className="hover:text-slate-200 transition-colors"
            >
              Terms of Service
            </Link>
            <span>•</span>
            <Link
              href="/disclaimer"
              className="hover:text-slate-200 transition-colors"
            >
              CPD Accreditation Disclaimer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
