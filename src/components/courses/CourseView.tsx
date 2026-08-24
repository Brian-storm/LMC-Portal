"use client";

import { useState, useMemo } from "react";
import { CourseViewDict } from "@/dictionaries/types";
import { CourseHeader } from "./CourseHeader";
import { CourseFilters } from "./CourseFilters";
import { CourseList } from "./CourseList";

interface Course {
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
