import Link from "next/link";
import { Clock, User, MapPin, Award, ArrowRight, FileText } from "lucide-react";
import { CourseViewDict } from "@/dictionaries/types";
import { Course } from "./types";

interface CourseCardProps {
  course: Course;
  dict: CourseViewDict;
  currentLocale: string;
}

export function CourseCard({ course, dict, currentLocale }: CourseCardProps) {
  const targetSlug = course.slug || course.id;
  const formattedFee =
    course.fee ??
    (course.feeHKD ? `HK$ ${course.feeHKD.toLocaleString()}` : dict.free);

  return (
    <article className="bg-white border border-slate-300 hover:border-[#1b4332] rounded-xs shadow-2xs transition-all duration-150 relative overflow-hidden">
      {/* Top Governance Bar */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-1.5 flex flex-wrap items-center justify-between text-[10px] gap-2">
        <div className="flex items-center space-x-2 font-mono text-slate-600">
          <span className="font-bold text-slate-800">{dict.iaRef}</span>
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
            <Link href={`/${currentLocale}/courses/${targetSlug}`}>
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
                  `${dict.deliveryMode}: ${course.deliveryMode || "Online"}`}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">
                {course.speaker ||
                  `${dict.language}: ${course.language || "English"}`}
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

            {course.seatsLeft !== undefined && course.seatsLeft <= 5 && (
              <span className="block text-[10px] text-red-700 font-bold uppercase tracking-wider">
                {dict.quotaRemaining} {course.seatsLeft} {dict.seats}
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
}
