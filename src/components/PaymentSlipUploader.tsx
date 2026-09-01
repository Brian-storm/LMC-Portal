// src/components/PaymentSlipUploader.tsx
"use client";

import { useState } from "react";
import { Upload, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function PaymentSlipUploader({ orderId }: { orderId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload() {
    if (!file) return;
    setIsUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("slip", file);
    formData.append("orderId", orderId);

    try {
      const res = await fetch("/api/upload-slip", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        setError("Upload failed. Please try again.");
      }
    } catch {
      setError("Network error encountered.");
    } finally {
      setIsUploading(false);
    }
  }

  if (isSuccess) {
    return (
      <Card className="rounded-none border-emerald-200 bg-emerald-50/50 p-6 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <h3 className="font-bold text-emerald-900 text-base">
          Payment Slip Submitted
        </h3>
        <p className="text-xs text-emerald-700 max-w-sm mx-auto">
          Our administrative team will verify your FPS payment within 1 business
          day. You will receive an email confirmation once verified.
        </p>
      </Card>
    );
  }

  return (
    <Card className="rounded-none border-slate-200 shadow-none bg-white">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-900">
          Upload FPS Payment Receipt
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Upload an image (JPG, PNG) or PDF of your FPS transfer transaction
          record.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Drop Zone / Input */}
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*,.pdf"
            className="rounded-none cursor-pointer border-slate-300 text-xs"
            onChange={(e) => { setFile(e.target.files?.[0] || null); setError(""); }}
          />
          {file && (
            <p className="text-xs text-slate-600 flex items-center pt-1">
              <FileText className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Selected: <strong>{file.name}</strong> (
              {(file.size / 1024).toFixed(1)} KB)
            </p>
          )}
          {error && (
            <p className="text-xs text-red-600 flex items-center pt-1" role="alert">
              <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-none text-xs font-semibold"
        >
          {isUploading ? (
            "Uploading Receipt..."
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 mr-2" /> Submit Payment Slip
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
