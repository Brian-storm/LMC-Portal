"use client";

import { ShieldCheck } from "lucide-react";
import type { EnrollPageDict } from "@/dictionaries/types";
import type { CourseData } from "./types";

interface SummarySidebarProps {
  course: CourseData;
  selectedScheduleIds: string[];
  selectedCount: number;
  totalSessions: number;
  unitPrice: string;
  isAllSelected: boolean;
  enrollmentType: "INDIVIDUAL" | "ORGANIZATION";
  totalRegistrants: number;
  registrantMultiplier: number;
  dict: EnrollPageDict;
  locale: string;
}

export function SummarySidebar({
  course,
  selectedScheduleIds,
  selectedCount,
  totalSessions,
  unitPrice,
  isAllSelected,
  enrollmentType,
  totalRegistrants,
  registrantMultiplier,
  dict,
  locale,
}: SummarySidebarProps) {
  return (
    <aside className="lg:col-span-1 bg-white border border-slate-300 p-4 shadow-2xs space-y-4">
      <div className="pb-2 border-b border-slate-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          {dict.summary.title}
        </h3>
      </div>

      <div className="space-y-3 text-xs">
        {/* Course name */}
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            {dict.summary.course}
          </span>
          <p className="font-serif font-bold text-slate-900 leading-snug mt-0.5">
            {locale === "en"
              ? course.nameEn
              : locale === "zh-cn"
                ? course.nameCn || course.nameZh
                : course.nameZh}
          </p>
        </div>

        {/* Selected schedules list */}
        {selectedCount > 0 && (
          <div className="border-t border-slate-100 pt-2 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              {dict.summary.sessionsLabel} {selectedCount}/{totalSessions}
            </span>
            {course.schedules
              .filter((s) => selectedScheduleIds.includes(s.id))
              .map((s) => {
                const si = s.topics[0]?.syllabusItem;
                const topicAbbr = si
                  ? locale === "en"
                    ? si.titleEn
                    : si.titleZh
                  : "";
                return (
                  <div key={s.id} className="flex flex-col text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-700">{topicAbbr}</span>
                    <span className="truncate">{s.dateAndTime}</span>
                  </div>
                );
              })}
          </div>
        )}

        {/* Organization registrant count */}
        {enrollmentType === "ORGANIZATION" && (
          <div className="flex justify-between py-1.5 border-t border-slate-100 text-slate-600">
            <span>{dict.summary.registrants}</span>
            <span className="font-mono font-bold text-slate-800">{totalRegistrants}</span>
          </div>
        )}

        {/* Fee breakdown */}
        {selectedCount > 0 && (
          <>
            <div className="flex justify-between py-1.5 border-t border-slate-100 text-slate-600">
              <span>{dict.summary.subtotal}</span>
              <span className="font-mono font-bold text-slate-800">
                HK$ {(parseFloat(unitPrice) * selectedCount * registrantMultiplier).toLocaleString()}
              </span>
            </div>
            {isAllSelected && (
              <div className="flex justify-between py-1.5 text-emerald-700">
                <span className="font-bold">{dict.summary.discount}</span>
                <span className="font-mono font-bold">
                  -HK$ {(parseFloat(unitPrice) * selectedCount * 0.1 * registrantMultiplier).toLocaleString()}
                </span>
              </div>
            )}
          </>
        )}

        {/* Total fee */}
        <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
          <span className="font-bold text-slate-900 uppercase">{dict.summary.totalFee}</span>
          <span className="text-lg font-serif font-bold text-primary">
            HK${" "}
            {(selectedCount > 0
              ? parseFloat(unitPrice) * selectedCount * (isAllSelected ? 0.9 : 1) * registrantMultiplier
              : 0
            ).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Invoice notice */}
      <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1.5">
        <div className="flex items-start space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
          <span>{dict.summary.invoiceNotice}</span>
        </div>
      </div>
    </aside>
  );
}