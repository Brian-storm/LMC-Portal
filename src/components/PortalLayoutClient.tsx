"use client";

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { NavDict } from "@/dictionaries/types";

interface PortalLayoutClientProps {
  locale: string;
  dict: NavDict;
  children: ReactNode;
}

export function PortalLayoutClient({ locale, dict, children }: PortalLayoutClientProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { addToast } = useToast();

  const user = session?.user;
  const userName = user?.name ?? "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const userOrg = (user as { organization?: string | null })?.organization ?? "";

  const navItems = [
    { label: "Dashboard", href: `/${locale}/dashboard`, icon: LayoutDashboard },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: `/${locale}/login` });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] text-slate-700">
      {/* 1. Portal Sub-Bar: Positioned sticky directly beneath the top Navbar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 h-[var(--subbar-height)] shrink-0 sticky top-[var(--navbar-height)] z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-md"
          >
            {isMobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>

          <div className="flex items-center space-x-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-mono text-xs text-slate-600 font-medium truncate">
              IA & HKIB CPD Compliance Verification Active
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => addToast({ title: "No new notifications.", variant: "info" })}
            className="p-1.5 text-slate-400 hover:text-slate-700 border border-slate-200/70 rounded-md relative bg-slate-50/50"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="text-right hidden sm:block">
            <span className="block text-xs font-semibold text-slate-800 leading-tight">
              {userName}
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              {userOrg}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Layout Container */}
      <div className="flex flex-1 items-start relative min-h-0">
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 top-[calc(var(--navbar-height)+var(--subbar-height))] bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-[calc(var(--navbar-height)+var(--subbar-height))] z-30
            h-[calc(100vh-var(--navbar-height)-var(--subbar-height))] bg-white border-r border-slate-200 
            flex flex-col justify-between transition-all duration-200 ease-in-out shrink-0
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} 
            ${isCollapsed ? "lg:w-16" : "lg:w-60"} w-60
          `}
        >
          <div className="flex flex-col h-full min-h-0">
            {/* User Profile */}
            <div
              className={`p-3 bg-slate-50/80 border-b border-slate-100 shrink-0 ${
                isCollapsed ? "flex flex-col items-center" : "space-y-2"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {userInitials}
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                      {userName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {userOrg}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="p-2.5 space-y-1 flex-1 overflow-y-auto min-h-0">
              {!isCollapsed && (
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Portal Menu
                </div>
              )}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center ${
                      isCollapsed
                        ? "justify-center px-0 py-2.5"
                        : "justify-between px-3 py-2"
                    } text-xs font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? "text-white" : "text-slate-400"
                        }`}
                      />
                      {!isCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isCollapsed && isActive && (
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions / Toggle Footer */}
            <div className="p-2.5 border-t border-slate-100 space-y-1 shrink-0 bg-white">
              <button
                onClick={handleSignOut}
                title={isCollapsed ? dict.signOut : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? "justify-center p-2" : "space-x-2.5 px-3 py-2"
                } text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50/60 rounded-md transition-colors`}
              >
                <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-600 shrink-0" />
                {!isCollapsed && <span>{dict.signOut}</span>}
              </button>

              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex w-full items-center justify-center p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors border-t border-slate-100 pt-2"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <ChevronLeft className="w-4 h-4" />
                    <span>Collapse Menu</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}