"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Download,
  Printer,
  ArrowLeft,
  Building2,
  Award,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReceiptPageDict } from "@/dictionaries/types";

// ── Data shape from the API ─────────────────────────────────────────────────

interface ReceiptData {
  receiptNumber: string;
  receiptS3Key: string;
  registrantNameZh: string;
  registrantNameEn: string;
  registrantEmail: string;
  courseNameZh: string;
  courseNameEn: string;
  iaRefNumber: string | null;
  cpdHours: number;
  fee: string;
  paymentMethod: string | null;
  paymentDate: string;
  status: string;
}

// ── Component props ─────────────────────────────────────────────────────────

interface ReceiptViewProps {
  enrolmentId: string;
  locale: string;
  dict: ReceiptPageDict;
}

// ── Component ───────────────────────────────────────────────────────────────

export function ReceiptView({ enrolmentId, locale, dict }: ReceiptViewProps) {
  const [data, setData] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  // 1: Fetch receipt data from the API
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(`/api/receipt/${enrolmentId}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(dict.notFound);
          }
          throw new Error(dict.error);
        }
        const json = await res.json();
        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : dict.error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [enrolmentId, dict]);

  // 2: Download PDF via server proxy
  const handleDownload = useCallback(async () => {
    if (!data) return;
    setDownloading(true);

    try {
      // POST to the proxy endpoint which streams the PDF from S3
      const response = await fetch("/api/download/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptNumber: data.receiptNumber }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        const msg = errBody?.error ?? "Failed to download receipt";
        throw new Error(msg);
      }

      // Convert the response to a blob and trigger download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${data.receiptNumber}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }, [data]);

  // 3: Print
  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") {
      window.print();
    }
  }, []);

  // ── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">
        <div className="text-slate-500 text-sm font-mono animate-pulse">
          {dict.loading}
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] flex items-center justify-center">
        <div className="bg-white border border-red-200 p-6 max-w-md text-center space-y-3 shadow-xs">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-slate-700">{error ?? dict.notFound}</p>
          <Link
            href={`/${locale}`}
            className="text-xs font-bold text-[#1b4332] hover:underline inline-block"
          >
            {dict.backToHome}
          </Link>
        </div>
      </div>
    );
  }

  // Format the payment date for display
  const displayDate = new Date(data.paymentDate).toLocaleDateString(locale === "en" ? "en-US" : "zh-HK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── Main receipt view ─────────────────────────────────────────────────────

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-8 px-4 print:bg-white print:py-0 print:px-0 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Action Controls (hidden when printing) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href={`/${locale}`}
            className="text-xs font-bold text-slate-600 hover:text-[#1b4332] transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{dict.backToHome}</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-none text-xs font-bold h-8 px-3"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              {dict.print}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-none text-xs font-bold h-8 px-3 bg-[#1b4332] hover:bg-[#112a1f]"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              {downloading ? dict.downloading : dict.downloadPdf}
            </Button>
          </div>
        </div>

        {/* Receipt Card */}
        <div className="bg-white border border-slate-300 p-6 sm:p-8 shadow-xs print:shadow-none print:border-none space-y-6">
          {/* Status Banner */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 flex items-start space-x-3 print:border-emerald-500">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h1 className="text-base font-bold text-emerald-950">
                {dict.pageTitle}
              </h1>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {dict.receiptNumber}: <strong className="text-emerald-950">{data.receiptNumber}</strong>
              </p>
            </div>
          </div>

          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                <Building2 className="w-3.5 h-3.5 text-[#1b4332]" />
                <span>{dict.receiptStamp}</span>
              </div>
              <h2 className="text-xl font-serif font-bold text-[#1b4332]">
                {dict.pageTitle}
              </h2>
            </div>
            <div className="text-right font-mono text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-800">{dict.receiptNumber}:</span>{" "}
                {data.receiptNumber}
              </div>
              <div className="text-[11px] text-slate-500">
                {displayDate}
              </div>
            </div>
          </div>

          {/* Course Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
              {dict.courseName}
            </h3>
            <div className="bg-slate-50 p-4 border border-slate-200 space-y-3 text-xs">
              <div>
                <h4 className="text-base font-serif font-bold text-slate-900">
                  {locale === "en" ? data.courseNameEn : data.courseNameZh}
                </h4>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-slate-600 text-[11px]">
                  {data.iaRefNumber && (
                    <span className="font-mono font-semibold bg-white px-2 py-0.5 border border-slate-200">
                      {dict.iaRef}: {data.iaRefNumber}
                    </span>
                  )}
                  <span className="flex items-center space-x-1 font-bold text-[#1b4332]">
                    <Award className="w-3.5 h-3.5" />
                    <span>{dict.cpdHours}: {data.cpdHours}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Registrant & Payment Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            {/* Registrant Info */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                {dict.registrantName}
              </h3>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">{dict.registrantName} (EN):</span>
                  <span className="font-bold text-slate-900">{data.registrantNameEn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{dict.registrantName} (ZH):</span>
                  <span className="font-bold text-slate-900">{data.registrantNameZh}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                {dict.fee}
              </h3>
              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">{dict.paymentMethod}:</span>
                  <span className="text-slate-900">{data.paymentMethod ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{dict.paymentStatus}:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                    {dict.verified}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900">
                  <span>{dict.fee}:</span>
                  <span className="font-serif text-base text-[#1b4332]">
                    HKD {data.fee}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-[10px] text-slate-500 text-center">
              {dict.footerDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}