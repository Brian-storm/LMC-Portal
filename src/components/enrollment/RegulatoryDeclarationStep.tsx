"use client";

import Link from "next/link";
import { AlertCircle, ChevronRight, FileCheck } from "lucide-react";
import type { EnrollPageDict } from "@/dictionaries/types";

interface RegulatoryDeclarationStepProps {
  declaredEligible: boolean;
  agreedToTerms: boolean;
  dict: EnrollPageDict;
  locale: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onProceed: () => void;
}

export function RegulatoryDeclarationStep({
  declaredEligible,
  agreedToTerms,
  dict,
  locale,
  onInputChange,
  onBack,
  onProceed,
}: RegulatoryDeclarationStepProps) {
  const canProceed = declaredEligible && agreedToTerms;

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center space-x-2">
          <FileCheck className="w-4 h-4" />
          <span>{dict.step3.title}</span>
        </h2>
      </div>

      {/* CPD notice */}
      <div className="bg-amber-50/80 border border-amber-200 p-3 text-xs text-amber-900 space-y-1 rounded-xs">
        <div className="flex items-center space-x-1.5 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{dict.step3.cpdNoticeTitle}</span>
        </div>
        <p className="text-[11px] leading-relaxed">{dict.step3.cpdNoticeText}</p>
      </div>

      {/* Personal Data Collection Notice */}
      <div className="bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 space-y-1 rounded-xs">
        <p className="text-[11px] leading-relaxed">{dict.step3.personalDataNotice}</p>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3 pt-2 text-xs text-slate-700">
        <label className="flex items-start space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="declaredEligible"
            checked={declaredEligible}
            onChange={onInputChange}
            className="mt-0.5 border-slate-400 text-primary focus:ring-0 accent-primary"
          />
          <span className="leading-relaxed">{dict.step3.declarationLabel}</span>
        </label>

        <label className="flex items-start space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            name="agreedToTerms"
            checked={agreedToTerms}
            onChange={onInputChange}
            className="mt-0.5 border-slate-400 text-primary focus:ring-0 accent-primary"
          />
          <span className="leading-relaxed">
            {dict.step3.termsLabel}{" "}
            {dict.step3.termsLinkText && (
              <Link
                href={`/${locale}/terms`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary underline hover:text-emerald-900 font-semibold"
              >
                {dict.step3.termsLinkText}
              </Link>
            )}
            {dict.step3.termsLinkText && " "}
            {dict.step3.termsSuffix}
          </span>
        </label>
      </div>

      {/* Navigation buttons */}
      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs uppercase font-bold tracking-wider rounded-xs"
        >
          {dict.step3.backButton}
        </button>
        <button
          type="button"
          disabled={!canProceed}
          onClick={onProceed}
          className="inline-flex items-center space-x-1.5 bg-primary hover:bg-primary/80 disabled:opacity-50 text-primary-foreground font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors"
        >
          <span>{dict.navigation.proceedToPayment}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}