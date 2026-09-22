"use client";

/**
 * Admin Import Registrants — 3-step wizard (Upload → Preview → Result).
 *
 * Step 1: Drag-and-drop file upload (.csv / .xlsx, max 10MB)
 * Step 2: Preview parsed rows with error highlights, Continue / Cancel
 * Step 3: Import result summary with error detail download
 */
import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  FileDown,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  XCircle,
  ArrowLeft,
  Download,
  ChevronRight,
} from "lucide-react";
import { useToast, toast as showToast } from "@/components/ui/toast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDataTable from "@/components/admin/AdminDataTable";
import FileDropZone from "@/components/admin/FileDropZone";

// ─── Types ─────────────────────────────────────────────────────────────────

interface PreviewRow {
  rowNumber: number;
  nameZh: string;
  nameEn: string;
  email: string;
  phone: string;
  idDocNumber: string;
  idDocType: string;
  iaLicense: string;
  organization: string;
  valid: boolean;
  errors: Array<{ row: number; field: string; message: string }>;
}

interface PreviewResponse {
  importId: string | null;
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: PreviewRow[];
  parseErrors: Array<{ row: number; field: string; message: string }>;
  columns: Array<{ key: string; header: string }>;
}

interface ConfirmResponse {
  imported: number;
  failed: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

type WizardStep = "upload" | "preview" | "result";

// ─── Page ──────────────────────────────────────────────────────────────────

export default function ImportRegistrantsPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const { addToast } = useToast();

  // Wizard state
  const [step, setStep] = useState<WizardStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [confirmResult, setConfirmResult] = useState<ConfirmResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // ── Step 1: Upload file ─────────────────────────────────────────────────

