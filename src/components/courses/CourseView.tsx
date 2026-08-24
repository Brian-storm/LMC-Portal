"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  Clock,
  Award,
  User,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
} from "lucide-react";
import { CourseViewDict } from "@/dictionaries/types";

export interface Course {
  id: string;
  slug?: string;
  title: string;
  category: "cpd" | "compliance" | "management" | string;
  description: string;
  cpdHours: number | string;
  iaCode?: string;
  date?: string;
  venue?: string;
  speaker?: string;
  deliveryMode?: string;
  language?: string;
  feeHKD?: number;
  fee?: string;
  seatsLeft?: number;
  accreditationBody?: string;
  isMandatory?: boolean;
}

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minCpdHours, setMinCpdHours] = useState<number>(0);

  const categories = [
    { id: "all", label: dict.filterAll },
    { id: "cpd", label: dict.filterCPD },
    { id: "compliance", label: dict.filterCompliance },
    { id: "management", label: dict.filterManagement },
  ];

  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.iaCode &&
          course.iaCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.speaker &&
          course.speaker.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;

      const numericCpd =
        typeof course.cpdHours === "number"
          ? course.cpdHours
          : parseFloat(course.cpdHours) || 0;

      const matchesCpd = numericCpd >= minCpdHours;

      return matchesSearch && matchesCategory && matchesCpd;
    });
  }, [initialCourses, searchTerm, selectedCategory, minCpdHours]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setMinCpdHours(0);
  };

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-6 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* ================= GOVERNANCE BREADCRUMB & HEADER ================= */}
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

        {/* ================= MAIN CONTENT LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          {/* LEFT SIDEBAR: INSTITUTIONAL FILTERS */}
          <aside className="lg:col-span-1 bg-white border border-slate-300 rounded-xs p-4 space-y-4 shadow-2xs lg:sticky lg:top-16">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <div className="flex items-center space-x-1.5 text-[#1b4332] font-bold text-xs uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5" />
                <span>{dict.searchCriteria}</span>
              </div>
              {(searchTerm ||
                selectedCategory !== "all" ||
                minCpdHours > 0) && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] text-slate-500 hover:text-red-700 uppercase font-semibold flex items-center space-x-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>{dict.resetAll}</span>
                </button>
              )}
            </div>

            {/* Keyword Search */}
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

            {/* Minimum CPD Hours Slider */}
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

          {/* RIGHT MAIN LISTINGS */}
          <main className="lg:col-span-3 space-y-3">
            {/* Status Bar */}
            <div className="bg-white border border-slate-300 px-3.5 py-2 flex justify-between items-center text-xs text-slate-600 shadow-2xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-emerald-600 rounded-full inline-block"></span>
                <span>{dict.activeRegister}</span>
              </div>
              <span>
                {dict.totalListings}{" "}
                <strong className="text-slate-900">
                  {filteredCourses.length}
                </strong>
              </span>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="bg-white border border-slate-300 rounded-xs p-10 text-center space-y-2">
                <p className="text-slate-600 text-xs font-medium">
                  {dict.emptyState}
                </p>
                <button
                  onClick={clearFilters}
                  className="inline-block text-xs font-bold text-[#1b4332] hover:underline uppercase tracking-wider"
                >
                  {dict.resetSearchParameters}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCourses.map((course) => {
                  const targetSlug = course.slug || course.id;
                  const formattedFee =
                    course.fee ??
                    (course.feeHKD
                      ? `HK$ ${course.feeHKD.toLocaleString()}`
                      : dict.free);

                  return (
                    <article
                      key={course.id}
                      className="bg-white border border-slate-300 hover:border-[#1b4332] rounded-xs shadow-2xs transition-all duration-150 relative overflow-hidden"
                    >
                      {/* Top Governance Bar */}
                      <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex flex-wrap items-center justify-between text-[10px] gap-2">
                        <div className="flex items-center space-x-2 font-mono text-slate-600">
                          <span className="font-bold text-slate-800">
                            {dict.iaRef}
                          </span>
                          <span className="bg-white px-1.5 py-0.2 border border-slate-300 text-slate-900 font-semibold">
                            {course.iaCode || `REF-${course.id}`}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-slate-600 font-medium border-r border-slate-300 pr-2">
                            {course.accreditationBody || dict.certificateBadge}
                          </span>
                          {course.isMandatory && (
                            <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 border border-amber-300 uppercase tracking-wider">
                              {dict.coreRegulatoryRequirement}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                        {/* Course Details */}
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-[#1b4332]/10 text-[#1b4332] text-[10px] font-bold uppercase tracking-wider rounded-xs border border-[#1b4332]/20">
                              {course.category}
                            </span>
                          </div>

                          <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900 hover:text-[#1b4332] transition-colors leading-snug">
                            <Link
                              href={`/${currentLocale}/courses/${targetSlug}`}
                            >
                              {course.title}
                            </Link>
                          </h2>

                          <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed border-l-2 border-slate-200 pl-2.5 my-1">
                            {course.description}
                          </p>

                          {/* Formal Metadata Table */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 pt-2 text-[11px] text-slate-700 bg-slate-50 p-2.5 border border-slate-200 rounded-xs">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="font-medium text-slate-900">
                                {course.date ||
                                  `${dict.deliveryMode}: ${
                                    course.deliveryMode || "Online"
                                  }`}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">
                                {course.speaker ||
                                  `${dict.language}: ${
                                    course.language || "English"
                                  }`}
                              </span>
                            </div>

                            {course.venue && (
                              <div className="flex items-center space-x-2 sm:col-span-2">
                                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="truncate">{course.venue}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Panel: Fee & Enrolment */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 min-w-[150px] shrink-0 gap-3 self-stretch md:self-auto">
                          <div className="text-left md:text-right space-y-1">
                            <div className="inline-flex items-center space-x-1 text-[#1b4332] font-bold text-xs bg-emerald-50/80 px-2 py-0.5 border border-emerald-200">
                              <Award className="w-3.5 h-3.5 text-[#1b4332]" />
                              <span>
                                {course.cpdHours} {dict.cpdHours}
                              </span>
                            </div>

                            <div className="text-lg font-bold font-serif text-slate-900">
                              {formattedFee}
                            </div>

                            {course.seatsLeft !== undefined &&
                              course.seatsLeft <= 5 && (
                                <span className="block text-[10px] text-red-700 font-bold uppercase tracking-wider">
                                  {dict.quotaRemaining} {course.seatsLeft}{" "}
                                  {dict.seats}
                                </span>
                              )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/${currentLocale}/courses/${targetSlug}`}
                              className="inline-flex items-center space-x-1.5 bg-[#1b4332] hover:bg-[#112a1f] text-white font-bold px-3.5 py-1.5 text-xs uppercase tracking-wider transition-colors rounded-xs shadow-2xs border border-[#0d2118]"
                            >
                              <span>{dict.enrollCta}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>

                            <button
                              type="button"
                              className="p-1.5 border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors rounded-xs"
                              title={dict.downloadBrochure}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
