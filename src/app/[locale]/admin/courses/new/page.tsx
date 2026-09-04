"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Construction,
} from "lucide-react";

export default function NewCourseModulePlaceholder() {
  const params = useParams();
  const locale = (params.locale as string) || "en";

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-slate-300 p-6 shadow-2xs space-y-5 text-center border-t-4 border-t-[#1b4332]">
        {/* Status Badge */}
        <div className="inline-flex items-center space-x-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 text-xs font-mono rounded-xs">
          <Construction className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>Module Under Development</span>
        </div>

        {/* Header & Description */}
        <div className="space-y-2">
          <h1 className="text-xl font-serif font-bold text-[#1b4332]">
            New Course Module
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            The course creation form is currently being built. You will be able
            to add new CPD course modules with syllabus, schedules, instructors,
            and pricing once this module is complete.
          </p>
        </div>

        {/* Information Box */}
        <div className="bg-slate-50 border border-slate-200 p-3 text-left space-y-1.5 text-[11px] text-slate-500 font-mono">
          <div className="flex justify-between">
            <span>Status Code:</span>
            <span className="font-bold text-slate-800">
              404 / NOT_CONFIGURED
            </span>
          </div>
          <div className="flex justify-between">
            <span>Reference ID:</span>
            <span className="font-bold text-slate-800">MOD-PENDING-2026</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <Link
            href={`/${locale}/admin/courses`}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-3 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Courses</span>
          </Link>
          <Link
            href={`/${locale}/admin`}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 bg-[#1b4332] hover:bg-[#112a1f] text-white font-bold px-3 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}