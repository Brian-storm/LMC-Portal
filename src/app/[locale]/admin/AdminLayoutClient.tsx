"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import type { AdminDict } from "@/dictionaries/types";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  locale: string;
  dict: AdminDict;
}

const NAV_ITEMS = [
  { key: "dashboard", href: "", icon: LayoutDashboard },
  { key: "enrolments", href: "/enrolments", icon: ClipboardList },
  { key: "courses", href: "/courses", icon: BookOpen },
  { key: "users", href: "/users", icon: Users },
] as const;

export function AdminLayoutClient({ children, locale, dict }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto-close mobile sidebar when window resizes past lg breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      // Hard redirect to clear Next.js client cache and prevent stale session on back button
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/${locale}/login`;
    }
  };

  const isActive = (href: string) => {
    if (href === "") return pathname === `/${locale}/admin`;
    return pathname.startsWith(`/${locale}/admin${href}`);
  };

  return (
    <div className="min-h-screen bg-[#f2f6f3] flex">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-30
          h-screen bg-primary-deep text-emerald-100 flex flex-col shrink-0
          transition-transform duration-200 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-56
        `}
      >
        {/* Brand */}
        <div className="px-4 py-5 border-b border-emerald-800">
          <Link href={`/${locale}/admin`} className="block">
            <div className="text-xs font-bold tracking-wider text-emerald-300 uppercase">
              LMC Admin
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">
              CPD Compliance Portal
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.key}
                href={`/${locale}/admin${item.href}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-xs transition-colors ${
                  active
                    ? "bg-emerald-800 text-white"
                    : "text-emerald-200 hover:bg-emerald-800/50 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{dict[item.key as keyof AdminDict] as string ?? item.key}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="px-2 pb-4">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-emerald-300 hover:text-white hover:bg-emerald-800/50 rounded-xs transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{dict.signOut}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile hamburger button — visible below lg */}
        <div className="flex lg:hidden items-center px-4 py-2 border-b border-slate-200 bg-white sticky top-0 z-20">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-md"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
          <span className="ml-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Admin Menu
          </span>
        </div>
        {children}
      </main>
    </div>
  );
}