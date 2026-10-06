"use client";

/** Admin roster import wizard: upload, map columns, review every row, then confirm atomically. */
import { useCallback, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Download,
  FileDown,
  Loader2,
  Upload,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import FileDropZone from "@/components/admin/FileDropZone";
import RegistrantColumnMapper, {
  type RegistrantColumnSampleRow,
} from "@/components/admin/RegistrantColumnMapper";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import type { ImportError, ImportTableColumn } from "@/lib/data/types";
import type { SourceColumnMapping } from "@/lib/data/import/mapping";

/** Supported wizard pages; the mapping step is distinct from server-validated review. */
type ImportStep = "upload" | "map" | "review" | "result";

/** A row returned by the server's mapped-preview endpoint. */
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
  errors: ImportError[];
}

/** Initial file-inspection response; sample values are already display-formatted by the server. */
interface SourceInspection {
  sourceColumns: ImportTableColumn[];
  sampleRows: RegistrantColumnSampleRow[];
  suggestedMapping: SourceColumnMapping[];
  totalRows: number;
}

/** Complete row-validation summary; rows are capped by the API while errors cover the full file. */
interface MappedPreview {
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: PreviewRow[];
  validationErrors: ImportError[];
  mappingErrors: ImportError[];
}

/** Confirmation outcome; failed imports always report zero created users. */
interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: ImportError[];
  message: string;
}

/** Fields that must each receive a unique source column before requesting a mapped preview. */
const REQUIRED_TARGET_FIELDS = [
  "nameZh",
  "nameEn",
  "email",
  "phone",
  "idDocNumber",
] as const;

/** Parse a response body as a plain record without surfacing raw JSON parse errors. */
async function readResponseBody(response: Response): Promise<Record<string, unknown>> {
  // 1: Accept only JSON objects; malformed and non-JSON error bodies become an empty payload.
  try {
    const value: unknown = await response.json();
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return value as Record<string, unknown>;
    }
  } catch {
    // 2: Let callers choose a localized fallback for malformed response bodies.
  }

  return {};
}

/** Keep server error details structurally safe before rendering or creating the downloadable report. */
function readImportErrors(value: unknown): ImportError[] {
  // 1: Ignore malformed collections rather than trusting an arbitrary response shape.
  if (!Array.isArray(value)) return [];

  // 2: Retain only row/field/message tuples with the exact display types required by the UI.
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const candidate = entry as Record<string, unknown>;
    if (
      typeof candidate.row !== "number" ||
      typeof candidate.field !== "string" ||
      typeof candidate.message !== "string"
    ) {
      return [];
    }
    return [{ row: candidate.row, field: candidate.field, message: candidate.message }];
  });
}

/** Convert an optional response value into a finite, non-negative integer count. */
function readCount(value: unknown, fallback = 0): number {
  // 1: Reject negative, fractional, and non-finite values from an unexpected response.
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : fallback;
}

/** Validate the inspection payload before it enters the wizard's controlled state. */
function readSourceInspection(body: Record<string, unknown>): SourceInspection | null {
  // 1: Require arrays for each source-table collection and retain only valid source indexes.
  if (!Array.isArray(body.sourceColumns) || !Array.isArray(body.sampleRows)) return null;
  const sourceColumns = body.sourceColumns.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const candidate = entry as Record<string, unknown>;
    if (!Number.isSafeInteger(candidate.index) || typeof candidate.header !== "string") return [];
    return [{ index: candidate.index as number, header: candidate.header }];
  });

  // 2: Normalize bounded sample metadata and source-index suggestions from the API response.
  const sampleRows = body.sampleRows.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const candidate = entry as Record<string, unknown>;
    if (!Array.isArray(candidate.values)) return [];
    return [{
      rowNumber: readCount(candidate.rowNumber),
      values: candidate.values.map((value) => (typeof value === "string" ? value : "")),
    }];
  });
  const suggestedMapping = readColumnMappings(body.suggestedMapping);

  // 3: Return null when the response does not describe a usable source table.
  if (sourceColumns.length === 0 || !Number.isSafeInteger(body.totalRows) || (body.totalRows as number) < 0) {
    return null;
  }
  return { sourceColumns, sampleRows, suggestedMapping, totalRows: readCount(body.totalRows) };
}

