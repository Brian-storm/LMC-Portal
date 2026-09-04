"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  Menu,
  X,
  ShieldCheck,
  Globe,
  CheckCircle2,
} from "lucide-react";

// A: Course with LHS lining
export function StyledComponent() {
  return (
    <div className="bg-white border border-slate-200 border-l-4 border-l-blue-900 p-6 shadow-2xs hover:border-l-blue-700 hover:shadow-md transition-all">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-50 text-blue-900 rounded-xs">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="font-serif font-bold text-slate-900">
          Professional Courses
        </h3>
      </div>
      {/* Content */}
    </div>
  );
}

// B: Navbar - Executive Heritage (Navy & Warm Gold)
export function ExecutiveNavbar({
  currentLocale = "en",
}: {
  currentLocale?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950 text-slate-100 border-b border-amber-600/40 shadow-md">
      {/* Top Utility Bar - Accreditation & Trust */}
      <div className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 py-1.5 px-4">
        <div className="container mx-auto max-w-7xl flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span className="tracking-wide">
              Accredited Institutional CPD Provider
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-4 tracking-wider uppercase text-[10px]">
            <span>Member Portal Access</span>
            <span className="text-slate-700">|</span>
            <span>HK SAR Governance Standard</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href={`/${currentLocale}`}
          className="flex items-center space-x-3.5 group"
        >
          <div className="bg-amber-600 text-slate-950 px-2.5 py-1 font-bold font-serif text-lg tracking-wider rounded-none group-hover:bg-amber-500 transition-colors">
            LMC
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-base tracking-tight text-slate-50 leading-tight">
              LMC Management Consultancy
            </span>
            <span className="text-[9px] text-amber-400/90 uppercase tracking-widest font-semibold pt-0.5">
              Continuous Professional Development
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-7 text-xs font-semibold uppercase tracking-wider text-slate-300">
          <Link
            href={`/${currentLocale}`}
            className="hover:text-amber-400 py-1 transition-colors border-b border-transparent hover:border-amber-400"
          >
            Home
          </Link>
          <Link
            href={`/${currentLocale}/courses`}
            className="hover:text-amber-400 py-1 transition-colors border-b border-transparent hover:border-amber-400"
          >
            Courses
          </Link>
          <Link
            href={`/${currentLocale}/portal`}
            className="hover:text-amber-400 py-1 transition-colors border-b border-transparent hover:border-amber-400"
          >
            Client Portal
          </Link>
          <Link
            href={`/${currentLocale}/about`}
            className="hover:text-amber-400 py-1 transition-colors border-b border-transparent hover:border-amber-400"
          >
            About Us
          </Link>
          <Link
            href={`/${currentLocale}/contact`}
            className="hover:text-amber-400 py-1 transition-colors border-b border-transparent hover:border-amber-400"
          >
            Contact
          </Link>
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            href={`/${currentLocale}/courses`}
            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 text-xs uppercase tracking-wider transition-colors rounded-none shadow-xs"
          >
            Enroll Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-200 p-1.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
    </header>
  );
}

// B: Navbar - Modern Civic & Academic (Oxford Blue & Ice Blue)
export function CivicAcademicNavbar({
  currentLocale = "en",
}: {
  currentLocale?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900 shadow-xs">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href={`/${currentLocale}`}
          className="flex items-center space-x-3 shrink-0 group"
        >
          <div className="bg-blue-900 text-white px-3 py-1 font-extrabold text-base tracking-widest rounded-xs transition-colors group-hover:bg-sky-600">
            LMC
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="font-bold text-sm tracking-tight text-slate-900">
              LMC Management Consultancy
            </span>
            <span className="text-[10px] text-sky-700 uppercase tracking-widest font-semibold pt-0.5">
              Institute of Executive Education
            </span>
          </div>
        </Link>

        {/* Center Pill Navigation */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xs border border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <Link
            href={`/${currentLocale}`}
            className="px-3 py-1.5 rounded-xs hover:bg-white hover:text-blue-900 hover:shadow-2xs transition-all"
          >
            Home
          </Link>
          <Link
            href={`/${currentLocale}/courses`}
            className="px-3 py-1.5 rounded-xs hover:bg-white hover:text-blue-900 hover:shadow-2xs transition-all"
          >
            Courses
          </Link>
          <Link
            href={`/${currentLocale}/portal`}
            className="px-3 py-1.5 rounded-xs hover:bg-white hover:text-blue-900 hover:shadow-2xs transition-all"
          >
            Portal
          </Link>
          <Link
            href={`/${currentLocale}/about`}
            className="px-3 py-1.5 rounded-xs hover:bg-white hover:text-blue-900 hover:shadow-2xs transition-all"
          >
            About
          </Link>
          <Link
            href={`/${currentLocale}/contact`}
            className="px-3 py-1.5 rounded-xs hover:bg-white hover:text-blue-900 hover:shadow-2xs transition-all"
          >
            Contact
          </Link>
        </nav>

        {/* Utility & CTA */}
        <div className="hidden md:flex items-center space-x-3">
          <button className="flex items-center space-x-1 text-xs text-slate-600 hover:text-blue-900 px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="uppercase font-semibold text-[11px]">EN</span>
          </button>
          <Link
            href={`/${currentLocale}/courses`}
            className="bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-1.5 text-xs uppercase tracking-wider transition-colors rounded-xs shadow-2xs"
          >
            Course Catalog
          </Link>
        </div>

        {/* Mobile Controls */}
        <button
          className="md:hidden text-slate-700 p-1.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
    </header>
  );
}

// B: Navbar - Regulatory & Governance (Deep Emerald & Warm Sand)
export function RegulatoryNavbar({
  currentLocale = "en",
}: {
  currentLocale?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-stone-900 border-b-2 border-emerald-600 text-stone-100 shadow-md">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href={`/${currentLocale}`}
          className="flex items-center space-x-3 shrink-0 group"
        >
          <div className="w-9 h-9 bg-emerald-800 text-stone-100 flex items-center justify-center font-bold text-sm tracking-wider rounded-xs border border-emerald-500/40 group-hover:bg-emerald-700 transition-colors">
            LMC
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-base tracking-tight text-stone-100">
              LMC Management Consultancy
            </span>
            <div className="flex items-center space-x-1.5 pt-0.5">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-[9px] text-stone-400 uppercase tracking-widest font-medium">
                Regulatory & Compliance Standards
              </span>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-medium uppercase tracking-widest text-stone-300">
          <Link
            href={`/${currentLocale}`}
            className="hover:text-emerald-400 transition-colors py-1"
          >
            Home
          </Link>
          <Link
            href={`/${currentLocale}/courses`}
            className="hover:text-emerald-400 transition-colors py-1"
          >
            Compliance Catalog
          </Link>
          <Link
            href={`/${currentLocale}/portal`}
            className="hover:text-emerald-400 transition-colors py-1"
          >
            Client Portal
          </Link>
          <Link
            href={`/${currentLocale}/about`}
            className="hover:text-emerald-400 transition-colors py-1"
          >
            Governance
          </Link>
          <Link
            href={`/${currentLocale}/contact`}
            className="hover:text-emerald-400 transition-colors py-1"
          >
            Contact
          </Link>
        </nav>

        {/* Call to Action */}
        <div className="hidden md:flex items-center space-x-3">
          <Link
            href={`/${currentLocale}/portal`}
            className="border border-emerald-500/60 text-emerald-300 hover:bg-emerald-950/80 px-3.5 py-1.5 text-xs uppercase tracking-wider font-semibold transition-colors rounded-xs"
          >
            Client Access
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-stone-200 p-1.5"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
    </header>
  );
}