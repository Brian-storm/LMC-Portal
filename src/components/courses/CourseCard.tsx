import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  User,
  MapPin,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  ImageIcon,
  DollarSign,
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
    <article className="group bg-white border border-slate-300 hover:border-primary rounded-xs shadow-2xs transition-all duration-150 relative overflow-hidden pl-1">
      {/* ------------------------------------------------------------------ */}
      {/* 1. STATUTORY ACCENT PILLAR                                         */}
      {/* Visual anchor bar signaling an accredited regulatory entry         */}
      {/* ------------------------------------------------------------------ */}
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary transition-colors group-hover:bg-primary" />

      {/* ------------------------------------------------------------------ */}
      {/* 2. REGISTRATION & ACCREDITATION HEADER BAR                          */}
      {/* Displays official reference codes, authority body & core flags    */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1 flex flex-wrap items-center justify-between text-xs gap-1.5 font-mono">
        {/* IA Reference Code Section */}
        <div className="flex items-center space-x-1.5 text-slate-600">
          <span className="font-bold text-slate-700 tracking-wider uppercase">
            {dict.iaRef}:
          </span>
          <span className="bg-white px-1 py-0.2 border border-slate-300 text-slate-900 font-bold tracking-tight text-xs">
            {course.iaCode || course.id}
          </span>
        </div>

        {/* Accreditation Body & Mandatory Core Badge */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-600 font-medium uppercase tracking-tight text-xs">
            {course.accreditationBody || dict.certificateBadge}
          </span>
          {course.isMandatory && (
            <span className="bg-amber-100 text-amber-900 font-bold px-1 py-0.2 border border-amber-300 uppercase tracking-wider flex items-center gap-0.5 text-[10px]">
              <ShieldAlert className="w-3 h-3 shrink-0" />
              <span>{dict.coreRegulatoryRequirement}</span>
            </span>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. CARD CONTENT BODY                                               */}
      {/* Primary title, accredited domain category, and description text   */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-3 sm:p-3.5 flex flex-col md:flex-row gap-3">
        {/* ------------------------------------------------------------------ */}
        {/* 3A. POSTER-SIZED COURSE IMAGE — 1/3 WIDTH                        */}
        {/* Poster image at 2205×3305 portrait aspect ratio (≈2:3)            */}
        {/* ------------------------------------------------------------------ */}
        <div className="w-1/3 shrink-0">
          {course.imageUrl ? (
            <div className="relative w-full aspect-[2205/3305] bg-slate-200 overflow-hidden rounded-xs">
              <Image
                src={course.imageUrl}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ) : (
            <div className="w-full aspect-[2205/3305] bg-slate-100 border border-slate-200 rounded-xs flex flex-col items-center justify-center text-slate-400 gap-1.5">
              <ImageIcon className="w-6 h-6" />
              <span
                className="font-mono text-xs text-slate-400 uppercase tracking-wider text-center px-1"
              >
                {dict.poster}
              </span>
            </div>
          )}
        </div>

        {/* Course Core Details Column — 2/3 width */}
        <div className="w-2/3 space-y-1.5">
          {/* IA Scheme Label — "保險中介人持續專業培訓計劃" badge */}
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs border border-slate-300">
              {dict.iaSchemeLabel}
            </span>
          </div>

          {/* Official Course Title Link */}
          <h2 className="text-sm sm:text-base font-serif font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug">
            <Link
              href={`/${currentLocale}/courses/${targetSlug}`}
              className="hover:underline flex items-start gap-1"
            >
              <span>{course.title}</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400 inline shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
            </Link>
          </h2>

          {/* Executive Overview Summary */}
          <p className="text-slate-600 text-xs leading-normal border-l-2 border-slate-300 pl-2 py-0.5 my-1">
            {course.description}
          </p>

          {/* -------------------------------------------------------------- */}
          {/* 4. INSTITUTIONAL METADATA GRID                                 */}
          {/* Structured Key-Value specification grid for course details     */}
          {/* -------------------------------------------------------------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-3 pt-1 text-xs font-mono text-slate-700 bg-slate-50/80 p-1.5 border border-slate-200 rounded-xs">
            {/* Delivery Mode / Date */}
            <div className="flex items-start space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold leading-none mb-0.5">
                  {dict.deliveryMode}
                </span>
                <span className="font-semibold text-slate-900">
                  {(dict.deliveryModeValues as Record<string, string>)?.[
                    course.deliveryMode
                  ] ?? course.deliveryMode}
                </span>
              </div>
            </div>

            {/* Faculty / Language Parameter */}
            <div className="flex items-start space-x-1.5">
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold leading-none mb-0.5">
                  {dict.language}
                </span>
                <span className="truncate block font-semibold text-slate-900">
                  {(dict.languageValues as Record<string, string>)?.[
                    course.language
                  ] ?? course.language}
                </span>
              </div>
            </div>

            {/* Optional Instructor / Speaker Parameter */}
            {course.speaker && (
              <div className="flex items-start space-x-1.5">
                <User className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold leading-none mb-0.5">
                    {dict.labels?.instructor}
                  </span>
                  <span className="truncate block font-semibold text-slate-900">
                    {course.speaker}
                  </span>
                </div>
              </div>
            )}

            {/* Optional Physical Venue Parameter */}
            {course.venue && (
              <div className="flex items-start space-x-1.5 sm:col-span-2 pt-1 border-t border-slate-200/60">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold leading-none mb-0.5">
                    {dict.labels?.venue}
                  </span>
                  <span className="truncate block font-semibold text-slate-900">
                    {course.venue}
                  </span>
                </div>
              </div>
            )}

            {/* Fee line — always visible in the grid */}
            <div className="flex items-start space-x-1.5 sm:col-span-2 pt-1 border-t border-slate-200/60">
              <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <div className="truncate">
                <span className="text-[10px] text-slate-400 uppercase block font-semibold leading-none mb-0.5">
                  {dict.fee}
                </span>
                <span className="truncate block font-semibold text-slate-900 text-xs">
                  {course.feeBreakdown ?? formattedFee}
                </span>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* 5B. CTA BUTTONS                                               */}
          {/* -------------------------------------------------------------- */}
          <div className="flex items-center gap-1 pt-1">
            <Link
              href={`/${currentLocale}/courses/${targetSlug}`}
              className="inline-flex items-center justify-center space-x-1 bg-primary hover:bg-primary/80 active:bg-primary/90 text-primary-foreground font-mono font-bold px-1.5 py-0.5 uppercase tracking-wider transition-colors rounded-xs shadow-2xs border border-primary/40 text-xs leading-none"
            >
              <span>{dict.viewCourse}</span>
              <ArrowRight className="w-2.5 h-2.5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
