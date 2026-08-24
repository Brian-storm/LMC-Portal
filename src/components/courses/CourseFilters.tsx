import { Filter, Search, X, FileText } from "lucide-react";
import { CourseViewDict } from "@/dictionaries/types";

interface CategoryOption {
  id: string;
  label: string;
}

interface CourseFiltersProps {
  dict: CourseViewDict;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  minCpdHours: number;
  setMinCpdHours: (value: number) => void;
  categories: CategoryOption[];
  clearFilters: () => void;
}

export function CourseFilters({
  dict,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  minCpdHours,
  setMinCpdHours,
  categories,
  clearFilters,
}: CourseFiltersProps) {
  const hasActiveFilters =
    searchTerm || selectedCategory !== "all" || minCpdHours > 0;

  return (
    <aside className="lg:col-span-1 bg-white border border-slate-300 rounded-xs p-4 space-y-4 shadow-2xs lg:sticky lg:top-16">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
        <div className="flex items-center space-x-1.5 text-[#1b4332] font-bold text-xs uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5" />
          <span>{dict.searchCriteria}</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[10px] text-slate-500 hover:text-red-700 uppercase font-semibold flex items-center space-x-0.5 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>{dict.resetAll}</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
          {dict.keywordRefCode}
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={dict.searchPlaceholder}
            className="w-full bg-slate-50 border border-slate-300 rounded-xs pl-8 pr-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1b4332] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Category Radio Filters */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
          {dict.subjectArea}
        </label>
        <div className="space-y-1 bg-slate-50 border border-slate-200 p-2 rounded-xs">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900 transition-colors py-1"
            >
              <input
                type="radio"
                name="course-category"
                value={cat.id}
                checked={selectedCategory === cat.id}
                onChange={() => setSelectedCategory(cat.id)}
                className="border-slate-400 text-[#1b4332] focus:ring-0 accent-[#1b4332]"
              />
              <span className="text-[11px] font-medium">{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* CPD Range Slider */}
      <div className="space-y-1.5 pt-2 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
            {dict.cpdHoursMin}
          </label>
          <span className="text-xs font-bold text-[#1b4332] bg-emerald-50/80 px-1.5 py-0.5 border border-emerald-200/80">
            {minCpdHours} {minCpdHours === 1 ? dict.hour : dict.hours}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="12"
          step="1"
          value={minCpdHours}
          onChange={(e) => setMinCpdHours(Number(e.target.value))}
          className="w-full accent-[#1b4332] bg-slate-200 rounded-xs h-1 cursor-pointer"
        />
      </div>

      <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
        <div className="flex items-start space-x-1">
          <FileText className="w-3 h-3 shrink-0 text-slate-400 mt-0.5" />
          <span>{dict.filingNotice}</span>
        </div>
      </div>
    </aside>
  );
}
