"use client";

import { useState, useMemo } from "react";
import { CourseViewDict } from "@/dictionaries/types";
import { CourseHeader } from "./CourseHeader";
import { CourseFilters } from "./CourseFilters";
import { CourseList } from "./CourseList";
import { Course } from "./types";
import { ShieldCheck } from "lucide-react";

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
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen pb-12 font-sans">
      {/* Official HK Governance Portal Sub-Header */}
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-5">
        <CourseHeader dict={dict} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          <CourseFilters
            dict={dict}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            minCpdHours={minCpdHours}
            setMinCpdHours={setMinCpdHours}
            categories={categories}
            clearFilters={clearFilters}
          />

          <CourseList
            courses={filteredCourses}
            dict={dict}
            currentLocale={currentLocale}
            onClearFilters={clearFilters}
          />
        </div>
      </div>
    </div>
  );
}
