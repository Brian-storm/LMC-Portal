"use client";

import { useState } from "react";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import { Button } from "@/components/ui/button";
import { DollarSign, Download } from "lucide-react";

export default function AdminPaymentsPage() {
  const dict = useAdminDict();
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null);

  const handleExport = async (format: "csv" | "xlsx") => {
    setExporting(format);
    try {
      const res = await fetch(`/api/admin/payments/export?format=${format}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Export failed: ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lmc-payments-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page header */}
        <header className="bg-white border border-slate-300 p-6 shadow-2xs border-t-4 border-t-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              <span>{dict.portalTitle}</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-primary">
              {dict.payments}
            </h1>
            <p className="text-xs text-slate-500">
              {dict.paymentsDescription}
            </p>
          </div>
          {/* Export buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              loading={exporting === "csv"}
              disabled={exporting !== null}
              onClick={() => handleExport("csv")}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              <Download className="w-4 h-4 mr-1.5" />
              {dict.exportCsv}
            </Button>
            <Button
              variant="default"
              size="sm"
              loading={exporting === "xlsx"}
              disabled={exporting !== null}
              onClick={() => handleExport("xlsx")}
            >
              <Download className="w-4 h-4 mr-1.5" />
              {dict.exportExcel}
            </Button>
          </div>
        </header>

        {/* Info card */}
        <div className="bg-white border border-slate-200 p-6 rounded-xs shadow-2xs">
          <div className="text-sm text-slate-600 space-y-3">
            <p>{dict.paymentsExportHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
}