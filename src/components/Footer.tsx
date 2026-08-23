"use client";

import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {
  dict: {
    aboutTitle: string;
    aboutDesc: string;
    accredited: string;
    colCourses: string;
    colPortals: string;
    colContact: string;
    course1: string;
    course2: string;
    course3: string;
    course4: string;
    portal1: string;
    portal2: string;
    portal3: string;
    portal4: string;
    location: string;
    copyright: string;
    privacy: string;
    terms: string;
    disclaimer: string;
  };
  currentLocale: string;
}

export function Footer({ dict, currentLocale }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-300 text-xs border-t border-slate-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Brand Overview */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="bg-white text-slate-900 px-2.5 py-1 font-bold font-serif text-lg tracking-wider">
                LMC
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-white text-base leading-none tracking-tight">
                  {dict.aboutTitle}
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              {dict.aboutDesc}
            </p>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{dict.accredited}</span>
            </div>
          </div>

          {/* Column 2: Courses */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              {dict.colCourses}
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  href={`/${currentLocale}/courses`}
                  className="hover:text-white transition-colors"
                >
                  {dict.course1}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}/courses`}
                  className="hover:text-white transition-colors"
                >
                  {dict.course2}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}/courses`}
                  className="hover:text-white transition-colors"
                >
                  {dict.course3}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}/courses`}
                  className="hover:text-white transition-colors font-medium text-slate-300"
                >
                  {dict.course4}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              {dict.colPortals}
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link
                  href={`/${currentLocale}/portal`}
                  className="hover:text-white transition-colors"
                >
                  {dict.portal1}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}/portal/admin`}
                  className="hover:text-white transition-colors"
                >
                  {dict.portal2}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}/about`}
                  className="hover:text-white transition-colors"
                >
                  {dict.portal3}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}/faq`}
                  className="hover:text-white transition-colors"
                >
                  {dict.portal4}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-3">
            <h3 className="text-white font-semibold uppercase tracking-wider text-[11px]">
              {dict.colContact}
            </h3>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 text-slate-500 shrink-0 mt-0.5" />
                <span>{dict.location}</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-500 shrink-0" />
                <a
                  href="mailto:info@lmcconsulting.hk"
                  className="hover:text-white transition-colors"
                >
                  info@LMCconsulting.hk
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
            © {new Date().getFullYear()} LMC Management Consultancy Ltd.{" "}
            {dict.copyright}
          </p>
          <div className="flex space-x-4 text-slate-400">
            <Link
              href={`/${currentLocale}/privacy`}
              className="hover:text-slate-200 transition-colors"
            >
              {dict.privacy}
            </Link>
            <span>•</span>
            <Link
              href={`/${currentLocale}/terms`}
              className="hover:text-slate-200 transition-colors"
            >
              {dict.terms}
            </Link>
            <span>•</span>
            <Link
              href={`/${currentLocale}/disclaimer`}
              className="hover:text-slate-200 transition-colors"
            >
              {dict.disclaimer}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
