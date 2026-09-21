"use client";

import Image from "next/image";
import { FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Enrolment } from "./types";
import type { AdminDict } from "@/dictionaries/types";

const getName = (user: { nameZh: string; nameEn: string }, locale: string) => {
  const name = locale === "zh-hk" || locale === "zh-cn" ? user.nameZh : user.nameEn;
  return name || user.nameEn;
};

const getCourseName = (e: Enrolment, locale: string) => {
  if (locale === "zh-cn") return e.course.nameCn || e.course.nameZh;
  return locale === "zh-hk" ? e.course.nameZh : e.course.nameEn;
};

interface PaymentProofPreviewProps {
  previewTarget: Enrolment | null;
  locale: string;
  dict: AdminDict;
  onClose: () => void;
}

export default function PaymentProofPreview({ previewTarget, locale, dict, onClose }: PaymentProofPreviewProps) {
  return (
    <Dialog open={!!previewTarget} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{ dict.paymentProofTitle }</DialogTitle>
          <DialogDescription>
            {previewTarget && `${getName(previewTarget.user, locale)} — ${getCourseName(previewTarget, locale)}`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center min-h-[200px] bg-slate-50 border border-slate-200 rounded-xs">
          {previewTarget?.paymentProofUrl ? (
            <div className="text-center space-y-2 p-4">
              <Image
                src={`/api/upload/s3-proxy?key=${encodeURIComponent(previewTarget.paymentProofUrl)}`}
                alt="Payment proof"
                className="max-w-full max-h-[60vh] object-contain border border-slate-200"
                width={800}
                height={600}
                unoptimized
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
              <p className="text-xs text-slate-500 hidden">
                { dict.paymentProofLoadError }
              </p>
              <p className="font-mono text-slate-400 truncate max-w-full">
                {previewTarget.paymentProofUrl}
              </p>
            </div>
          ) : (
            <div className="text-center p-4">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">{ dict.noPaymentProof }</p>
            </div>
          )}
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}