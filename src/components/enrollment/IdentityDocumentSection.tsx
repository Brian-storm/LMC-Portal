"use client";

import { AlertCircle, FileCheck, User } from "lucide-react";
import type { EnrollPageDict } from "@/dictionaries/types";

interface IdentityDocumentSectionProps {
  idDocType: "HKID" | "PASSPORT" | "PERMIT" | "OTHER";
  hkidNumber: string;
  passportNumber: string;
  permitNumber: string;
  otherIdDocVal: string;
  fieldErrors: Record<string, string>;
  dict: EnrollPageDict;
  onIdDocTypeChange: (type: "HKID" | "PASSPORT" | "PERMIT" | "OTHER") => void;
  onHkidChange: (val: string) => void;
  onPassportChange: (val: string) => void;
  onPermitChange: (val: string) => void;
  onOtherIdChange: (val: string) => void;
  onValidateField: (name: string, value: string) => void;
}

export function IdentityDocumentSection({
  idDocType,
  hkidNumber,
  passportNumber,
  permitNumber,
  otherIdDocVal,
  fieldErrors,
  dict,
  onIdDocTypeChange,
  onHkidChange,
  onPassportChange,
  onPermitChange,
  onOtherIdChange,
  onValidateField,
}: IdentityDocumentSectionProps) {
  // Handle type button click — clears errors for all identity fields
  const handleTypeChange = (type: "HKID" | "PASSPORT" | "PERMIT" | "OTHER") => {
    onIdDocTypeChange(type);
  };

  return (
    <div className="sm:col-span-2 pt-2 border-t border-slate-200">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5 mb-2">
        <FileCheck className="w-3.5 h-3.5" />
        <span>{dict.formLabels.idDocType}</span>
      </h3>

      {/* Document type selector buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {(["HKID", "PASSPORT", "PERMIT", "OTHER"] as const).map((type) => {
          const labelKey =
            type === "HKID"
              ? "hkid"
              : type === "PASSPORT"
                ? "passport"
                : type === "PERMIT"
                  ? "permit"
                  : "otherId";
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleTypeChange(type)}
              className={`py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs border transition-colors ${
                idDocType === type
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-slate-600 border-slate-300 hover:bg-slate-100"
              }`}
            >
              {type === "HKID" ? (
                <User className="w-3 h-3 inline mr-1" />
              ) : (
                <FileCheck className="w-3 h-3 inline mr-1" />
              )}
              {dict.formLabels[labelKey as keyof typeof dict.formLabels]}
            </button>
          );
        })}
      </div>

      {/* HKID input */}
      {idDocType === "HKID" && (
        <div className="space-y-1">
          <label className="font-bold text-slate-700 block text-xs">
            {dict.formLabels.hkidNumber} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={hkidNumber}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9A-Za-z]/g, "").toUpperCase().slice(0, 9);
              onHkidChange(val);
              onValidateField("hkidNumber", val);
            }}
            onBlur={(e) => onValidateField("hkidNumber", e.target.value)}
            placeholder={dict.formLabels.hkidPlaceholder}
            maxLength={9}
            className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 font-mono focus:outline-none focus:bg-white ${
              fieldErrors.hkidNumber ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-primary"
            }`}
          />
          {fieldErrors.hkidNumber && (
            <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{fieldErrors.hkidNumber}</span>
            </p>
          )}
        </div>
      )}

      {/* Passport input */}
      {idDocType === "PASSPORT" && (
        <div className="space-y-1">
          <label className="font-bold text-slate-700 block text-xs">
            {dict.formLabels.passportNumber} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={passportNumber}
            onChange={(e) => {
              onPassportChange(e.target.value);
              onValidateField("passportNumber", e.target.value);
            }}
            onBlur={(e) => onValidateField("passportNumber", e.target.value)}
            placeholder={dict.formLabels.passportPlaceholder}
            className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
              fieldErrors.passportNumber ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-primary"
            }`}
          />
          {fieldErrors.passportNumber && (
            <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{fieldErrors.passportNumber}</span>
            </p>
          )}
        </div>
      )}

      {/* Permit input */}
      {idDocType === "PERMIT" && (
        <div className="space-y-1">
          <label className="font-bold text-slate-700 block text-xs">
            {dict.formLabels.permitNumber} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={permitNumber}
            onChange={(e) => {
              onPermitChange(e.target.value);
              onValidateField("permitNumber", e.target.value);
            }}
            onBlur={(e) => onValidateField("permitNumber", e.target.value)}
            placeholder={dict.formLabels.permitPlaceholder}
            className={`w-full bg-slate-50 border rounded-xs px-3 py-2 text-slate-900 font-mono focus:outline-none focus:bg-white ${
              fieldErrors.permitNumber ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-primary"
            }`}
          />
          {fieldErrors.permitNumber && (
            <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{fieldErrors.permitNumber}</span>
            </p>
          )}
        </div>
      )}

      {/* Other ID input */}
      {idDocType === "OTHER" && (
        <div className="space-y-1">
          <label className="font-bold text-slate-700 block text-xs">
            {dict.formLabels.otherIdNumber} <span className="text-red-600">*</span>
          </label>
          <div className="flex items-stretch">
            <span className="inline-flex items-center bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider px-2.5 rounded-l-xs border border-r-0 border-slate-300 shrink-0">
              {dict.formLabels.otherPrefix}
            </span>
            <input
              type="text"
              value={otherIdDocVal}
              onChange={(e) => {
                onOtherIdChange(e.target.value);
                onValidateField("otherIdDocVal", e.target.value);
              }}
              onBlur={(e) => onValidateField("otherIdDocVal", e.target.value)}
              placeholder={dict.formLabels.otherIdPlaceholder}
              className={`flex-1 min-w-0 bg-slate-50 border rounded-r-xs px-3 py-2 text-slate-900 focus:outline-none focus:bg-white ${
                fieldErrors.otherIdDocVal ? "border-rose-400 focus:border-rose-500" : "border-slate-300 focus:border-primary"
              }`}
            />
          </div>
          {fieldErrors.otherIdDocVal && (
            <p className="flex items-center space-x-1 text-[10px] text-rose-600 mt-0.5">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{fieldErrors.otherIdDocVal}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}