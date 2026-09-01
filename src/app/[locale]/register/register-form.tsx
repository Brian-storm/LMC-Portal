"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Mail,
  Lock,
  User,
  Phone,
  FileText,
  Building,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { RegisterPageDict } from "@/dictionaries/types";

type FieldErrors = Record<string, string[]>;

interface RegisterFormProps {
  locale: string;
  dict: RegisterPageDict;
}

const inputClass =
  "w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xs focus:outline-none focus:border-[#1b4332] focus:bg-white font-mono";
const inputClassNoIcon =
  "w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xs focus:outline-none focus:border-[#1b4332] focus:bg-white font-mono";
const iconClass = "w-4 h-4 text-slate-400 absolute left-3 top-2.5";
const labelClass =
  "block text-xs font-bold uppercase tracking-wider text-slate-700";

function FieldRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-2 ${className ?? ""}`}>{children}</div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11px] text-red-600 mt-0.5">{message}</p>;
}

export function RegisterForm({ locale, dict }: RegisterFormProps) {
  const router = useRouter();

  const [nameZh, setNameZh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [idDocNumber, setIdDocNumber] = useState("");
  const [iaLicense, setIaLicense] = useState("");
  const [organization, setOrganization] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameZh,
          nameEn,
          email,
          password,
          phone,
          idDocNumber,
          iaLicense: iaLicense || undefined,
          organization: organization || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.details) {
          setFieldErrors(data.details);
        } else {
          setError(data.error ?? dict.errorRegistrationFailed);
        }
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError(dict.errorUnexpected);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#f6f8f6] text-slate-800 min-h-screen flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center p-2 bg-white border border-slate-300 shadow-2xs text-[#1b4332] rounded-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-serif font-bold text-[#1b4332] tracking-tight">
              {dict.pageTitle}
            </h1>
          </div>

          <div className="bg-white border border-slate-300 shadow-2xs border-t-4 border-t-emerald-600 p-5 sm:p-6 space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">
              {dict.successTitle}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {dict.successMessage}
            </p>
            <button
              onClick={() => router.push(`/${locale}/login`)}
              className="inline-flex items-center space-x-2 bg-[#1b4332] hover:bg-[#112a1f] text-white text-xs font-bold uppercase tracking-wider py-2 px-6 rounded-xs transition-colors shadow-2xs"
            >
              <span>{dict.successButton}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg space-y-3">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center p-2 bg-white border border-slate-300 shadow-2xs text-[#1b4332] rounded-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-serif font-bold text-[#1b4332] tracking-tight">
            {dict.pageTitle}
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            {dict.pageSubtitle}
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
            <FieldRow>
              <div className="space-y-1">
                <label className={labelClass}>{dict.nameZhLabel}</label>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    type="text"
                    required
                    value={nameZh}
                    onChange={(e) => setNameZh(e.target.value)}
                    className={inputClass}
                    placeholder={dict.nameZhPlaceholder}
                  />
                </div>
                <FieldError message={fieldErrors.nameZh?.[0]} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{dict.nameEnLabel}</label>
                <div className="relative">
                  <User className={iconClass} />
                  <input
                    type="text"
                    required
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className={inputClass}
                    placeholder={dict.nameEnPlaceholder}
                  />
                </div>
                <FieldError message={fieldErrors.nameEn?.[0]} />
              </div>
            </FieldRow>

            <div className="space-y-1">
              <label className={labelClass}>{dict.emailLabel}</label>
              <div className="relative">
                <Mail className={iconClass} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder={dict.emailPlaceholder}
                />
              </div>
              <FieldError message={fieldErrors.email?.[0]} />
            </div>

            <div className="space-y-1">
              <label className={labelClass}>{dict.passwordLabel}</label>
              <div className="relative">
                <Lock className={iconClass} />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  placeholder={dict.passwordPlaceholder}
                />
              </div>
              <FieldError message={fieldErrors.password?.[0]} />
            </div>

            <FieldRow>
              <div className="space-y-1">
                <label className={labelClass}>{dict.phoneLabel}</label>
                <div className="relative">
                  <Phone className={iconClass} />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder={dict.phonePlaceholder}
                  />
                </div>
                <FieldError message={fieldErrors.phone?.[0]} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>{dict.idDocLabel}</label>
                <div className="relative">
                  <FileText className={iconClass} />
                  <input
                    type="text"
                    required
                    value={idDocNumber}
                    onChange={(e) => setIdDocNumber(e.target.value)}
                    className={inputClass}
                    placeholder={dict.idDocPlaceholder}
                  />
                </div>
                <FieldError message={fieldErrors.idDocNumber?.[0]} />
              </div>
            </FieldRow>

            <FieldRow>
              <div className="space-y-1">
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {dict.iaLicenseLabel}
                  </span>
                </label>
                <input
                  type="text"
                  value={iaLicense}
                  onChange={(e) => setIaLicense(e.target.value)}
                  className={inputClassNoIcon}
                  placeholder={dict.iaLicensePlaceholder}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>
                  <span className="inline-flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {dict.orgLabel}
                  </span>
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className={inputClassNoIcon}
                  placeholder={dict.orgPlaceholder}
                />
              </div>
            </FieldRow>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center space-x-2 bg-[#1b4332] hover:bg-[#112a1f] text-white text-xs font-bold uppercase tracking-wider py-2 rounded-xs transition-colors shadow-2xs disabled:opacity-50"
            >
              {isLoading ? (
                <span>{dict.submittingButton}</span>
              ) : (
                <>
                  <span>{dict.submitButton}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            {dict.loginPrompt}{" "}
            <Link
              href={`/${locale}/login`}
              className="text-[#1b4332] hover:underline font-medium"
            >
              {dict.loginLink}
            </Link>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-400 font-mono">
          <span>{dict.footerText}</span>
        </div>
      </div>
    </div>
  );
}