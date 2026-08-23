"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, User, PhoneCall, Info, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AccessibilityMenu } from "./AccessibilityMenu";

interface NavbarProps {
  dict: {
    brandSubtitle: string;
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
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
        {/* Brand / Logo - Locked against global text scaling */}
        <Link
          href={`/${currentLocale}`}
          className="flex items-center space-x-3 shrink-0"
        >
          <div
            className="bg-white text-slate-950 px-2.5 py-1 font-bold font-serif text-lg tracking-wider"
            style={{ fontSize: "18px", lineHeight: "28px" }}
          >
            LMC
          </div>
          <div className="hidden lg:flex flex-col">
            <span
              className="font-serif font-bold text-base leading-none tracking-tight"
              style={{ fontSize: "16px", lineHeight: "1" }}
            >
              LMC Consultancy
            </span>
            <span
              className="text-[9px] text-slate-400 uppercase tracking-widest pt-0.5"
              style={{ fontSize: "9px" }}
            >
              {dict.brandSubtitle}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Link
            href={`/${currentLocale}/courses`}
            className="hover:text-white flex items-center transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {dict.courses}
          </Link>
          <Link
            href={`/${currentLocale}/portal`}
            className="hover:text-white flex items-center transition-colors"
          >
            <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {dict.portal}
          </Link>
          <Link
            href={`/${currentLocale}/about`}
            className="hover:text-white flex items-center transition-colors"
          >
            <Info className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {dict.about}
          </Link>
          <Link
            href={`/${currentLocale}/contact`}
            className="hover:text-white flex items-center transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            {dict.contact}
          </Link>
        </nav>

        {/* Right Utilities: Accessibility Popover + Language Switcher + CTA */}
        <div className="hidden md:flex items-center space-x-3">
          <AccessibilityMenu accessDict={accessDict} />
          <LanguageSwitcher currentLocale={currentLocale} />
          <Link
            href={`/${currentLocale}/courses`}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3.5 py-1.5 text-xs uppercase tracking-wider transition-colors rounded-sm"
          >
            Enroll
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center space-x-2 md:hidden">
          <AccessibilityMenu accessDict={accessDict} />
          <LanguageSwitcher currentLocale={currentLocale} />
          <button
            className="text-slate-300 p-1.5"
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
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2">
          <Link
            href={`/${currentLocale}/courses`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-200 py-2 border-b border-slate-800"
          >
            {dict.courses}
          </Link>
          <Link
            href={`/${currentLocale}/portal`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-200 py-2 border-b border-slate-800"
          >
            {dict.portal}
          </Link>
          <Link
            href={`/${currentLocale}/about`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-200 py-2 border-b border-slate-800"
          >
            {dict.about}
          </Link>
          <Link
            href={`/${currentLocale}/contact`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-200 py-2 border-b border-slate-800"
          >
            {dict.contact}
          </Link>
        </div>
      )}
    </header>
  );
}
