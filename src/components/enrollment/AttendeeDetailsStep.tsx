"use client";

import { AlertCircle, Building2, ChevronRight, User, Users } from "lucide-react";
import type { Session } from "next-auth";
import type { EnrollPageDict } from "@/dictionaries/types";
import { IdentityDocumentSection } from "./IdentityDocumentSection";

interface AttendeeDetailsStepProps {
  formData: {
    fullName: string;
    nameZh: string;
    email: string;
    phone: string;
    company: string;
    iaLicenseNo: string;
  };
  fieldErrors: Record<string, string>;
  enrollmentType: "INDIVIDUAL" | "ORGANIZATION";
  session: Session | null;
  dict: EnrollPageDict;
  locale: string;
  step1Valid: boolean;

  // Identity document state
  idDocType: "HKID" | "PASSPORT" | "PERMIT" | "OTHER";
  hkidNumber: string;
  passportNumber: string;
  permitNumber: string;
  otherIdDocVal: string;

  // Callbacks
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidateField: (name: string, value: string) => void;
  onEnrollmentTypeChange: (type: "INDIVIDUAL" | "ORGANIZATION") => void;
  onIdDocTypeChange: (type: "HKID" | "PASSPORT" | "PERMIT" | "OTHER") => void;
  onHkidChange: (val: string) => void;
  onPassportChange: (val: string) => void;
  onPermitChange: (val: string) => void;
  onOtherIdChange: (val: string) => void;
  onProceed: () => void;
}

export function AttendeeDetailsStep({
  formData,
  fieldErrors,
  enrollmentType,
  session,
  dict,
  locale,
  step1Valid,
  idDocType,
  hkidNumber,
  passportNumber,
  permitNumber,
  otherIdDocVal,
  onInputChange,
  onValidateField,
  onEnrollmentTypeChange,
  onIdDocTypeChange,
  onHkidChange,
  onPassportChange,
  onPermitChange,
  onOtherIdChange,
  onProceed,
}: AttendeeDetailsStepProps) {
  return (
    <div className="space-y-4">
      {/* Enrollment Type Toggle */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
          <Users className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
          {dict.formLabels.enrollmentType}
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => onEnrollmentTypeChange("INDIVIDUAL")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xs border transition-colors ${
              enrollmentType === "INDIVIDUAL"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
            }`}
          >
            <User className="w-3.5 h-3.5 inline mr-1" />
            {dict.formLabels.individual}
          </button>
          <button
            type="button"
            onClick={() => onEnrollmentTypeChange("ORGANIZATION")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-xs border transition-colors ${
              enrollmentType === "ORGANIZATION"
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 inline mr-1" />
            {dict.formLabels.organization}
          </button>
        </div>
      </div>

      {/* Individual attendee form */}
      {enrollmentType === "INDIVIDUAL" && (
        <>
          {/* Section heading */}
          <div className="pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{dict.formLabels.attendeeInfo}</span>
            </h2>
          </div>

          {/* Form fields grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700 block">
                {dict.formLabels.fullName} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                disabled={!!session?.user}
                onChange={onInputChange}
                onBlur={(e) => onValidateField("fullName", e.target.value)}
                placeholder={dict.formLabels.fullNamePlaceholder}
                className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
                  fieldErrors.fullName ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-primary"
                } ${session?.user ? "opacity-60 cursor-not-allowed" : ""}`}
              />
              {session?.user && (
                <p className="text-[10px] text-slate-400">{dict.formLabels.lockedToAccount}</p>
              )}
              {fieldErrors.fullName && (
                <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.fullName}</span>
                </p>
              )}
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold text-slate-700 block">
                {dict.formLabels.chineseName}
              </label>
              <input
                type="text"
                name="nameZh"
                value={formData.nameZh}
                disabled={!!session?.user}
                onChange={onInputChange}
                placeholder={dict.formLabels.chineseNamePlaceholder}
                className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
                  session?.user ? "opacity-60 cursor-not-allowed" : "border-slate-300 focus:border-primary"
                }`}
              />
              {session?.user && (
                <p className="text-[10px] text-slate-400">{dict.formLabels.lockedToAccount}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                {dict.formLabels.email} <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                disabled={!!session?.user}
                onChange={onInputChange}
                onBlur={(e) => onValidateField("email", e.target.value)}
                placeholder={dict.formLabels.emailPlaceholder}
                className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
                  fieldErrors.email ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-primary"
                } ${session?.user ? "opacity-60 cursor-not-allowed" : ""}`}
              />
              {session?.user && (
                <p className="text-[10px] text-slate-400">{dict.formLabels.lockedToAccount}</p>
              )}
              {fieldErrors.email && (
                <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                {dict.formLabels.phone} <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={onInputChange}
                onBlur={(e) => onValidateField("phone", e.target.value)}
                placeholder={dict.formLabels.phonePlaceholder}
                className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
                  fieldErrors.phone ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-primary"
                }`}
              />
              {fieldErrors.phone && (
                <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.phone}</span>
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">{dict.formLabels.company}</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={onInputChange}
                placeholder={dict.formLabels.companyPlaceholder}
                className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                {dict.formLabels.iaLicense} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="iaLicenseNo"
                required
                value={formData.iaLicenseNo}
                onChange={onInputChange}
                onBlur={(e) => onValidateField("iaLicenseNo", e.target.value)}
                placeholder={dict.formLabels.iaLicensePlaceholder}
                className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
                  fieldErrors.iaLicenseNo ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-primary"
                }`}
              />
              {fieldErrors.iaLicenseNo && (
                <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{fieldErrors.iaLicenseNo}</span>
                </p>
              )}
            </div>

            {/* Identity Document Section */}
            <IdentityDocumentSection
              idDocType={idDocType}
              hkidNumber={hkidNumber}
              passportNumber={passportNumber}
              permitNumber={permitNumber}
              otherIdDocVal={otherIdDocVal}
              fieldErrors={fieldErrors}
              dict={dict}
              onIdDocTypeChange={onIdDocTypeChange}
              onHkidChange={onHkidChange}
              onPassportChange={onPassportChange}
              onPermitChange={onPermitChange}
              onOtherIdChange={onOtherIdChange}
              onValidateField={onValidateField}
            />
          </div>
        </>
      )}

      {/* Organization blocked notice */}
      {enrollmentType === "ORGANIZATION" && (
        <div className="pt-2 border-t border-slate-200">
          <div className="bg-amber-50 border border-amber-200 rounded-xs p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">{dict.formLabels.orgBlockedTitle}</h3>
              </div>
            </div>
            <div className="text-xs text-amber-800 space-y-1">
              <p><span className="font-bold">{dict.formLabels.orgContactLabel}:</span> Mr. Anthony Yuen{locale === "en" ? "" : " 阮德添"}</p>
              <p><span className="font-bold">{dict.formLabels.orgContactEmail}:</span> <a href="mailto:yuentaktim@outlook.com" className="underline hover:text-amber-900">yuentaktim@outlook.com</a></p>
              <p><span className="font-bold">{dict.formLabels.orgContactMobile}:</span> <a href="https://wa.me/85260302488" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">(852) 60302488</a></p>
            </div>
          </div>
        </div>
      )}

      {/* Proceed button */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={!step1Valid}
          onClick={onProceed}
          className="btn-primary-outline inline-flex items-center space-x-1.5 px-4 py-2 text-xs"
        >
          <span>{dict.navigation.proceedToSchedule}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}