/**
 * CoursesView — 課程目錄 Client Component。
 *
 * 狀態管理邏輯：
 * - `courses`：目前的完整課程列表（初始來自 server props，後續經由 client fetch 更新）
 * - `searchTerm`：關鍵字搜尋（client-side 即時過濾，不觸發 API）
 * - `selectedCategory` / `minCpdHours`：類別與 CPD 時數變更時觸發 `fetchCourses`，
 *   向 `/api/courses` 重新取得資料後再於 client 端做文字搜尋過濾
 * - `visibleCount`：分頁顯示筆數（每次 +10），透過 Load More 按鈕觸發
 * - `isLoading` / `error`：API 請求狀態，對應 CourseList 的載入骨架與錯誤提示
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { CourseViewDict } from "@/dictionaries/types";
import { CourseHeader } from "./CourseHeader";
import { CourseFilters } from "./CourseFilters";
import { CourseList } from "./CourseList";
import { Course } from "./types";
import { ShieldCheck } from "lucide-react";
import { mapApiCourse, ApiCourse } from "@/lib/map-course";

interface CoursesViewProps {
  dict: CourseViewDict;
  currentLocale: string;
  initialCourses?: Course[];
}

export function CoursesView({
  dict,
  currentLocale,
  initialCourses = [],
}: CoursesViewProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minCpdHours, setMinCpdHours] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState(10);

  const categories = [
    { id: "all", label: dict.filterAll },
    { id: "cpd", label: dict.filterCPD },
    { id: "compliance", label: dict.filterCompliance },
    { id: "management", label: dict.filterManagement },
  ];

  const fetchCourses = useCallback(
    async (params: {
      category?: string;
      cpdHoursMin?: number;
      page?: number;
      append?: boolean;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("locale", currentLocale);
        queryParams.set("limit", "100");
        if (params.category && params.category !== "all")
          queryParams.set("category", params.category);
        if (params.cpdHoursMin && params.cpdHoursMin > 0)
          queryParams.set("cpdHoursMin", String(params.cpdHoursMin));
        if (params.page) queryParams.set("page", String(params.page));

        const res = await fetch(`/api/courses?${queryParams}`);
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();

        const mapped = data.courses.map((c: ApiCourse) =>
          mapApiCourse(c, currentLocale),
        );

        if (params.append) {
          setCourses((prev) => [...prev, ...mapped]);
        } else {
          setCourses(mapped);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load courses",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentLocale],
  );

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSearchTerm("");
    setVisibleCount(10);
    fetchCourses({ category: value, cpdHoursMin: minCpdHours });
  };

  const handleCpdHoursChange = (value: number) => {
    setMinCpdHours(value);
    setSearchTerm("");
    setVisibleCount(10);
    fetchCourses({ category: selectedCategory, cpdHoursMin: value });
  };

  const handleRetry = () => {
    fetchCourses({ category: selectedCategory, cpdHoursMin: minCpdHours });
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courses;
    const term = searchTerm.toLowerCase();
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(term) ||
        course.description.toLowerCase().includes(term) ||
        (course.iaCode &&
          course.iaCode.toLowerCase().includes(term)) ||
        (course.speaker &&
          course.speaker.toLowerCase().includes(term)),
    );
  }, [courses, searchTerm]);

  const visibleCourses = useMemo(
    () => filteredCourses.slice(0, visibleCount),
    [filteredCourses, visibleCount],
  );

  const hasMore = visibleCount < filteredCourses.length;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setMinCpdHours(0);
    setVisibleCount(10);
    fetchCourses({});
  };

  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen pb-12 font-sans">
      <div className="bg-[#1b4332] text-white border-b-2 border-[#0d2118] px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-[#721185] shrink-0" />
            <span>
              HK CPD COMPLIANCE REGISTRY &bull; CONTINUING PROFESSIONAL
              DEVELOPMENT
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-200 text-3xs font-mono">
            <span>OFFICIAL REGISTER</span>
            <span>|</span>
            <span>HKSAR RECOGNIZED</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-5">
        <CourseHeader dict={dict} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          <CourseFilters
            dict={dict}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            minCpdHours={minCpdHours}
            setMinCpdHours={handleCpdHoursChange}
            categories={categories}
            clearFilters={clearFilters}
          />

          <CourseList
            courses={visibleCourses}
            dict={dict}
            currentLocale={currentLocale}
            onClearFilters={clearFilters}
            isLoading={isLoading}
            error={error}
            onRetry={handleRetry}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            totalCount={filteredCourses.length}
          />
        </div>
      </div>
    </div>
  );
}