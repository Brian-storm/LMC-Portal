import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  User,
  MapPin,
  Award,
  ArrowRight,
  FileText,
  ExternalLink,
  ShieldAlert,
  ImageIcon,
} from "lucide-react";
import { CourseViewDict } from "@/dictionaries/types";
import { Course } from "./types";

interface CourseCardProps {
  /** Course data payload following HK IA compliance structures */
  course: Course;
  /** Dictionary translation keys for localized UI strings */
  dict: CourseViewDict;
  /** Active locale code (e.g., "en", "zh-HK") for route prefixing */
  currentLocale: string;
}

/**
 * CourseCard Component
 * Renders an individual course entry formatted in a strict institutional/statutory
 * HK governance registry style with compact typography.
 */
export function CourseCard({ course, dict, currentLocale }: CourseCardProps) {
  // Resolve unique identifier slug for Next.js dynamic routing
  const targetSlug = course.slug || course.id;

  // Format fee value with fallback logic for local currency (HKD) or free courses
  const formattedFee =
    course.fee ??
    (course.feeHKD ? `HK$ ${course.feeHKD.toLocaleString()}` : dict.free);

  return (
    <article className="group bg-white border border-slate-300 hover:border-[#1b4332] rounded-xs shadow-2xs transition-all duration-150 relative overflow-hidden pl-1">
      {/* ------------------------------------------------------------------ */}
      {/* 1. STATUTORY ACCENT PILLAR                                         */}
      {/* Visual anchor bar signaling an accredited regulatory entry         */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-[#1b4332] transition-colors group-hover:bg-[#0d2118]" />

      {/* ------------------------------------------------------------------ */}
      {/* 2. REGISTRATION & ACCREDITATION HEADER BAR                          */}
      {/* Displays official reference codes, authority body & core flags    */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1 flex flex-wrap items-center justify-between text-[9px] gap-1.5 font-mono">
        {/* IA Reference Code Section */}
        <div className="flex items-center space-x-1.5 text-slate-600">
          <span className="font-bold text-slate-700 tracking-wider uppercase">
            {dict.iaRef}:
          </span>
          <span className="bg-white px-1 py-0.2 border border-slate-300 text-slate-900 font-bold tracking-tight text-[9px]">
            {course.iaCode || `REF-${course.id}`}
          </span>
        </div>

        {/* Accreditation Body & Mandatory Core Badge */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-600 font-medium uppercase tracking-tight text-[9px]">
            {course.accreditationBody || dict.certificateBadge}
          </span>
          {course.isMandatory && (
            <span className="bg-amber-100 text-amber-900 font-bold px-1 py-0.2 border border-amber-300 uppercase tracking-wider flex items-center gap-0.5 text-[8.5px]">
              <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
              <span>{dict.coreRegulatoryRequirement}</span>
            </span>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. CARD CONTENT BODY                                               */}
      {/* Primary title, accredited domain category, and description text   */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-3 sm:p-3.5 flex flex-col md:flex-row md:items-stretch justify-between gap-3">
        {/* ------------------------------------------------------------------ */}
        {/* 3A. POSTER-SIZED COURSE IMAGE                                      */}
        {/* Leftmost visual column — swap with public S3 URL via imageUrl      */}
        {/* ------------------------------------------------------------------ */}
        <div className="w-[120px] shrink-0 self-stretch">
          {course.imageUrl ? (
            <div className="relative w-full h-full min-h-[160px] bg-slate-200 overflow-hidden rounded-xs">
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>
          ) : (
            <div className="w-full h-full min-h-[160px] bg-slate-100 border border-slate-200 rounded-xs flex flex-col items-center justify-center text-slate-400 gap-1.5">
              <ImageIcon className="w-6 h-6" />
              <span
                className="font-mono text-[9px] text-slate-400 uppercase tracking-wider text-center px-1"
              >
                Poster
              </span>
            </div>
          )}
        </div>

        {/* Course Core Details Column */}
        <div className="space-y-1.5 flex-1">
          {/* Accredited Category Badge */}
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-800 text-[8.5px] font-mono font-bold uppercase tracking-wider rounded-xs border border-slate-300">
              {(dict.categoryValues as Record<string, string>)?.[course.category] ?? course.category}
            </span>
          </div>

          {/* Official Course Title Link */}
          <h2 className="text-xs sm:text-sm font-serif font-bold text-slate-900 group-hover:text-[#1b4332] transition-colors leading-snug">
            <Link
              href={`/${currentLocale}/courses/${targetSlug}`}
              className="hover:underline flex items-start gap-1"
            >
              <span>{course.title}</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400 inline shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
            </Link>
          </h2>

          {/* Executive Overview Summary */}
          <p className="text-slate-600 text-[10.5px] line-clamp-2 leading-normal border-l-2 border-slate-300 pl-2 py-0.5 my-1">
            {course.description}
          </p>

          {/* -------------------------------------------------------------- */}
          {/* 4. INSTITUTIONAL METADATA GRID                                 */}
          {/* Structured Key-Value specification grid for course details     */}
          {/* -------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-3 pt-1 text-[9.5px] font-mono text-slate-700 bg-slate-50/80 p-1.5 border border-slate-200 rounded-xs">
            {/* Delivery Mode / Date */}
            <div className="flex items-start space-x-1.5">
              <Clock className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[8px] text-slate-400 uppercase block font-semibold leading-none mb-0.5">
                  {dict.deliveryMode}
                </span>
                <span className="font-semibold text-slate-900">
                  {(course.date ??
                    ((dict.deliveryModeValues as Record<string, string>)?.[
                      course.deliveryMode
                    ] ?? course.deliveryMode))}
                </span>
              </div>
            </div>

            {/* Faculty / Language Parameter */}
            <div className="flex items-start space-x-1.5">
              <User className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
              <div className="truncate">
                <span className="text-[8px] text-slate-400 uppercase block font-semibold leading-none mb-0.5">
                  {dict.language}
                </span>
                <span className="truncate block font-semibold text-slate-900">
                  {(course.speaker ??
                    ((dict.languageValues as Record<string, string>)?.[
                      course.language
                    ] ?? course.language))}
                </span>
              </div>
            </div>

            {/* Optional Physical Venue Parameter */}
            {course.venue && (
              <div className="flex items-start space-x-1.5 sm:col-span-2 pt-1 border-t border-slate-200/60">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                <div className="truncate">
                  <span className="text-[8px] text-slate-400 uppercase block font-semibold leading-none mb-0.5">
                    VENUE
                  </span>
                  <span className="truncate block font-medium text-slate-800">
                    {course.venue}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 5. RIGHT PANEL: CPD HOURS, FEES & REGISTRATION CTAS                */}
        {/* Financial info, regulatory credit badge, and direct view trigger  */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-3.5 min-w-[140px] shrink-0 gap-2">
          {/* Fee & CPD Accreditation Badges */}
          <div className="text-left md:text-right space-y-0.5 font-mono">
            {/* Accredited CPD Hour Badge */}
            <div className="inline-flex items-center space-x-1 text-[#1b4332] font-bold text-[8.5px] bg-emerald-50 px-1.5 py-0.5 border border-emerald-300 rounded-xs">
              <Award className="w-2.5 h-2.5 text-[#1b4332] shrink-0" />
              <span>
                {course.cpdHours} {dict.cpdHours}
              </span>
            </div>

            {/* Course Fee Display */}
            <div className="text-sm font-serif font-bold text-slate-900 pt-0.5">
              {formattedFee}
            </div>

            {/* Low Quota Warning Threshold Alert */}
            {course.seatsLeft !== undefined && course.seatsLeft <= 5 && (
              <span className="block text-[8px] text-rose-700 font-bold uppercase tracking-wider bg-rose-50 px-1 py-0.2 border border-rose-200">
                {dict.quotaRemaining} {course.seatsLeft}{" "}
                {dict.seats}
              </span>
            )}
          </div>

          {/* Action Control Trigger Buttons */}
          <div className="flex items-center gap-1 w-full md:w-auto">
            {/* Action Control Trigger Buttons */}
            <div className="flex items-center gap-1 w-full md:w-auto">
              {/* Direct Official Navigation CTA */}
              <Link
                href={`/${currentLocale}/courses/${targetSlug}`}
                className="flex-1 md:flex-none inline-flex items-center justify-center space-x-1 bg-[#1b4332] hover:bg-[#112a1f] active:bg-[#091711] text-white font-mono font-bold px-2 py-1 uppercase tracking-wider transition-colors rounded-xs shadow-2xs border border-[#0d2118]"
                style={{ fontSize: "12px", lineHeight: "12px" }}
              >
                <span>{dict.viewCourse}</span>
                <ArrowRight className="w-2.5 h-2.5 shrink-0" />
              </Link>
            </div>

            {/* Secondary Syllabus Brochure Download Trigger */}
            <a
              href={`/api/courses/${targetSlug}/brochure?locale=${currentLocale}`}
              download
              className="p-1 border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors rounded-xs bg-slate-50 inline-flex items-center"
              title={dict.downloadBrochure}
            >
              <FileText className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
