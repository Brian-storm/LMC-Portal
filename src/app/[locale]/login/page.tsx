"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale = (params.locale as string) || "en";
  const redirectPath = searchParams.get("from");

  // Form State
  const [role, setRole] = useState<"learner" | "admin">("learner");
  const [email, setEmail] = useState("taiman.chan@prudential.com.hk");
  const [password, setPassword] = useState("••••••••••••");
  const [isLoading, setIsLoading] = useState(false);

  // Quick Demo Autofill Switcher
  const handleRoleSwitch = (selectedRole: "learner" | "admin") => {
    setRole(selectedRole);
    if (selectedRole === "learner") {
      setEmail("taiman.chan@prudential.com.hk");
      setPassword("demo1234");
    } else {
      setEmail("compliance.admin@institution.edu.hk");
      setPassword("admin1234");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate Auth Session Cookie Setting & Redirect
    setTimeout(() => {
      // Set dummy session cookie for demo authentication
      document.cookie = `session_token=demo_token_${role}; path=/; max-age=86400`;

      if (redirectPath) {
        router.push(redirectPath);
      } else {
        const destination =
          role === "admin" ? `/${locale}/admin` : `/${locale}/dashboard`;
        router.push(destination);
      }
    }, 600);
  };

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4">
        {/* Institutional Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-white border border-slate-300 shadow-2xs text-[#1b4332] rounded-xs mb-1">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#1b4332] tracking-tight">
            CPD Portal Portal Access
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Continuing Professional Development & Compliance Licensing System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-300 shadow-2xs border-t-4 border-t-[#1b4332] p-6 sm:p-8 space-y-6">
          {/* Demo Role Switcher Tabs */}
          <div className="bg-slate-100 p-1 rounded-xs border border-slate-200 grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleRoleSwitch("learner")}
              className={`py-2 px-3 rounded-2xs text-center transition-all ${
                role === "learner"
                  ? "bg-white text-[#1b4332] shadow-2xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Learner Portal
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch("admin")}
              className={`py-2 px-3 rounded-2xs text-center transition-all ${
                role === "admin"
                  ? "bg-white text-[#1b4332] shadow-2xs border border-slate-200"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Admin Portal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Institutional Email / ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xs focus:outline-none focus:border-[#1b4332] focus:bg-white font-mono"
                  placeholder="name@organization.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "Demo mode: Use any password or click the demo switcher above.",
                    );
                  }}
                  className="text-[11px] text-[#1b4332] hover:underline font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xs focus:outline-none focus:border-[#1b4332] focus:bg-white font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center space-x-2 bg-[#1b4332] hover:bg-[#112a1f] text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xs transition-colors shadow-2xs mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>
                    Sign In as{" "}
                    {role === "admin" ? "Compliance Admin" : "Learner"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Info Callout */}
          <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-xs text-xs space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-[#1b4332]">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Demo Notice</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Clicking <strong>Sign In</strong> will save a mock session cookie
              (<code>session_token</code>) and redirect you straight to the{" "}
              {role === "admin" ? "Admin" : "Learner"} dashboard.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 font-mono">
          <span>IA & HKIB Accredited CPD Management System</span>
        </div>
      </div>
    </div>
  );
}
