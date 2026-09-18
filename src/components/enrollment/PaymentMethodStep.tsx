"use client";

import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Wallet,
} from "lucide-react";
import type { EnrollPageDict } from "@/dictionaries/types";

interface PaymentMethodStepProps {
  paymentMethod: string;
  submitError: string;
  isSubmitting: boolean;
  dict: EnrollPageDict;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
}

export function PaymentMethodStep({
  paymentMethod,
  submitError,
  isSubmitting,
  dict,
  onInputChange,
  onBack,
}: PaymentMethodStepProps) {
  const paymentOptions = [
    { value: "fps", label: dict.step4.fps, imgSrc: "/company/payments/fps-code.jpeg", imgWidth: 240, imgHeight: 240 },
    { value: "alipay", label: dict.step4.alipay, imgSrc: "/company/payments/alipay-qr-code.jpeg", imgWidth: 240, imgHeight: 240 },
    { value: "direct_transfer", label: dict.step4.directTransfer, imgSrc: "/company/payments/bank-transfer.jpeg", imgWidth: 480, imgHeight: 320, imgClass: "w-full max-w-[480px]" },
  ];

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center space-x-2">
          <Wallet className="w-4 h-4" />
          <span>{dict.step4.title}</span>
        </h2>
      </div>

      {/* Refund policy notice */}
      <div className="bg-amber-50/80 border border-amber-200 p-3 text-xs text-amber-900 space-y-1 rounded-xs">
        <div className="flex items-center space-x-1.5 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{dict.step4.refundNotice}</span>
        </div>
      </div>

      {/* Payment method options */}
      <div className="space-y-6 text-xs">
        {paymentOptions.map((option) => (
          <div key={option.value} className="space-y-2">
            <label className="flex items-center space-x-2 p-3 border border-slate-300 rounded-xs cursor-pointer hover:bg-slate-50">
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={paymentMethod === option.value}
                onChange={onInputChange}
                className="text-primary accent-primary"
              />
              <span className="font-bold text-slate-800">{option.label}</span>
            </label>
            <div className="flex justify-center p-2 border border-slate-200 rounded-xs bg-white">
              <Image
                src={option.imgSrc}
                alt={option.label}
                width={option.imgWidth}
                height={option.imgHeight}
                className={option.imgClass || "object-contain"}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Inline error display */}
      {submitError && (
        <div
          className="flex items-start space-x-2 bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xs text-xs"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs uppercase font-bold tracking-wider rounded-xs"
        >
          {dict.step4.backButton}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/80 disabled:opacity-50 text-primary-foreground font-bold px-6 py-2.5 text-xs uppercase tracking-wider rounded-xs transition-all shadow-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{dict.step4.processing}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{dict.step4.submitButton}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}