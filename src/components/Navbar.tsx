"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useState } from "react";
import { Home, BookOpen, User, PhoneCall, Info, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AccessibilityMenu } from "./AccessibilityMenu";
import { NavDict, AccessibilityDict } from "@/dictionaries/types";

interface NavbarProps {
  dict: NavDict;
  accessDict: AccessibilityDict;
  currentLocale: string;
}

export function Navbar({ dict, accessDict, currentLocale }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-navbar-bg/95 backdrop-blur-md text-foreground shadow-xs border-b border-primary/10">
      <div className="w-full flex items-center justify-between">
        {/* ================= LEFT SECTION: FLUSH EDGE LOGO ================= */}
        <Link
          href={`/${currentLocale}`}
          className="shrink-0 flex items-center group focus:outline-none"
        >
          <div
            className="bg-gradient-to-r from-navbar-brand-start via-navbar-brand-mid to-navbar-brand-end pl-6 pr-24 pt-3.5 pb-3.5 shadow-md border-t border-r border-white/10 transition-all duration-300 group-hover:from-navbar-brand-mid group-hover:to-primary"
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 82% 100%, 0% 100%)",
            }}
          >
            <NextImage
              src="/company/logo-text-white.svg"
              alt="LMC Management Consultancy Logo"
              width={60}
              height={60}
              className="h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-sm"
              priority
            />
          </div>
        </Link>

        {/* ================= RIGHT SECTION: NAVIGATION & UTILITIES ================= */}
        <div className="flex-1 flex flex-col justify-center pr-4 md:pr-8 pl-6 max-w-7xl">
          {/* TOP ROW: Utilities (Accessibility, Language, Enroll) */}
          <div className="hidden md:flex items-center justify-end space-x-4 py-1.5 border-b border-primary/10 text-xs">
            <AccessibilityMenu accessDict={accessDict} />
            <span className="h-3 w-px bg-primary/20" />
            <LanguageSwitcher currentLocale={currentLocale} />
            <span className="h-3 w-px bg-primary/20" />
            <Link
              href={`/${currentLocale}/courses`}
              className="no-scale bg-accent hover:bg-navbar-accent-hover text-accent-foreground font-bold px-3 py-1 text-xs uppercase tracking-wider transition-colors rounded-xs shadow-xs"
            >
              Enroll
            </Link>
          </div>

          {/* LOWER ROW: Main Navigation Links */}
          <div className="hidden md:flex items-center justify-end space-x-8 py-2 text-xs font-semibold uppercase tracking-wider text-secondary">
            <Link
              href={`/${currentLocale}`}
              className="hover:text-primary flex items-center transition-colors py-1 border-b-2 border-transparent hover:border-accent"
            >
              <Home className="w-3.5 h-3.5 mr-1.5 text-secondary/70" />
              {dict.home || "Home"}
            </Link>
            <Link
              href={`/${currentLocale}/courses`}
              className="hover:text-primary flex items-center transition-colors py-1 border-b-2 border-transparent hover:border-accent"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-secondary/70" />
              {dict.courses}
            </Link>
            <Link
              href={`/${currentLocale}/portal`}
              className="hover:text-primary flex items-center transition-colors py-1 border-b-2 border-transparent hover:border-accent"
            >
              <User className="w-3.5 h-3.5 mr-1.5 text-secondary/70" />
              {dict.portal}
            </Link>
            <Link
              href={`/${currentLocale}/about`}
              className="hover:text-primary flex items-center transition-colors py-1 border-b-2 border-transparent hover:border-accent"
            >
              <Info className="w-3.5 h-3.5 mr-1.5 text-secondary/70" />
              {dict.about}
            </Link>
            <Link
              href={`/${currentLocale}/contact`}
              className="hover:text-primary flex items-center transition-colors py-1 border-b-2 border-transparent hover:border-accent"
            >
              <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-secondary/70" />
              {dict.contact}
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center justify-end py-3">
            <button
              className="text-primary p-1.5 hover:text-accent transition-colors"
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
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary/10 bg-navbar-bg px-4 py-3 space-y-2 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-primary/10">
            <AccessibilityMenu accessDict={accessDict} />
            <LanguageSwitcher currentLocale={currentLocale} />
          </div>
          <Link
            href={`/${currentLocale}`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary hover:bg-primary/5 px-2 py-2 border-b border-primary/5 transition-colors"
          >
            {dict.home || "Home"}
          </Link>
          <Link
            href={`/${currentLocale}/courses`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary hover:bg-primary/5 px-2 py-2 border-b border-primary/5 transition-colors"
          >
            {dict.courses}
          </Link>
          <Link
            href={`/${currentLocale}/portal`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary hover:bg-primary/5 px-2 py-2 border-b border-primary/5 transition-colors"
          >
            {dict.portal}
          </Link>
          <Link
            href={`/${currentLocale}/about`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary hover:bg-primary/5 px-2 py-2 border-b border-primary/5 transition-colors"
          >
            {dict.about}
          </Link>
          <Link
            href={`/${currentLocale}/contact`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-secondary hover:text-primary hover:bg-primary/5 px-2 py-2 transition-colors"
          >
            {dict.contact}
          </Link>
          <div className="pt-2">
            <Link
              href={`/${currentLocale}/courses`}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-accent hover:bg-navbar-accent-hover text-accent-foreground font-bold px-4 py-2 text-xs uppercase tracking-wider transition-colors rounded-xs shadow-xs"
            >
              Enroll
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