/** Parse suggested or returned source mappings while retaining only safe index/key pairs. */
function readColumnMappings(value: unknown): SourceColumnMapping[] {
  // 1: Ignore values that are not a mapping list.
  if (!Array.isArray(value)) return [];

  // 2: Keep integer indexes and string keys; the API remains authoritative for validation.
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const candidate = entry as Record<string, unknown>;
    if (!Number.isSafeInteger(candidate.sourceIndex) || typeof candidate.targetField !== "string") {
      return [];
    }
    return [{ sourceIndex: candidate.sourceIndex as number, targetField: candidate.targetField }];
  });
}

/** Normalize capped preview records; values are server-formatted strings, never trusted for writes. */
function readPreviewRows(value: unknown): PreviewRow[] {
  // 1: Require an array and discard records that do not have source row numbers.
  if (!Array.isArray(value)) return [];

  // 2: Normalize every profile field and retain only structurally valid server error tuples.
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const candidate = entry as Record<string, unknown>;
    if (!Number.isSafeInteger(candidate.rowNumber)) return [];
    const text = (key: string) => (typeof candidate[key] === "string" ? candidate[key] as string : "");
    return [{
      rowNumber: candidate.rowNumber as number,
      nameZh: text("nameZh"),
      nameEn: text("nameEn"),
      email: text("email"),
      phone: text("phone"),
      idDocNumber: text("idDocNumber"),
      idDocType: text("idDocType"),
      iaLicense: text("iaLicense"),
      organization: text("organization"),
      valid: candidate.valid === true,
      errors: readImportErrors(candidate.errors),
    }];
  });
}

/** Validate the complete mapped-preview response before enabling the review and confirm steps. */
function readMappedPreview(body: Record<string, unknown>): MappedPreview | null {
  // 1: Require safe counts whose valid and invalid rows account for the complete source file.
  const counts = [body.totalRows, body.validCount, body.errorCount];
  if (!counts.every((value) => Number.isSafeInteger(value) && (value as number) >= 0)) return null;
  const [totalRows, validCount, errorCount] = counts as number[];
  if (totalRows === 0 || validCount + errorCount !== totalRows) return null;

  // 2: Require the API's error and row arrays, then enforce the documented 20-row preview cap.
  if (!Array.isArray(body.rows) || !Array.isArray(body.validationErrors) || !Array.isArray(body.mappingErrors)) {
    return null;
  }
  const rows = readPreviewRows(body.rows);
  if (rows.length !== Math.min(totalRows, 20)) return null;

  // 3: Keep the server's full-file error collections while displaying only its capped row preview.
  return {
    totalRows,
    validCount,
    errorCount,
    rows,
    validationErrors: readImportErrors(body.validationErrors),
    mappingErrors: readImportErrors(body.mappingErrors),
  };
}

/** Map expected API status codes to localized, user-readable summaries. */
function getHttpErrorMessage(
  status: number,
  messages: {
    invalidRequest: string;
    authenticationRequired: string;
    adminRequired: string;
    conflict: string;
    validationFailed: string;
    serverFailure: string;
    requestFailed: string;
  },
): string {
  // 1: Prefer actionable authorization, validation, and conflict explanations.
  if (status === 400) return messages.invalidRequest;
  if (status === 401) return messages.authenticationRequired;
  if (status === 403) return messages.adminRequired;
  if (status === 409) return messages.conflict;
  if (status === 422) return messages.validationFailed;

  // 2: Keep server failures distinct from other unexpected HTTP statuses.
  return status >= 500 ? messages.serverFailure : messages.requestFailed;
}

/** Log request metadata only; filenames, mapping payloads, and student data stay out of the console. */
function logImportRequestFailure(operation: string, status?: number, error?: unknown): void {
  // 1: Keep the diagnostic to the operation, HTTP status, and exception class only.
  const errorName = error instanceof Error ? error.name : error ? "UnknownError" : undefined;
  console.error(`Registrant import ${operation} failed`, {
    ...(status === undefined ? {} : { status }),
    ...(errorName ? { errorName } : {}),
  });
}

/** Derive a language tag for Chinese values shown in the mapped-data preview. */
function getCellLanguage(value: string, locale: string): string | undefined {
  // 1: Leave non-Han values under the document language.
  if (!/\p{Script=Han}/u.test(value)) return undefined;

  // 2: Mark Chinese cell values for assistive technology with the selected script variant.
  return locale === "zh-cn" ? "zh-Hans" : "zh-Hant";
}

