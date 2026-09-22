"use client";

/**
 * FileDropZone — a drag-and-drop file input for CSV/XLSX uploads.
 *
 * States: default, hover, dragging, file-selected, error, disabled.
 * Built from existing design tokens. Uses a hidden <input type="file"> triggered by click.
 */
import { useRef, useState, useCallback, type DragEvent, type ChangeEvent } from "react";
import { Upload, FileText, AlertCircle, X } from "lucide-react";

interface FileDropZoneProps {
  /** Called with the selected file when a valid file is chosen */
  onFileSelected: (file: File) => void;
  /** Called when the user wants to clear the selected file */
  onClear: () => void;
  /** Accepted MIME types */
  accept?: string;
  /** Maximum file size in bytes (default 10MB) */
  maxSize?: number;
  /** Currently selected file (if any) */
  selectedFile?: File | null;
  /** Error message to display */
  error?: string | null;
  /** Disable the zone */
  disabled?: boolean;
}

const ACCEPTED_FORMATS = ".csv,.xlsx";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function FileDropZone({
  onFileSelected,
  onClear,
  accept = ACCEPTED_FORMATS,
  maxSize = MAX_SIZE_BYTES,
  selectedFile,
  error,
  disabled = false,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const displayError = error ?? localError;

  const validateAndSet = useCallback(
    (file: File) => {
      // Reset local error
      setLocalError(null);

      // Check extension
      const isCsv = file.name.toLowerCase().endsWith(".csv");
      const isXlsx = file.name.toLowerCase().endsWith(".xlsx");
      if (!isCsv && !isXlsx) {
        setLocalError("Unsupported format. Please upload a .csv or .xlsx file.");
        return;
      }

      // Check size
      if (file.size > maxSize) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        setLocalError(`File too large (${sizeMB}MB). Maximum is ${maxSize / 1024 / 1024}MB.`);
        return;
      }

      onFileSelected(file);
    },
    [maxSize, onFileSelected],
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        validateAndSet(files[0]!);
      }
    },
    [disabled, validateAndSet],
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        validateAndSet(files[0]!);
      }
      // Reset input value so re-selecting the same file triggers change again
      e.target.value = "";
    },
    [validateAndSet],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setLocalError(null);
      onClear();
    },
    [onClear],
  );

  // ── Derived styles ──

  const borderColor = displayError
    ? "border-destructive"
    : isDragging
      ? "border-primary"
      : "border-slate-300";

  const bgColor = disabled
    ? "bg-slate-50"
    : isDragging
      ? "bg-primary/5"
      : "bg-white";

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed ${borderColor} ${bgColor}
        rounded-xs p-8 text-center cursor-pointer
        transition-colors duration-150
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/[0.03]"}
      `}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload file"
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
        aria-hidden="true"
      />

      {selectedFile ? (
        // File selected state
        <div className="space-y-2">
          <FileText className="w-8 h-8 mx-auto text-primary" />
          <p className="text-sm font-medium text-slate-700">{selectedFile.name}</p>
          <p className="text-xs text-slate-500">
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors mt-1"
            type="button"
          >
            <X className="w-3 h-3" />
            Remove file
          </button>
        </div>
      ) : (
        // Default / dragging state
        <div className="space-y-2">
          <Upload className={`w-8 h-8 mx-auto ${isDragging ? "text-primary" : "text-slate-400"}`} />
          <p className="text-sm font-medium text-slate-600">
            {isDragging ? "Drop your file here" : "Drag & drop your file here, or click to browse"}
          </p>
          <p className="text-xs text-slate-400">
            Supported formats: .csv, .xlsx (max {maxSize / 1024 / 1024}MB)
          </p>
        </div>
      )}

      {/* Error message */}
      {displayError && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}
    </div>
  );
}