"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, BookOpen, User, PhoneCall, Info, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AccessibilityMenu } from "./AccessibilityMenu";

interface NavbarProps {
  dict: {
    brandSubtitle: string;
    home?: string;
    courses: string;
    portal: string;
    about: string;
    contact: string;
  };
  accessDict: {
    textSize: string;
    highContrast: string;
  };
  currentLocale: string;
}

export function Navbar({ dict, accessDict, currentLocale }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
        {/* Brand / Logo - Locked against global text scaling & shifted slightly left with -ml-2 */}
        <Link
          href={`/${currentLocale}`}
          className="flex items-center space-x-3 shrink-0 group -ml-12"
        >
          <div
            className="bg-slate-900 text-white px-2.5 py-1 font-bold font-serif text-lg tracking-wider rounded-xs transition-colors group-hover:bg-blue-900"
            style={{ fontSize: "18px", lineHeight: "28px" }}
          >
            LMC
          </div>
          <div className="hidden lg:flex flex-col">
            <span
              className="font-serif font-bold text-base leading-none tracking-tight text-slate-900"
              style={{ fontSize: "16px", lineHeight: "1" }}
            >
              LMC Management Consultancy
            </span>
            <span
              className="font-serif text-[9px] text-slate-500 uppercase tracking-widest pt-0.5 font-medium"
              style={{ fontSize: "9px" }}
            >
              {dict.brandSubtitle}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <Link
            href={`/${currentLocale}`}
            className="hover:text-blue-900 flex items-center transition-colors py-1 border-b-2 border-transparent hover:border-blue-900"
          >
            <Home className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {dict.home || "Home"}
          </Link>
          <Link
            href={`/${currentLocale}/courses`}
            className="hover:text-blue-900 flex items-center transition-colors py-1 border-b-2 border-transparent hover:border-blue-900"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {dict.courses}
          </Link>
          <Link
            href={`/${currentLocale}/portal`}
            className="hover:text-blue-900 flex items-center transition-colors py-1 border-b-2 border-transparent hover:border-blue-900"
          >
            <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {dict.portal}
          </Link>
          <Link
            href={`/${currentLocale}/about`}
            className="hover:text-blue-900 flex items-center transition-colors py-1 border-b-2 border-transparent hover:border-blue-900"
          >
            <Info className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {dict.about}
          </Link>
          <Link
            href={`/${currentLocale}/contact`}
            className="hover:text-blue-900 flex items-center transition-colors py-1 border-b-2 border-transparent hover:border-blue-900"
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {dict.contact}
          </Link>
        </nav>

        {/* Right Utilities: Accessibility Popover + Language Switcher + CTA */}
        <div className="hidden md:flex items-center space-x-3 -mr-12">
          <AccessibilityMenu accessDict={accessDict} />
          <LanguageSwitcher currentLocale={currentLocale} />
          <Link
            href={`/${currentLocale}/courses`}
            className="bg-blue-900 hover:bg-blue-800 text-white font-medium px-3.5 py-1.5 text-xs uppercase tracking-wider transition-colors rounded-xs shadow-xs"
          >
            Enroll
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center space-x-2 md:hidden">
          <AccessibilityMenu accessDict={accessDict} />
          <LanguageSwitcher currentLocale={currentLocale} />
          <button
            className="text-slate-700 p-1.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 py-3 space-y-1 shadow-lg">
          <Link
            href={`/${currentLocale}`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 hover:text-blue-900 hover:bg-slate-50 px-2 py-2 border-b border-slate-100 transition-colors"
          >
            {dict.home || "Home"}
          </Link>
          <Link
            href={`/${currentLocale}/courses`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 hover:text-blue-900 hover:bg-slate-50 px-2 py-2 border-b border-slate-100 transition-colors"
          >
            {dict.courses}
          </Link>
          <Link
            href={`/${currentLocale}/portal`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 hover:text-blue-900 hover:bg-slate-50 px-2 py-2 border-b border-slate-100 transition-colors"
          >
            {dict.portal}
          </Link>
          <Link
            href={`/${currentLocale}/about`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 hover:text-blue-900 hover:bg-slate-50 px-2 py-2 border-b border-slate-100 transition-colors"
          >
            {dict.about}
          </Link>
          <Link
            href={`/${currentLocale}/contact`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 hover:text-blue-900 hover:bg-slate-50 px-2 py-2 transition-colors"
          >
            {dict.contact}
          </Link>
          <div className="pt-2">
            <Link
              href={`/${currentLocale}/courses`}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-blue-900 hover:bg-blue-800 text-white font-medium px-4 py-2 text-xs uppercase tracking-wider transition-colors rounded-xs shadow-xs"
            >
              Enroll
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