  const handleFileSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setFileError(null);
  }, []);

  const handleFileClear = useCallback(() => {
    setSelectedFile(null);
    setFileError(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setFileError("Please select a file first.");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/admin/import/registrants/preview", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data: PreviewResponse = await res.json();
      setPreview(data);

      if (data.totalRows === 0) {
        // No rows found — stay on upload step but show error
        showToast(addToast, "No data found", {
          description: "The file appears to be empty or has no valid rows.",
          variant: "warning",
        });
        setUploading(false);
        return;
      }

      setStep("preview");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process file";
      setUploadError(message);
      showToast(addToast, "Upload failed", {
        description: message,
        variant: "danger",
      });
    } finally {
      setUploading(false);
    }
  }, [selectedFile, addToast]);

  // ── Step 2: Preview ────────────────────────────────────────────────────

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setStep("upload");
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!preview?.importId) return;

    setConfirming(true);

    try {
      const res = await fetch("/api/admin/import/registrants/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importId: preview.importId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Confirmation failed" }));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data: ConfirmResponse = await res.json();
      setConfirmResult(data);
      setStep("result");

      if (data.imported > 0) {
        showToast(addToast, "Import complete", {
          description: `${data.imported} registrant(s) imported successfully.`,
          variant: "success",
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to confirm import";
      showToast(addToast, "Import failed", {
        description: message,
        variant: "danger",
      });
    } finally {
      setConfirming(false);
    }
  }, [preview, addToast]);

  // ── Step 3: Result ─────────────────────────────────────────────────────

  const handleDone = useCallback(() => {
    setSelectedFile(null);
    setPreview(null);
    setConfirmResult(null);
    setStep("upload");
  }, []);

  const downloadErrorDetail = useCallback(() => {
    if (!confirmResult?.errors || confirmResult.errors.length === 0) return;

    // Build a CSV of errors
    const header = "Row,Field,Error";
    const rows = confirmResult.errors.map(
      (e) => `${e.row},"${e.field}","${e.message.replace(/"/g, '""')}"`,
    );
    const csv = "\uFEFF" + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "import-error-detail.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [confirmResult]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-6 space-y-4">
      <AdminPageHeader
        title="Import Registrants"
        subtitle="Upload a CSV or Excel file to batch-import registrant records"
        backHref={`/${locale}/admin/users`}
        backLabel="Back to Users"
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs font-medium">
        {(["upload", "preview", "result"] as WizardStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`
                flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                ${step === s
                  ? "bg-primary text-white"
                  : step === "upload" && s === "upload" || step === "preview" && (s === "upload" || s === "preview") || step === "result"
                    ? "bg-primary/20 text-primary"
                    : "bg-slate-100 text-slate-400"
                }
              `}
            >
              {step === s ? (
                step === "result" ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1
              ) : (
                i + 1
              )}
            </div>
            <span className={step === s ? "text-primary font-semibold" : "text-slate-400"}>
              {s === "upload" ? "Upload" : s === "preview" ? "Preview" : "Result"}
            </span>
            {i < 2 && <ChevronRight className="w-3 h-3 text-slate-300" />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Upload ─────────────────────────────────────────────── */}
      {step === "upload" && (
        <div className="bg-white border border-slate-200 rounded-xs p-6 space-y-4">
          <FileDropZone
            onFileSelected={handleFileSelected}
            onClear={handleFileClear}
            selectedFile={selectedFile}
            error={fileError}
            disabled={uploading}
          />

          <div className="flex items-center justify-between">
            <Link
              href="/api/admin/import/registrants/template?format=csv"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download CSV template
            </Link>
            <Link
              href="/api/admin/import/registrants/template?format=xlsx"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download Excel template
            </Link>
          </div>

          {/* Upload error */}
          {uploadError && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xs">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{uploadError}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs
                transition-all duration-150
                ${!selectedFile || uploading
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-hover shadow-xs"
                }
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Upload & Preview
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Preview ───────────────────────────────────────────── */}
      {step === "preview" && preview && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xs">
            <span className="text-xs text-slate-500">
              Total rows: <strong className="text-slate-700">{preview.totalRows}</strong>
            </span>
            <span className="text-xs text-success">
              Valid: <strong>{preview.validCount}</strong>
            </span>
            {preview.errorCount > 0 && (
              <span className="text-xs text-destructive">
                With errors: <strong>{preview.errorCount}</strong>
              </span>
            )}
            <span className="text-xs text-slate-400">(showing first {Math.min(20, preview.rows.length)})</span>
          </div>

          {/* Preview table */}
          <AdminDataTable
            emptyMessage="No rows to preview"
            emptyIcon={AlertTriangle}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider">#</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider">Name (ZH)</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider">Name (EN)</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider">Phone</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider">ID Doc</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider">IA License</th>
                    <th className="text-left px-3 py-2 font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                        No rows to display
                      </td>
                    </tr>
                  ) : (
                    preview.rows.map((row) => (
                      <tr
                        key={row.rowNumber}
                        className={`border-b border-slate-100 ${row.valid ? "" : "bg-destructive/5"}`}
                      >
                        <td className="px-3 py-2 text-slate-400 font-mono">{row.rowNumber}</td>
                        <td className={`px-3 py-2 ${row.errors.some((e) => e.field === "nameZh") ? "text-destructive" : ""}`}>
                          {row.nameZh || <span className="text-slate-300 italic">empty</span>}
                          {row.errors.filter((e) => e.field === "nameZh").map((e, i) => (
                            <div key={i} className="text-destructive text-[10px] mt-0.5">{e.message}</div>
                          ))}
                        </td>
                        <td className={`px-3 py-2 ${row.errors.some((e) => e.field === "nameEn") ? "text-destructive" : ""}`}>
                          {row.nameEn || <span className="text-slate-300 italic">empty</span>}
                          {row.errors.filter((e) => e.field === "nameEn").map((e, i) => (
                            <div key={i} className="text-destructive text-[10px] mt-0.5">{e.message}</div>
                          ))}
                        </td>
                        <td className={`px-3 py-2 ${row.errors.some((e) => e.field === "email") ? "text-destructive" : ""}`}>
                          {row.email || <span className="text-slate-300 italic">empty</span>}
                          {row.errors.filter((e) => e.field === "email").map((e, i) => (
                            <div key={i} className="text-destructive text-[10px] mt-0.5">{e.message}</div>
                          ))}
                        </td>
                        <td className={`px-3 py-2 ${row.errors.some((e) => e.field === "phone") ? "text-destructive" : ""}`}>
                          {row.phone || <span className="text-slate-300 italic">empty</span>}
                          {row.errors.filter((e) => e.field === "phone").map((e, i) => (
                            <div key={i} className="text-destructive text-[10px] mt-0.5">{e.message}</div>
                          ))}
                        </td>
                        <td className={`px-3 py-2 ${row.errors.some((e) => e.field === "idDocNumber" || e.field === "idDocType") ? "text-destructive" : ""}`}>
                          {row.idDocNumber || <span className="text-slate-300 italic">empty</span>}
                          {row.idDocType && <span className="text-slate-400 ml-1">({row.idDocType})</span>}
                          {row.errors.filter((e) => e.field === "idDocNumber" || e.field === "idDocType").map((e, i) => (
                            <div key={i} className="text-destructive text-[10px] mt-0.5">{e.message}</div>
                          ))}
                        </td>
                        <td className={`px-3 py-2 ${row.errors.some((e) => e.field === "iaLicense") ? "text-destructive" : ""}`}>
                          {row.iaLicense || <span className="text-slate-300 italic">-</span>}
                          {row.errors.filter((e) => e.field === "iaLicense").map((e, i) => (
                            <div key={i} className="text-destructive text-[10px] mt-0.5">{e.message}</div>
                          ))}
                        </td>
                        <td className="px-3 py-2">
                          {row.valid ? (
                            <span className="inline-flex items-center gap-1 text-xs text-success">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-destructive">
                              <XCircle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </AdminDataTable>

          {/* Parse errors (structural file issues) */}
          {preview.parseErrors.length > 0 && (
            <div className="p-3 bg-warning/10 border border-warning/30 rounded-xs">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-warning mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                File parsing warnings
              </div>
              <ul className="space-y-0.5">
                {preview.parseErrors.map((err, i) => (
                  <li key={i} className="text-xs text-warning-foreground">
                    Row {err.row}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleCancel}
              disabled={confirming}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 border border-slate-300 rounded-xs hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Cancel & Upload Different File
            </button>

            <button
              onClick={handleConfirm}
              disabled={preview.validCount === 0 || confirming}
              className={`
                inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xs
                transition-all duration-150
                ${preview.validCount === 0 || confirming
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-hover shadow-xs"
                }
              `}
            >
              {confirming ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Importing {preview.validCount} record(s)...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Continue — Import {preview.validCount} Valid Record(s)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Result ─────────────────────────────────────────────── */}
      {step === "result" && confirmResult && (
        <div className="bg-white border border-slate-200 rounded-xs p-6 space-y-4">
          {/* Success banner */}
          <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/30 rounded-xs">
            <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-success">Import Completed</h3>
              <p className="text-xs text-slate-600 mt-1">
                {confirmResult.imported > 0
                  ? `Successfully imported ${confirmResult.imported} registrant record(s).`
                  : "No records were imported."}
              </p>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-success/30 bg-success/5 rounded-xs text-center">
              <p className="text-2xl font-bold text-success">{confirmResult.imported}</p>
              <p className="text-xs text-slate-500 mt-1">Imported</p>
            </div>
            <div className={`p-4 border rounded-xs text-center ${confirmResult.failed > 0 ? "border-destructive/30 bg-destructive/5" : "border-slate-200 bg-slate-50"}`}>
              <p className={`text-2xl font-bold ${confirmResult.failed > 0 ? "text-destructive" : "text-slate-400"}`}>
                {confirmResult.failed}
              </p>
              <p className="text-xs text-slate-500 mt-1">Failed</p>
            </div>
          </div>

          {/* Error detail */}
          {confirmResult.errors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Error Details</h4>
                <button
                  onClick={downloadErrorDetail}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download CSV
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xs">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-3 py-2 font-semibold text-slate-600">Row</th>
                      <th className="text-left px-3 py-2 font-semibold text-slate-600">Field</th>
                      <th className="text-left px-3 py-2 font-semibold text-slate-600">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmResult.errors.map((err, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="px-3 py-1.5 font-mono text-slate-500">{err.row}</td>
                        <td className="px-3 py-1.5 text-slate-700">{err.field}</td>
                        <td className="px-3 py-1.5 text-destructive">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleDone}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary-hover rounded-xs shadow-xs transition-all duration-150"
            >
              <Upload className="w-3.5 h-3.5" />
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}