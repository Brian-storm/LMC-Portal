"use client";

import React from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  Tag,
  User,
} from "lucide-react";
import type { EnrollPageDict } from "@/dictionaries/types";
import type { Schedule } from "./types";

interface ScheduleSelectionStepProps {
  schedules: Schedule[];
  selectedScheduleIds: string[];
  dict: EnrollPageDict;
  locale: string;
  onToggle: (scheduleId: string) => void;
  onBack: () => void;
  onProceed: () => void;
}

export function ScheduleSelectionStep({
  schedules,
  selectedScheduleIds,
  dict,
  locale,
  onToggle,
  onBack,
  onProceed,
}: ScheduleSelectionStepProps) {
  const totalSessions = schedules.length;
  const selectedCount = selectedScheduleIds.length;
  const isAllSelected = selectedCount === totalSessions && totalSessions > 0;

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b border-slate-200">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <span>{dict.step2.title}</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{dict.step2.subtitle}</p>
      </div>

      {/* Empty state */}
      {schedules.length === 0 && (
        <div className="bg-slate-50 border border-slate-300 p-4 rounded-xs text-center text-xs text-slate-500">
          <Calendar className="w-5 h-5 mx-auto mb-1 text-slate-400" />
          <p>{dict.step2.noSessions}</p>
        </div>
      )}

      {/* Schedule list */}
      <div className="space-y-2.5">
        {schedules.map((sch, idx) => {
          const datePrefix = sch.dateAndTime.match(/^(\d{2}\/\d{2}\/\d{4})/)?.[1] ?? "";
          const prevDatePrefix =
            idx > 0
              ? schedules[idx - 1].dateAndTime.match(/^(\d{2}\/\d{2}\/\d{4})/)?.[1] ?? ""
              : "";
          const isNewDateGroup = idx === 0 || datePrefix !== prevDatePrefix;
          const isSelected = selectedScheduleIds.includes(sch.id);
          const isFull = sch.quotaRemaining <= 0;
          const syllabusItem = sch.topics[0]?.syllabusItem;
          const moduleTitle = syllabusItem
            ? locale === "en"
              ? syllabusItem.titleEn
              : syllabusItem.titleZh
            : "";
          const moduleTopics = syllabusItem
            ? locale === "en"
              ? syllabusItem.topicsEn
              : syllabusItem.topicsZh
            : [];

          return (
            <React.Fragment key={sch.id}>
              {isNewDateGroup && (
                <div className="flex items-center gap-3 pt-1 pb-0.5">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-bold text-slate-500 font-mono tracking-wider uppercase">
                    {datePrefix}
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
              )}
              <button
                type="button"
                disabled={isFull}
                onClick={() => onToggle(sch.id)}
                className={`w-full text-left p-3 rounded-xs border transition-colors ${
                  isSelected
                    ? "bg-primary/5 border-primary"
                    : isFull
                      ? "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed"
                      : "bg-white border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isFull}
                    readOnly
                    className="accent-primary shrink-0 mt-1 pointer-events-none"
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    {/* Topic header */}
                    {syllabusItem && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                          <BookOpen className="w-4 h-4 text-primary shrink-0" />
                          <span className="leading-snug">{moduleTitle}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[14px] font-mono text-slate-500 no-scale pb-0.5">
                            {syllabusItem.duration} {dict.step2.durationUnit}
                          </span>
                          <ul className="space-y-0.5">
                            {moduleTopics.map((topic, i) => (
                              <li
                                key={i}
                                className="text-xs text-slate-600 flex items-start gap-1"
                              >
                                <span className="text-primary select-none shrink-0 leading-tight">
                                  •
                                </span>
                                <span className="leading-tight">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {/* Schedule info */}
                    <div className="pt-2 border-t border-slate-200 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>{sch.dateAndTime}</span>
                      </div>
                      {sch.instructor && (
                        <div className="flex items-start gap-1.5 text-xs text-slate-600 pt-0.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <div className="leading-snug">
                            <span className="font-semibold text-slate-700">
                              {sch.instructor.name}
                            </span>
                            {sch.instructor.title && <> — {sch.instructor.title}</>}
                            {sch.instructor.bio && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {sch.instructor.bio}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Full badge */}
                  <div className="shrink-0 text-right">
                    {isFull && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs border bg-rose-50 text-rose-800 border-rose-300">
                        Full
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Selection feedback */}
      {selectedCount > 0 && (
        <div
          className={`text-xs font-semibold flex items-center gap-1.5 ${
            isAllSelected ? "text-emerald-700" : "text-slate-600"
          }`}
        >
          {isAllSelected ? (
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Calendar className="w-3.5 h-3.5" />
          )}
          <span>
            {selectedCount} / {totalSessions} {dict.step2.sessionsSelected}
            {isAllSelected && ` — ${dict.step2.allSessionsSelected}`}
          </span>
        </div>
      )}

      {selectedCount === 0 && (
        <p className="text-xs text-rose-600 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {dict.step2.selectAtLeastOne}
        </p>
      )}

      {/* Navigation buttons */}
      <div className="pt-4 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs uppercase font-bold tracking-wider rounded-xs"
        >
          {dict.step2.backButton}
        </button>
        <button
          type="button"
          disabled={selectedCount === 0}
          onClick={onProceed}
          className="inline-flex items-center space-x-1.5 bg-primary hover:bg-primary/80 disabled:opacity-50 text-primary-foreground font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors"
        >
          <span>{dict.step2.proceedButton}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}