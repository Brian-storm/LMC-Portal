/**
 * CourseList — 課程列表容器。
 *
 * 四種顯示狀態（依優先順序）：
 * 1. Error：API 請求失敗，顯示錯誤訊息 + Retry 按鈕
 * 2. Loading：骨架動畫卡片（3 張）+ 旋轉圖示
 * 3. Empty：無符合條件的課程，顯示 `dict.emptyState` + 重置篩選按鈕
 * 4. List：課程卡片列表 + 可選的 Load More 分頁按鈕
 *
 * `SkeletonCard` 為純展示用內部元件，無 props，僅用於佔位動畫。
 */

import { CourseViewDict } from "@/dictionaries/types";
import { Course } from "./types";
import { CourseCard } from "./CourseCard";
import { Loader2, AlertCircle, ChevronDown } from "lucide-react";

interface CourseListProps {
  courses: Course[];
  dict: CourseViewDict;
  currentLocale: string;
  onClearFilters: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
}

function SkeletonCard() {
  return (
    <article className="bg-white border border-slate-300 rounded-xs p-3.5 animate-pulse">
      <div className="flex items-center space-x-2 mb-2">
        <div className="h-3 w-20 bg-slate-200 rounded" />
        <div className="h-3 w-16 bg-slate-200 rounded" />
      </div>
      <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-full bg-slate-200 rounded mb-1" />
      <div className="h-3 w-2/3 bg-slate-200 rounded mb-3" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-8 bg-slate-200 rounded" />
        <div className="h-8 bg-slate-200 rounded" />
      </div>
    </article>
  );
}

export function CourseList({
  courses,
  dict,
  currentLocale,
  onClearFilters,
  isLoading = false,
  error = null,
  onRetry,
  hasMore = false,
  onLoadMore,
  totalCount,
}: CourseListProps) {
  return (
    <main className="lg:col-span-3 space-y-3">
      <div className="bg-white border border-slate-300 px-3.5 py-2 flex justify-between items-center text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-emerald-600 rounded-full inline-block" />
          <span>{dict.activeRegister}</span>
        </div>
        <span>
          {dict.totalListings}{" "}
          <strong className="text-slate-900">
            {totalCount ?? courses.length}
          </strong>
        </span>
      </div>

      {error ? (
        <div className="bg-white border border-slate-300 rounded-xs p-10 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-slate-600 text-xs font-medium">{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-1 text-xs font-bold text-[#1b4332] hover:underline uppercase tracking-wider"
          >
            <span>Retry</span>
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
          </div>
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white border border-slate-300 rounded-xs p-10 text-center space-y-2">
          <p className="text-slate-600 text-xs font-medium">
            {dict.emptyState}
          </p>
          <button
            onClick={onClearFilters}
            className="inline-block text-xs font-bold text-[#1b4332] hover:underline uppercase tracking-wider"
          >
            {dict.resetSearchParameters}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              dict={dict}
              currentLocale={currentLocale}
            />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                onClick={onLoadMore}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white border border-slate-300 hover:border-[#1b4332] text-xs font-bold text-slate-700 hover:text-[#1b4332] uppercase tracking-wider rounded-xs shadow-2xs transition-colors"
              >
                <span>Load More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}