/** Escape a value for a downloadable CSV error report. */
function escapeCsvField(value: string): string {
  // 1: Quote cells containing CSV delimiters and double every embedded quote.
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/** Render the controlled four-step import wizard and its API-backed transitions. */
export default function ImportRegistrantsPage() {
  // 1: Resolve the locale and dictionary from the existing admin layout provider.
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const adminDict = useAdminDict();
  const dict = adminDict.importRegistrants;
  const mappingDict = adminDict.importMapping;

  // 2: Keep the selected file and all preview/mapping state in this browser component only.
  const [step, setStep] = useState<ImportStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<SourceInspection | null>(null);
  const [mapping, setMapping] = useState<SourceColumnMapping[]>([]);
  const [mappingErrors, setMappingErrors] = useState<ImportError[]>([]);
  const [mappingRequestError, setMappingRequestError] = useState<string | null>(null);
  const [mappingRequestDetails, setMappingRequestDetails] = useState<ImportError[]>([]);
  const [mappedPreview, setMappedPreview] = useState<MappedPreview | null>(null);
  const [confirmResult, setConfirmResult] = useState<ImportResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<ImportError[]>([]);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState<"csv" | "xlsx" | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // 3: Derive required-map, full-file-validity, and current request-lock states.
  const mappedRequiredFields = new Set(mapping.map((entry) => entry.targetField));
  const allRequiredMapped = REQUIRED_TARGET_FIELDS.every((field) => mappedRequiredFields.has(field));
  const canReview = Boolean(inspection && selectedFile && inspection.totalRows > 0 && allRequiredMapped);
  const allRowsValid = Boolean(
    mappedPreview &&
    mappedPreview.totalRows > 0 &&
    mappedPreview.validCount === mappedPreview.totalRows &&
    mappedPreview.errorCount === 0 &&
    mappedPreview.validationErrors.length === 0 &&
    mappedPreview.mappingErrors.length === 0,
  );
  const isBusy = isInspecting || isValidating || isConfirming;

  // 4: Clear all state tied to a file so rows or mappings can never leak across uploads.
  const resetImportState = useCallback(() => {
    setStep("upload");
    setSelectedFile(null);
    setInspection(null);
    setMapping([]);
    setMappingErrors([]);
    setMappingRequestError(null);
    setMappingRequestDetails([]);
    setMappedPreview(null);
    setConfirmResult(null);
    setUploadError(null);
    setUploadErrors([]);
    setTemplateError(null);
  }, []);

  // 5: Replace the selected file and clear all prior inspection and validation results.
  const handleFileSelected = useCallback((file: File) => {
    resetImportState();
    setSelectedFile(file);
  }, [resetImportState]);

  // 6: Clear the active file and return to the first wizard step.
  const handleFileClear = useCallback(() => {
    resetImportState();
  }, [resetImportState]);

  // 7: Download a template through fetch so authorization and service failures remain visible here.
  const handleTemplateDownload = useCallback(async (format: "csv" | "xlsx") => {
    setDownloadingTemplate(format);
    setTemplateError(null);
    try {
      // 1: Request the existing authenticated template endpoint using its supported format query.
      const response = await fetch(`/api/admin/import/registrants/template?format=${format}`);
      if (!response.ok) {
        logImportRequestFailure("template download", response.status);
        setTemplateError(getHttpErrorMessage(response.status, dict.errors));
        return;
      }

      // 2: Download the response bytes with the stable template name returned by this route.
      const blobUrl = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = format === "csv"
        ? "lmc-registrant-import-template.csv"
        : "lmc-registrant-import-template.xlsx";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
    } catch (error) {
      // 3: Avoid logging response contents while retaining a useful request-failure trace.
      logImportRequestFailure("template download", undefined, error);
      setTemplateError(dict.errors.requestFailed);
    } finally {
      setDownloadingTemplate(null);
    }
  }, [dict]);

  // 8: Inspect source columns using the API's file-only multipart contract.
  const handleInspectFile = useCallback(async () => {
    if (!selectedFile) {
      setUploadError(dict.errors.selectFileFirst);
      return;
    }

    setIsInspecting(true);
    setUploadError(null);
    setUploadErrors([]);
    try {
      // 1: Send only the selected file; the route returns raw source metadata and capped samples.
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch("/api/admin/import/registrants/preview", {
        method: "POST",
        body: formData,
      });
      const body = await readResponseBody(response);

      // 2: Surface structural and HTTP failures without logging file values or response bodies.
      if (!response.ok) {
        logImportRequestFailure("inspect", response.status);
        setUploadError(getHttpErrorMessage(response.status, dict.errors));
        setUploadErrors(readImportErrors(body.parseErrors));
        return;
      }

      // 3: Accept only the source-table shape needed by the column mapper.
      const result = readSourceInspection(body);
      if (!result) {
        logImportRequestFailure("inspect response", response.status);
        setUploadError(dict.errors.unexpectedResponse);
        return;
      }

      // 4: Seed manual mapping with unique exact suggestions and move into the mapping step.
      setInspection(result);
      setMapping(result.suggestedMapping);
      setStep("map");
    } catch (error) {
      // 5: Keep network exceptions useful for diagnostics without logging user-controlled data.
      logImportRequestFailure("inspect", undefined, error);
      setUploadError(dict.errors.requestFailed);
    } finally {
      setIsInspecting(false);
    }
  }, [dict, selectedFile]);

  // 9: Update controlled mapping and invalidate any server preview based on its prior contents.
  const handleMappingChange = useCallback((nextMapping: SourceColumnMapping[]) => {
    setMapping(nextMapping);
    setMappingErrors([]);
    setMappingRequestError(null);
    setMappingRequestDetails([]);
    setMappedPreview(null);
  }, []);

  // 10: Ask the API to remap and validate every row; keep confirmation gated by that response.
  const handleMappedPreview = useCallback(async () => {
    if (!selectedFile || !inspection || !canReview) return;

    setIsValidating(true);
    setMappingErrors([]);
    setMappingRequestError(null);
    setMappingRequestDetails([]);
    setMappedPreview(null);
    try {
      // 1: Re-upload the original browser File with source-index mapping JSON.
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mapping", JSON.stringify(mapping));
      const response = await fetch("/api/admin/import/registrants/preview", {
        method: "POST",
        body: formData,
      });
      const body = await readResponseBody(response);

      // 2: Keep mapping failures on the mapping step and display any row/file details returned.
      if (!response.ok) {
        logImportRequestFailure("mapped preview", response.status);
        const nextMappingErrors = readImportErrors(body.mappingErrors);
        const nextDetails = [
          ...readImportErrors(body.parseErrors),
          ...readImportErrors(body.validationErrors),
        ];
        setMappingErrors(nextMappingErrors);
        setMappingRequestDetails(nextDetails);
        setMappingRequestError(getHttpErrorMessage(response.status, dict.errors));
        return;
      }

      // 3: Normalize server counts, capped rows, and complete-file errors for the review step.
      const nextPreview = readMappedPreview(body);
      if (!nextPreview) {
        logImportRequestFailure("mapped preview response", response.status);
        setMappingRequestError(dict.errors.unexpectedResponse);
        return;
      }
      setMappedPreview(nextPreview);
      setStep("review");
    } catch (error) {
      // 4: Keep the admin on mapping so they can retry without losing the selected File or mapping.
      logImportRequestFailure("mapped preview", undefined, error);
      setMappingRequestError(dict.errors.requestFailed);
    } finally {
      setIsValidating(false);
    }
  }, [canReview, dict, inspection, mapping, selectedFile]);

  // 11: Return to mapping so the admin can correct selections and request a fresh server preview.
  const handleBackToMapping = useCallback(() => {
    setStep("map");
  }, []);

  // 12: Download all server validation errors as a CSV; the on-screen row preview stays capped.
  const downloadErrorReport = useCallback((errors: readonly ImportError[]) => {
    if (errors.length === 0) return;

    // 1: Escape all cells and include a UTF-8 BOM for spreadsheet compatibility.
    const csvRows = [
      [dict.errorCsvHeaders.row, dict.errorCsvHeaders.field, dict.errorCsvHeaders.message],
      ...errors.map((error) => [String(error.row), error.field, error.message]),
    ];
    const csv = `\uFEFF${csvRows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n")}`;
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));

    // 2: Trigger the download and release its object URL after the browser has handled the click.
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = "import-error-detail.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
  }, [dict.errorCsvHeaders]);

  // 13: Re-upload and revalidate the same file and mapping before the atomic database transaction.
  const handleConfirm = useCallback(async () => {
    if (!selectedFile || !allRowsValid || !mappedPreview) return;

    setIsConfirming(true);
    setConfirmResult(null);
    try {
      // 1: Confirmation receives only the original File and selected source-index mapping.
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("mapping", JSON.stringify(mapping));
      const response = await fetch("/api/admin/import/registrants/confirm", {
        method: "POST",
        body: formData,
      });
      const body = await readResponseBody(response);
      const errors = [
        ...readImportErrors(body.errors),
        ...readImportErrors(body.parseErrors),
        ...readImportErrors(body.mappingErrors),
        ...readImportErrors(body.validationErrors),
      ];

      // 2: Distinguish atomic success from all-or-nothing API failures, including late conflicts.
      if (response.ok) {
        const imported = readCount(body.imported);
        setConfirmResult({
          success: imported > 0,
          imported,
          failed: readCount(body.failed),
          errors,
          message: imported > 0
            ? dict.result.successDescription.replace("{count}", String(imported))
            : dict.result.noProfilesCreated,
        });
      } else {
        logImportRequestFailure("confirm", response.status);
        setConfirmResult({
          success: false,
          imported: 0,
          failed: mappedPreview.totalRows,
          errors,
          message: getHttpErrorMessage(response.status, dict.errors),
        });
      }
      setStep("result");
    } catch (error) {
      // 3: Show a full-batch failure for network errors; never infer partial success from a lost reply.
      logImportRequestFailure("confirm", undefined, error);
      setConfirmResult({
        success: false,
        imported: 0,
        failed: 0,
        errors: [],
        message: dict.result.confirmationUnknown,
      });
      setStep("result");
    } finally {
      setIsConfirming(false);
    }
  }, [allRowsValid, dict, mappedPreview, mapping, selectedFile]);

  // 14: Clear the entire import session after showing its result.
  const handleImportAnother = useCallback(() => {
    resetImportState();
  }, [resetImportState]);

  // 15: Build localized preview table labels from the existing mapper destination dictionary.
  const previewFields: Array<{ key: keyof Omit<PreviewRow, "rowNumber" | "valid" | "errors">; label: string }> = [
    { key: "nameZh", label: mappingDict.targetFields.nameZh },
    { key: "nameEn", label: mappingDict.targetFields.nameEn },
    { key: "email", label: mappingDict.targetFields.email },
    { key: "phone", label: mappingDict.targetFields.phone },
    { key: "idDocNumber", label: mappingDict.targetFields.idDocNumber },
    { key: "idDocType", label: mappingDict.targetFields.idDocType },
    { key: "iaLicense", label: mappingDict.targetFields.iaLicense },
    { key: "organization", label: mappingDict.targetFields.organization },
  ];
  const steps: Array<{ key: ImportStep; label: string }> = [
    { key: "upload", label: dict.steps.upload },
    { key: "map", label: dict.steps.map },
    { key: "review", label: dict.steps.review },
    { key: "result", label: dict.steps.result },
  ];
  const currentStepIndex = steps.findIndex((item) => item.key === step);

  // 16: Render the stepper and the active panel with explicit loading, empty, error, and result states.
  return (
    <div className="space-y-6 p-4 md:p-6" aria-busy={isBusy}>
      <AdminPageHeader
        title={dict.title}
        subtitle={dict.subtitle}
        backHref={`/${locale}/admin/users`}
        backLabel={dict.backToUsers}
      />

      <nav aria-label={dict.steps.ariaLabel} className="overflow-x-auto">
        <ol className="flex min-w-max items-center gap-2 text-xs font-medium sm:min-w-0">
          {steps.map((item, index) => {
            const isCurrent = item.key === step;
            const isComplete = index < currentStepIndex;
            return (
              <li key={item.key} className="flex items-center gap-2">
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex size-8 items-center justify-center rounded-full font-bold ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isComplete
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="size-4" aria-hidden="true" /> : index + 1}
                </span>
                <span className={isCurrent ? "font-semibold text-primary" : "text-muted-foreground"}>
                  {item.label}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {step === "upload" && (
        <section className="space-y-4 rounded-xs border border-border bg-card p-4 md:p-6" aria-labelledby="import-upload-title">
          <div className="space-y-1">
            <h2 id="import-upload-title" className="text-base font-semibold text-foreground">
              {dict.upload.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{dict.upload.description}</p>
          </div>

          <FileDropZone
            onFileSelected={handleFileSelected}
            onClear={handleFileClear}
            selectedFile={selectedFile}
            error={uploadError}
            disabled={isBusy}
          />

          {uploadErrors.length > 0 && (
            <ErrorDetails
              title={dict.errors.fileDetailsTitle}
              errors={uploadErrors}
              dict={dict.errorDetails}
            />
          )}

          {templateError && (
            <InlineNotice variant="error" title={dict.errors.templateDownloadTitle} message={templateError} />
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => handleTemplateDownload("csv")}
                disabled={isBusy || downloadingTemplate !== null}
                className="min-h-11"
              >
                {downloadingTemplate === "csv" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileDown className="size-4" aria-hidden="true" />
                )}
                {downloadingTemplate === "csv" ? dict.upload.downloadingTemplate : dict.upload.downloadCsvTemplate}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleTemplateDownload("xlsx")}
                disabled={isBusy || downloadingTemplate !== null}
                className="min-h-11"
              >
                {downloadingTemplate === "xlsx" ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FileDown className="size-4" aria-hidden="true" />
                )}
                {downloadingTemplate === "xlsx" ? dict.upload.downloadingTemplate : dict.upload.downloadExcelTemplate}
              </Button>
            </div>
            <Button onClick={handleInspectFile} disabled={!selectedFile || isBusy} className="min-h-11">
              {isInspecting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {dict.upload.inspecting}
                </>
              ) : (
                <>
                  <Upload className="size-4" aria-hidden="true" />
                  {dict.upload.inspectAction}
                </>
              )}
            </Button>
          </div>
        </section>
      )}

      {step === "map" && inspection && selectedFile && (
        <section className="space-y-4" aria-labelledby="import-map-title">
          <div className="flex flex-col gap-3 rounded-xs border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between md:p-6">
            <div className="min-w-0 space-y-1">
              <h2 id="import-map-title" className="text-base font-semibold text-foreground">
                {dict.mapping.title}
              </h2>
              <p className="truncate text-sm text-muted-foreground" title={selectedFile.name}>
                {dict.mapping.selectedFile.replace("{file}", selectedFile.name)}
              </p>
            </div>
            <Button variant="outline" onClick={resetImportState} disabled={isBusy} className="min-h-11 shrink-0">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {dict.actions.changeFile}
            </Button>
          </div>

          {mappingRequestError && (
            <InlineNotice variant="error" title={dict.errors.mappingRequestTitle} message={mappingRequestError} />
          )}
          {mappingRequestDetails.length > 0 && (
            <ErrorDetails title={dict.errors.fileDetailsTitle} errors={mappingRequestDetails} dict={dict.errorDetails} />
          )}
          {inspection.totalRows === 0 && (
            <InlineNotice variant="warning" title={dict.errors.noDataTitle} message={dict.errors.noDataDescription} />
          )}

          <RegistrantColumnMapper
            locale={locale}
            sourceColumns={inspection.sourceColumns}
            sampleRows={inspection.sampleRows}
            suggestedMapping={inspection.suggestedMapping}
            mapping={mapping}
            mappingErrors={mappingErrors}
            loading={isValidating}
            disabled={isBusy}
            onMappingChange={handleMappingChange}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={resetImportState} disabled={isBusy} className="min-h-11">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {dict.actions.cancelAndChangeFile}
            </Button>
            <Button onClick={handleMappedPreview} disabled={!canReview || isBusy} className="min-h-11">
              {isValidating ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {dict.mapping.validating}
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  {dict.actions.reviewMapping}
                </>
              )}
            </Button>
          </div>
          {!allRequiredMapped && inspection.totalRows > 0 && (
            <p className="text-right text-sm text-muted-foreground" role="status">
              {dict.mapping.requiredMappingHint}
            </p>
          )}
        </section>
      )}

      {step === "review" && mappedPreview && (
        <section className="space-y-4" aria-labelledby="import-review-title">
          <div className="flex flex-col gap-3 rounded-xs border border-border bg-card p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <h2 id="import-review-title" className="mr-auto text-base font-semibold text-foreground">
                {dict.review.title}
              </h2>
              <SummaryMetric label={dict.review.totalRows} value={mappedPreview.totalRows} />
              <SummaryMetric label={dict.review.validRows} value={mappedPreview.validCount} variant="success" />
              <SummaryMetric label={dict.review.invalidRows} value={mappedPreview.errorCount} variant="error" />
            </div>
            <p className="text-sm text-muted-foreground">
              {dict.review.showingRows
                .replace("{visible}", String(mappedPreview.rows.length))
                .replace("{total}", String(mappedPreview.totalRows))}
            </p>
          </div>

          {mappedPreview.totalRows === 0 ? (
            <InlineNotice variant="warning" title={dict.errors.noDataTitle} message={dict.errors.noDataDescription} />
          ) : allRowsValid ? (
            <InlineNotice
              variant="success"
              title={dict.review.allValidTitle}
              message={dict.review.allValidDescription.replace("{count}", String(mappedPreview.totalRows))}
            />
          ) : (
            <InlineNotice
              variant="error"
              title={dict.review.invalidRowsTitle}
              message={dict.review.invalidRowsDescription}
            />
          )}

          <div className="overflow-hidden rounded-xs border border-border bg-card">
            <div className="overflow-x-auto" tabIndex={0} aria-label={dict.review.tableRegion}>
              <table className="min-w-[1100px] w-full text-sm" aria-label={dict.review.tableRegion}>
                <caption className="sr-only">{dict.review.tableRegion}</caption>
                <thead className="bg-muted text-left text-xs font-semibold text-muted-foreground">
                  <tr>
                    <th scope="col" className="sticky left-0 z-10 bg-muted px-3 py-3">{dict.errorDetails.row}</th>
                    {previewFields.map((field) => (
                      <th scope="col" key={field.key} className="min-w-36 px-3 py-3">{field.label}</th>
                    ))}
                    <th scope="col" className="px-3 py-3">{dict.review.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedPreview.rows.length === 0 ? (
                    <tr>
                      <td colSpan={previewFields.length + 2} className="px-4 py-10 text-center text-muted-foreground">
                        {dict.review.noPreviewRows}
                      </td>
                    </tr>
                  ) : (
                    mappedPreview.rows.map((row) => (
                      <tr key={row.rowNumber} className="border-t border-border align-top">
                        <th scope="row" className="sticky left-0 z-10 bg-card px-3 py-3 text-left font-mono text-xs">
                          {row.rowNumber}
                        </th>
                        {previewFields.map((field) => {
                          const value = row[field.key];
                          const hasError = row.errors.some((error) => error.field === field.key);
                          return (
                            <td
                              key={field.key}
                              lang={getCellLanguage(value, locale)}
                              className={`max-w-64 break-words px-3 py-3 ${hasError ? "bg-destructive/5 text-destructive" : "text-foreground"}`}
                            >
                              {value || <span className="italic text-muted-foreground">{dict.review.emptyValue}</span>}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3">
                          {row.valid ? (
                            <span className="inline-flex items-center gap-1.5 font-medium text-success">
                              <CheckCircle2 className="size-4" aria-hidden="true" />
                              {dict.review.validStatus}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 font-medium text-destructive">
                              <XCircle className="size-4" aria-hidden="true" />
                              {dict.review.invalidStatus}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {mappedPreview.validationErrors.length > 0 && (
            <div className="space-y-3 rounded-xs border border-destructive/30 bg-destructive/5 p-4 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-destructive">{dict.review.errorDetailsTitle}</h3>
                  <p className="text-sm text-muted-foreground">
                    {dict.review.errorDetailsDescription.replace("{count}", String(mappedPreview.validationErrors.length))}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => downloadErrorReport(mappedPreview.validationErrors)}
                  className="min-h-11"
                >
                  <Download className="size-4" aria-hidden="true" />
                  {dict.actions.downloadErrors}
                </Button>
              </div>
              <ErrorDetails
                title={dict.review.errorDetailsTitle}
                errors={mappedPreview.validationErrors}
                dict={dict.errorDetails}
                showTitle={false}
              />
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" onClick={handleBackToMapping} disabled={isBusy} className="min-h-11">
              <ArrowLeft className="size-4" aria-hidden="true" />
              {dict.actions.editMapping}
            </Button>
            <Button onClick={handleConfirm} disabled={!allRowsValid || isBusy} className="min-h-11">
              {isConfirming ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {dict.actions.confirming}
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  {dict.actions.confirmAll.replace("{count}", String(mappedPreview.totalRows))}
                </>
              )}
            </Button>
          </div>
          {!allRowsValid && mappedPreview.totalRows > 0 && (
            <p className="text-right text-sm text-muted-foreground" role="status">
              {dict.review.confirmBlocked}
            </p>
          )}
        </section>
      )}

      {step === "result" && confirmResult && (
        <section className="space-y-4 rounded-xs border border-border bg-card p-4 md:p-6" aria-labelledby="import-result-title">
          <div className={`flex items-start gap-3 rounded-xs p-4 ${confirmResult.success ? "bg-success/10" : "bg-destructive/5"}`}>
            {confirmResult.success ? (
              <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" aria-hidden="true" />
            ) : (
              <AlertCircle className="mt-0.5 size-6 shrink-0 text-destructive" aria-hidden="true" />
            )}
            <div className="space-y-1">
              <h2 id="import-result-title" className={`text-base font-semibold ${confirmResult.success ? "text-success" : "text-destructive"}`}>
                {confirmResult.success ? dict.result.successTitle : dict.result.failureTitle}
              </h2>
              <p className="text-sm leading-relaxed text-foreground">{confirmResult.message}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryMetric label={dict.result.importedCount} value={confirmResult.imported} variant="success" card />
            <SummaryMetric label={dict.result.failedCount} value={confirmResult.failed} variant={confirmResult.failed > 0 ? "error" : "neutral"} card />
          </div>

          {confirmResult.errors.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">{dict.result.errorDetailsTitle}</h3>
                <Button variant="outline" onClick={() => downloadErrorReport(confirmResult.errors)} className="min-h-11">
                  <Download className="size-4" aria-hidden="true" />
                  {dict.actions.downloadErrors}
                </Button>
              </div>
              <ErrorDetails title={dict.result.errorDetailsTitle} errors={confirmResult.errors} dict={dict.errorDetails} showTitle={false} />
            </div>
          )}

          <div className="flex justify-end border-t border-border pt-4">
            <Button onClick={handleImportAnother} className="min-h-11">
              <Upload className="size-4" aria-hidden="true" />
              {dict.actions.importAnother}
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

/** Render row/field errors in a scrollable, accessible detail list. */
function ErrorDetails({
  title,
  errors,
  dict,
  showTitle = true,
}: {
  title: string;
  errors: readonly ImportError[];
  dict: { row: string; field: string; message: string };
  showTitle?: boolean;
}) {
  // 1: Provide a labeled alert region and preserve every server-reported error for review.
  return (
    <section className="space-y-2" aria-label={title}>
      {showTitle && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
      <div className="max-h-72 overflow-auto rounded-xs border border-border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-muted text-left text-xs font-semibold text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2">{dict.row}</th>
              <th scope="col" className="px-3 py-2">{dict.field}</th>
              <th scope="col" className="px-3 py-2">{dict.message}</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((error, index) => (
              <tr key={`${error.row}-${error.field}-${index}`} className="border-t border-border align-top">
                <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{error.row}</td>
                <td className="whitespace-nowrap px-3 py-2">{error.field}</td>
                <td className="px-3 py-2 text-destructive">{error.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Render a localized inline alert with an icon and semantic state color. */
function InlineNotice({
  variant,
  title,
  message,
}: {
  variant: "error" | "warning" | "success";
  title: string;
  message: string;
}) {
  // 1: Choose the icon and token classes from the alert's semantic state.
  const Icon = variant === "success" ? CheckCircle2 : variant === "warning" ? AlertTriangle : AlertCircle;
  const styles =
    variant === "success"
      ? "border-success/30 bg-success/10 text-success"
      : variant === "warning"
        ? "border-warning/30 bg-warning/10 text-warning-foreground"
        : "border-destructive/30 bg-destructive/5 text-destructive";

  // 2: Expose failures as alerts and progress/success information as status announcements.
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xs border p-4 ${styles}`}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

/** Display a count with restrained semantic emphasis for preview and final-result summaries. */
function SummaryMetric({
  label,
  value,
  variant = "neutral",
  card = false,
}: {
  label: string;
  value: number;
  variant?: "neutral" | "success" | "error";
  card?: boolean;
}) {
  // 1: Select semantic text color while keeping labels visually secondary to their counts.
  const valueStyle =
    variant === "success"
      ? "text-success"
      : variant === "error"
        ? "text-destructive"
        : "text-foreground";

  // 2: Use the same value/label hierarchy in compact summary rows and result cards.
  return (
    <div className={card ? "rounded-xs border border-border p-4 text-center" : "inline-flex items-baseline gap-2"}>
      <span className={`${card ? "block text-2xl" : "text-sm"} font-semibold tabular-nums ${valueStyle}`}>
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}
