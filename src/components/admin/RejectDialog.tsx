"use client";

import { Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { REJECTION_REASONS } from "./constants";

const getName = (user: { nameZh: string; nameEn: string }, locale: string) => {
  const name = locale === "zh-hk" || locale === "zh-cn" ? user.nameZh : user.nameEn;
  return name || user.nameEn;
};

const getCourseName = (e: Enrolment, locale: string) => {
  if (locale === "zh-cn") return e.course.nameCn || e.course.nameZh;
  return locale === "zh-hk" ? e.course.nameZh : e.course.nameEn;
};

interface RejectDialogProps {
  rejectTarget: Enrolment | null;
  rejectReason: string;
  rejecting: boolean;
  locale: string;
  dict: AdminDict;
  batchCount?: number;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function RejectDialog({
  rejectTarget,
  rejectReason,
  rejecting,
  locale,
  dict,
  batchCount,
  onReasonChange,
  onConfirm,
  onClose,
}: RejectDialogProps) {
  // If batchCount is set, the dialog open state is controlled externally via onClose.
  // Otherwise it follows the rejectTarget presence.
  const open = batchCount != null ? batchCount > 0 : !!rejectTarget;
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{ batchCount ? dict.batchConfirmReject.replace("{count}", String(batchCount)) : dict.rejectTitle }</DialogTitle>
          <DialogDescription>
            { dict.rejectDesc }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {batchCount ? (
            <div className="bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
              {dict.selectedCount.replace("{count}", String(batchCount))}
            </div>
          ) : rejectTarget && (
            <div className="bg-slate-50 border border-slate-200 p-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{ dict.enrollee }:</span>
                <span className="font-bold text-slate-800">{getName(rejectTarget.user, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{ dict.course }:</span>
                <span className="font-bold text-slate-800">{getCourseName(rejectTarget, locale)}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              { dict.rejectReasonLabel } <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 pb-2">
              {REJECTION_REASONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onReasonChange(value)}
                  className={`text-[11px] px-2 py-1 rounded-xs border transition-colors ${
                    rejectReason === value
                      ? "bg-destructive/10 border-destructive text-destructive font-bold"
                      : "bg-white border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={ dict.rejectPlaceholder }
              rows={3}
              className="w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            { dict.cancel }
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={rejecting}
            disabled={!rejectReason.trim() || rejecting}
          >
            <Ban className="w-3.5 h-3.5" />
            { dict.confirmRejection }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}