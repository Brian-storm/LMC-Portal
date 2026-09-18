"use client";

import type { EnrollPageDict } from "@/dictionaries/types";

interface ProgressTrackerProps {
  step: 1 | 2 | 3 | 4;
  dict: EnrollPageDict;
}

export function ProgressTracker({ step, dict }: ProgressTrackerProps) {
  return (
    <div className="bg-white border border-slate-300 p-4 shadow-2xs">
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold uppercase tracking-wider">
        {([1, 2, 3, 4] as const).map((n) => {
          const titleKey = `step${n}Title` as keyof EnrollPageDict;
          return (
            <div
              key={n}
              className={`pb-2 border-b-2 flex items-center justify-center space-x-1.5 ${
                step >= n
                  ? "border-primary text-primary"
                  : "border-slate-200 text-slate-400"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-100 border border-current flex items-center justify-center text-[10px]">
                {n}
              </span>
              <span className="hidden sm:inline">{dict[titleKey] as string}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}