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
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function RejectDialog({
  rejectTarget,
  rejectReason,
  rejecting,
  locale,
  onReasonChange,
  onConfirm,
  onClose,
}: RejectDialogProps) {
  return (
    <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Enrolment</DialogTitle>
          <DialogDescription>
            This will mark the enrolment as rejected. The learner will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {rejectTarget && (
            <div className="bg-slate-50 border border-slate-200 p-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Enrollee:</span>
                <span className="font-bold text-slate-800">{getName(rejectTarget.user, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course:</span>
                <span className="font-bold text-slate-800">{getCourseName(rejectTarget, locale)}</span>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Rejection reason <span className="text-destructive">*</span>
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
              placeholder="e.g. Payment proof is illegible, please re-upload a clear copy."
              rows={3}
              className="w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            loading={rejecting}
            disabled={!rejectReason.trim() || rejecting}
          >
            <Ban className="w-3.5 h-3.5" />
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}