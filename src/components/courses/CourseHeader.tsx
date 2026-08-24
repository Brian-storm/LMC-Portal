import { Building2, ShieldCheck } from "lucide-react";
import { CourseViewDict } from "@/dictionaries/types";

interface CourseHeaderProps {
  dict: CourseViewDict;
}

export function CourseHeader({ dict }: CourseHeaderProps) {
  return (
    <header className="border-b-2 border-slate-900 pb-4 bg-white p-5 border-t-4 border-t-[#1b4332] shadow-2xs">
      <div className="flex items-center space-x-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase mb-2">
        <Building2 className="w-3.5 h-3.5 text-[#1b4332]" />
        <span>{dict.sectionTag}</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1b4332] tracking-tight">
            {dict.catalogTitle}
          </h1>
          <p className="mt-1 text-slate-600 text-xs sm:text-sm max-w-4xl leading-relaxed">
            {dict.catalogDescription}
          </p>
        </div>
        <div className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xs text-[11px] font-medium text-emerald-950">
          <ShieldCheck className="w-4 h-4 text-[#1b4332]" />
          <span>{dict.regulatoryComplianceBadge}</span>
        </div>
      </div>
    </header>
  );
}
