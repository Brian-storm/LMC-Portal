"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Building2, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale = (params.locale as string) || "en";
  const redirectPath = searchParams.get("from");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        setIsLoading(false);
        return;
      }

      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push(`/${locale}/dashboard`);
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center p-2 bg-white border border-slate-300 shadow-2xs text-[#1b4332] rounded-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-serif font-bold text-[#1b4332] tracking-tight">
            CPD Portal Access
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Continuing Professional Development & Compliance Licensing System
          </p>
        </div>

        <div className="bg-white border border-slate-300 shadow-2xs border-t-4 border-t-[#1b4332] p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs p-2 rounded-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Institutional Email / ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xs focus:outline-none focus:border-[#1b4332] focus:bg-white font-mono"
                  placeholder="name@organization.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xs focus:outline-none focus:border-[#1b4332] focus:bg-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center space-x-2 bg-[#1b4332] hover:bg-[#112a1f] text-white text-xs font-bold uppercase tracking-wider py-2 rounded-xs transition-colors shadow-2xs disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href={`/${locale}/register`}
              className="text-[#1b4332] hover:underline font-medium"
            >
              Register here
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400 font-mono">
          <span>IA & HKIB Accredited CPD Management System</span>
        </div>
      </div>
    </div>
  );
}