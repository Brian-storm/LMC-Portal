"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Building2,
  BookOpen,
  Info,
  PhoneCall,
  User,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full border-b border-slate-200 bg-white sticky top-0 z-50">
      {/* Top Bar: Institutional Sub-header */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Accredited HK CPD Provider
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline">
              Hong Kong Management & Compliance Advisory
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/faq" className="hover:text-white transition-colors">
              FAQ
            </Link>
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="bg-slate-900 text-white p-2 font-bold font-serif text-lg tracking-wider">
            LMC
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-slate-900 text-base leading-none tracking-tight">
              LMC Consultancy
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-sans pt-0.5">
              Management & CPD Training
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <Link
            href="/courses"
            className="hover:text-slate-900 flex items-center transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            CPD Courses
          </Link>
          <Link
            href="/about"
            className="hover:text-slate-900 flex items-center transition-colors"
          >
            <Info className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            About LMC
          </Link>
          <Link
            href="/contact"
            className="hover:text-slate-900 flex items-center transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Contact
          </Link>
        </nav>

        {/* Right Action Area */}
        <div className="hidden md:flex items-center space-x-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-none text-xs border-slate-300 text-slate-800"
              >
                <User className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                Portal Access{" "}
                <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-none w-48 border-slate-200"
            >
              <DropdownMenuItem asChild>
                <Link href="/portal" className="text-xs cursor-pointer">
                  <FileCheck className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Student Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/portal/admin" className="text-xs cursor-pointer">
                  <Building2 className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Admin Control Panel
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            asChild
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-none text-xs uppercase tracking-wider"
          >
            <Link href="/courses">Enroll Now</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="md:hidden text-slate-700 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 pt-4 pb-6 space-y-3">
          <Link
            href="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-800 py-2 border-b border-slate-200"
          >
            CPD Courses
          </Link>
          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-800 py-2 border-b border-slate-200"
          >
            About LMC
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-800 py-2 border-b border-slate-200"
          >
            Contact Us
          </Link>
          <div className="pt-2 space-y-2">
            <Button
              asChild
              variant="outline"
              className="w-full rounded-none text-xs"
            >
              <Link href="/portal" onClick={() => setMobileMenuOpen(false)}>
                Portal Access
              </Link>
            </Button>
            <Button
              asChild
              className="w-full bg-slate-900 text-white rounded-none text-xs"
            >
              <Link href="/courses" onClick={() => setMobileMenuOpen(false)}>
                Enroll Now
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
