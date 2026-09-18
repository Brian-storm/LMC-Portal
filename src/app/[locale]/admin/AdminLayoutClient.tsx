"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const closeSidebar = () => setSidebarOpen(false);

  const isActive = (href: string) => {
    if (href === "") return pathname === `/${locale}/admin`;
    return pathname.startsWith(`/${locale}/admin${href}`);
  };

  return (
    <div className="min-h-screen bg-[#f2f6f3] flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar — drawer on mobile, persistent on desktop */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-56 bg-primary-deep text-emerald-100 flex flex-col transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:shrink-0`}
      >
        {/* Brand */}
        <div className="px-4 py-5 border-b border-emerald-800">
          <Link href={`/${locale}/admin`} className="block" onClick={closeSidebar}>
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
                onClick={closeSidebar}
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
            onClick={() => { handleSignOut(); closeSidebar(); }}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-emerald-300 hover:text-white hover:bg-emerald-800/50 rounded-xs transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{dict.signOut}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto min-h-screen">
        {/* Mobile hamburger toggle */}
        <div className="md:hidden flex items-center p-3 border-b border-slate-200 bg-white sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 text-slate-700 hover:text-primary transition-colors rounded-xs hover:bg-slate-100"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="ml-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            LMC Admin
          </span>
        </div>
        {children}
      </main>
    </div>
  );
}