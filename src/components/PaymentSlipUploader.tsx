"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle2, FileText, AlertCircle, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PaymentUploadDict } from "@/dictionaries/types";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

type UploadState = "idle" | "requesting_url" | "uploading" | "confirming" | "done" | "error";

export function PaymentSlipUploader({ dict, registrantId, email = "" }: { dict: PaymentUploadDict; registrantId: string; email?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  function validateFile(f: File): string | null {
    if (!ALLOWED_TYPES.includes(f.type)) {
      return dict.errorUnsupportedType;
    }
    if (f.size > MAX_SIZE) {
      const sizeMb = (f.size / (1024 * 1024)).toFixed(1);
      return dict.errorFileTooLarge.replace("{size}", sizeMb);
    }
    return null;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    if (!f) { setFile(null); return; }

    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      setFile(null);
      e.target.value = "";
      return;
    }

    setFile(f);
    setError("");
  }

  async function handleUpload() {
    if (!file) return;
    setError("");
    setProgress(0);

    try {
      // Step 1: Request presigned URL from backend
      setUploadState("requesting_url");
      const urlRes = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          registrantId,
          ...(email && { email }),
        }),
      });

      if (!urlRes.ok) {
        const errBody = await urlRes.json().catch(() => ({}));
        throw new Error(errBody.error || dict.errorGetUrl);
      }

      const { uploadUrl, key }: { uploadUrl: string; key: string } = await urlRes.json();

      // Step 2: Upload file directly to S3 via presigned URL with XMLHttpRequest
      //         for upload progress tracking
      setUploadState("uploading");
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const pct = Math.round((event.loaded / event.total) * 90);
            setProgress(pct);
          }
        });

        xhr.addEventListener("load", () => {
          xhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(90);
            resolve();
          } else {
            const s3Error = xhr.responseText || xhr.statusText || "Unknown error";
            reject(new Error(`${dict.errorS3Upload} (${xhr.status}): ${s3Error}`));
          }
        });

        xhr.addEventListener("error", () => {
          xhrRef.current = null;
          reject(new Error(dict.errorNetwork));
        });

        xhr.addEventListener("abort", () => {
          xhrRef.current = null;
          reject(new Error(dict.uploadCancelled));
        });

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      // Step 3: Confirm upload in database
      setUploadState("confirming");
      setProgress(95);
      const confirmRes = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrantId, key, ...(email && { email }) }),
      });

      if (!confirmRes.ok) {
        const errBody = await confirmRes.json().catch(() => ({}));
        throw new Error(errBody.error || dict.errorConfirm);
      }

      setProgress(100);
      setUploadState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.errorGeneric);
      setUploadState("error");
      setProgress(0);
    }
  }

  // ── Success state ──
  if (uploadState === "done") {
    return (
      <Card className="rounded-none border-emerald-200 bg-emerald-50/50 p-6 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <h3 className="font-bold text-emerald-900 text-base">
          {dict.successTitle}
        </h3>
        <p className="text-xs text-emerald-700 max-w-sm mx-auto">
          {dict.successDescription}
        </p>
      </Card>
    );
  }

  // ── Upload form ──
  const isInProgress = uploadState === "requesting_url" || uploadState === "uploading" || uploadState === "confirming";

  return (
    <Card className="rounded-none border-slate-200 shadow-none bg-white">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-900">
          {dict.title}
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          {dict.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File input */}
        <div className="space-y-2">
          <input
            type="file"
            accept=".jpeg,.jpg,.png,.webp,.pdf"
            disabled={isInProgress}
            className="block w-full text-xs text-slate-700 file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            onChange={handleFileChange}
          />
          {file && !error && (
            <p className="text-xs text-slate-600 flex items-center pt-1">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-500 shrink-0" />
              {dict.fileSelected} <strong className="ml-1">{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600 flex items-center pt-1" role="alert">
              <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Progress bar */}
        {isInProgress && (
          <div className="w-full bg-slate-100 h-2 rounded-none overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Status text */}
        {uploadState === "requesting_url" && (
          <p className="text-xs text-slate-500">{dict.requestingUrl}</p>
        )}
        {uploadState === "uploading" && (
          <p className="text-xs text-slate-500">{dict.uploading}</p>
        )}
        {uploadState === "confirming" && (
          <p className="text-xs text-slate-500">{dict.confirming}</p>
        )}

        {/* Action button */}
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={!file || isInProgress}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-none text-xs font-semibold disabled:opacity-50"
          >
            {uploadState === "requesting_url" || uploadState === "confirming" ? (
              dict.processing
            ) : uploadState === "uploading" ? (
              dict.uploadProgress.replace("{progress}", String(progress))
            ) : (
              <>
                <Upload className="w-3.5 h-3.5 mr-2" /> {dict.submitButton}
              </>
            )}
          </Button>
          {isInProgress && (
            <Button
              variant="outline"
              className="rounded-none border-slate-300 text-xs text-slate-600"
              onClick={() => {
                if (xhrRef.current) xhrRef.current.abort();
                setUploadState("error");
                setError(dict.uploadCancelled);
                setProgress(0);
              }}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}