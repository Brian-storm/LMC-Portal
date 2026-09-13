"use client";

import Link from "next/link";
import {
  Award,
  MapPin,
  FileText,
  Calendar,
  Building2,
  GraduationCap,
  Clock,
} from "lucide-react";
import { CourseViewDict, DetailedCourse, ScheduleSession } from "./types";
// Hidden sections (preserved for potential re-enable):
// import { CourseInstructors, CourseFaqs } from "./CourseHiddenSections";

interface CourseDetailViewProps {
  currentLocale: string;
  dict: CourseViewDict;
  course: DetailedCourse;
}

export function CourseDetailView({
  currentLocale,
  dict,
  course,
}: CourseDetailViewProps) {
  // Derive locale-aware fee description
  const feeDescription = currentLocale === "en"
    ? (course.feeDescriptionEn || course.feeDescriptionZh || course.feeDescriptionCn)
    : currentLocale === "zh-cn"
    ? (course.feeDescriptionCn || course.feeDescriptionZh || course.feeDescriptionEn)
    : (course.feeDescriptionZh || course.feeDescriptionCn || course.feeDescriptionEn);

  // Derive locale-aware certificate description
  const certificateDescription = currentLocale === "en"
    ? (course.certificateDescriptionEn || course.certificateDescriptionZh || course.certificateDescriptionCn)
    : currentLocale === "zh-cn"
    ? (course.certificateDescriptionCn || course.certificateDescriptionZh || course.certificateDescriptionEn)
    : (course.certificateDescriptionZh || course.certificateDescriptionCn || course.certificateDescriptionEn);

  const isEnrollable = course.status === "open" || course.status === "fewSeats";
  const targetSlug = course.slug || course.id;
  const enrollUrl = currentLocale
    ? `/${currentLocale}/courses/${targetSlug}/enroll`
    : `/courses/${targetSlug}/enroll`;

  // Build schedule-by-module map
  const scheduleByModuleId = new Map<string, ScheduleSession[]>();
  for (const sch of course.schedules) {
    for (const t of sch.topics) {
      const id = t.syllabusItem.id;
      if (!scheduleByModuleId.has(id)) {
        scheduleByModuleId.set(id, []);
      }
      scheduleByModuleId.get(id)!.push(sch);
    }
  }

  // Pick organizer / co-organizer (already localized by the mapper, no fallback
  // literals so missing DB data surfaces as empty instead of masking)
  const organizer = course.organizer ?? "";
  const coOrganizer = course.coOrganizer ?? "";

  return (
    <div className="bg-slate-100/80 min-h-screen py-6 sm:py-8 border-t border-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column — Main Content */}
          <div className="space-y-6 lg:col-span-2">
        {/* ================================================================== */}
        {/* 1. ORGANIZERS                                                      */}
        {/* ================================================================== */}
        <section className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs">
          <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-primary" />
            <span>{dict.sections?.organizers}</span>
          </h2>
          <div className="space-y-2 text-sm text-slate-700">
            {organizer && (
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-500 font-mono uppercase text-xs shrink-0 min-w-[80px]">{dict.organizerLabel}:</span>
                <span>{organizer}</span>
              </div>
            )}
            {coOrganizer && (
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-500 font-mono uppercase text-xs shrink-0 min-w-[80px]">{dict.coOrganizerLabel}:</span>
                <span>{coOrganizer}</span>
              </div>
            )}
          </div>
        </section>

        {/* ================================================================== */}
        {/* 2. COURSE TITLE & DESCRIPTION                                      */}
        {/* ================================================================== */}
        <header className="bg-white border border-slate-300 rounded-xs p-4 sm:p-6 shadow-2xs relative overflow-hidden pl-5">
          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-primary" />
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200 font-mono text-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="bg-slate-100 border border-slate-300 px-2 py-0.5 font-bold uppercase tracking-wider text-slate-800 rounded-xs"
                style={{ fontSize: "11.5px" }}
              >
                {dict.certificateBadge}
              </span>
              {course.iaRefNumber && (
                <span
                  className="bg-slate-50 border border-slate-300 text-slate-700 px-2 py-0.5 font-semibold tracking-tight rounded-xs"
                  style={{ fontSize: "11.5px" }}
                >
                  <span className="text-slate-400 font-bold mr-1">{dict.iaRef}:</span>
                  {course.iaRefNumber}
                </span>
              )}
            </div>
          </div>

          {/* Course Title with English subtitle rendered from description */}
          <h1 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 leading-snug tracking-tight">
            {course.title}
          </h1>
          <p className="mt-1 text-slate-500 text-sm font-mono italic">
            {dict.titleSubtitle}
          </p>
          <p
            className="mt-3 text-slate-700 border-l-2 border-slate-300 pl-3 py-0.5 leading-relaxed"
            style={{ fontSize: "14px" }}
          >
            {course.description}
          </p>

          {course.cpdRulesZh || course.cpdRulesEn || course.cpdRulesCn ? (
            <div className="mt-3 bg-amber-50/80 border border-amber-200 p-3 rounded-xs text-sm text-amber-900 space-y-1">
              <p className="leading-relaxed">
                {currentLocale === "en" ? (course.cpdRulesEn || course.cpdRulesZh || course.cpdRulesCn) :
                  currentLocale === "zh-cn" ? (course.cpdRulesCn || course.cpdRulesZh || course.cpdRulesEn) :
                  (course.cpdRulesZh || course.cpdRulesCn || course.cpdRulesEn)}
              </p>
            </div>
          ) : null}
        </header>

        {/* ================================================================== */}
        {/* 3. COURSE TOPICS (numbered list from syllabusItems)                */}
        {/* ================================================================== */}
        <section className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs">
          <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary" />
            <span>{dict.sections?.topics}</span>
          </h2>
          <p className="text-sm text-slate-500 mb-4 italic">
            {dict.topicsHint}
          </p>
          <ol className="space-y-3">
            {course.syllabus.map((mod, index) => {
              const moduleSchedules = scheduleByModuleId.get(mod.id) ?? [];
              return (
                <li key={mod.id} className="border border-slate-300 rounded-xs bg-slate-50/50 p-3 sm:p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center shrink-0 w-7 h-7 rounded-full bg-primary text-white font-bold text-xs">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-bold text-slate-900 text-sm block">{mod.title}</span>
                      <span className="font-mono text-slate-500 text-xs block mt-0.5">{mod.topics.join(" • ")}</span>
                    </div>
                    <span
                      className="font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded-xs shrink-0 text-xs"
                    >
                      {dict.labels?.duration}: {mod.duration}
                    </span>
                  </div>
                  {moduleSchedules.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 ml-10">
                      <span className="font-mono font-bold uppercase text-slate-400 block text-xs">
                        {dict.sections?.scheduleAndLocation}
                      </span>
                      {moduleSchedules.map((sch) => (
                        <div
                          key={sch.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-slate-700 bg-white border border-slate-200 rounded-xs px-2.5 py-2 text-sm"
                        >
                          <div className="flex items-center gap-1.5 font-semibold text-slate-900 shrink-0">
                            <Calendar className="w-3 h-3 text-primary shrink-0" />
                            <span>{sch.dateAndTime}</span>
                          </div>
                          <span className="hidden sm:inline text-slate-300 mx-1">|</span>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{sch.venue}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
          </div> {/* End Left Column */}

          {/* Right Column — Summary Sidebar (sticky) */}
          <div className="space-y-6 lg:col-span-1 self-start sticky top-24">

        {/* ================================================================== */}
        {/* 6a. ENROLLMENT CARD — desktop: top of sidebar                      */}
        {/* ================================================================== */}
        <div className="hidden lg:block bg-white border border-slate-300 rounded-xs p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <div className="space-y-3">
            {isEnrollable ? (
              <Link
                href={enrollUrl}
                className="block w-full py-2.5 px-4 uppercase tracking-wider font-bold text-primary-foreground transition-colors rounded-xs shadow-2xs border bg-primary hover:bg-primary/80 active:bg-primary/90 border-primary/40 text-center text-sm"
              >
                {dict.enrollCta}
              </Link>
            ) : (
              <span
                className="block w-full py-2.5 px-4 uppercase tracking-wider font-bold text-slate-500 bg-slate-300 border border-slate-400 rounded-xs shadow-2xs text-center cursor-not-allowed select-none text-sm"
              >
                {dict.enrollCta}
              </span>
            )}
            <a
              href={`/api/courses/${targetSlug}/brochure?locale=${currentLocale}`}
              download
              className="block w-full py-2 px-3 border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold uppercase tracking-wider transition-colors rounded-xs bg-slate-50 flex items-center justify-center gap-1.5 text-xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>{dict.downloadBrochure}</span>
            </a>
          </div>
        </div>

        {/* ================================================================== */}
        {/* 4. COURSE DETAILS TABLE                                            */}
        {/* ================================================================== */}
        <section className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs">
          <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-primary" />
            <span>{dict.sections?.details}</span>
          </h2>
          <table className="w-full text-sm text-slate-700">
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2 pr-4 font-bold text-slate-500 font-mono uppercase text-xs w-1/3 align-top">{dict.courseType}</td>
                <td className="py-2">{dict.certificateCourse}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold text-slate-500 font-mono uppercase text-xs align-top">{dict.deliveryMode}</td>
                <td className="py-2">
                  {(dict.deliveryModeValues as Record<string, string>)?.[course.deliveryMode] ?? course.deliveryMode}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold text-slate-500 font-mono uppercase text-xs align-top">{dict.language}</td>
                <td className="py-2">
                  {(dict.languageValues as Record<string, string>)?.[course.language] ?? course.language}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold text-slate-500 font-mono uppercase text-xs align-top">{dict.venue}</td>
                <td className="py-2">{course.venue}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold text-slate-500 font-mono uppercase text-xs align-top">{dict.courseHours}</td>
                <td className="py-2">{course.hoursText}</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-bold text-slate-500 font-mono uppercase text-xs align-top">{dict.feeStructure}</td>
                <td className="py-2 space-y-1">
                  {course.feeStructureLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </td>
              </tr>
            </tbody>
          </table>
          {feeDescription && (
            <p className="mt-3 text-xs text-slate-500 italic border-t border-slate-200 pt-3">{feeDescription}</p>
          )}
        </section>

        {/* ================================================================== */}
        {/* 5. CERTIFICATES & CPD HOURS                                        */}
        {/* ================================================================== */}
        <section className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs">
          <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span>{dict.sections?.certificates}</span>
          </h2>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <Award className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">{dict.singleTopicCpd}</span>
                <ul className="mt-1 space-y-0.5 text-slate-600">
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary shrink-0 leading-tight">•</span>
                    <span>{course.cpdHoursIa} {dict.cpdHoursLabel}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary shrink-0 leading-tight">•</span>
                    <span>{dict.attendanceCert}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-3 flex items-start gap-3">
              <Award className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">{dict.allTopicsCpd}</span>
                <ul className="mt-1 space-y-0.5 text-slate-600">
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary shrink-0 leading-tight">•</span>
                    <span>{course.cpdHours} {dict.cpdHoursLabel}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary shrink-0 leading-tight">•</span>
                    <span>{dict.graduationCert}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {certificateDescription && (
            <p className="mt-3 text-xs text-slate-500 italic border-t border-slate-200 pt-3">{certificateDescription}</p>
          )}
        </section>

        {/* ================================================================== */}
        {/* 6b. ENROLLMENT CARD — mobile: bottom of sidebar                     */}
        {/* ================================================================== */}
        <div className="block lg:hidden bg-white border border-slate-300 rounded-xs p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
          <div className="space-y-3">
            {isEnrollable ? (
              <Link
                href={enrollUrl}
                className="block w-full py-2.5 px-4 uppercase tracking-wider font-bold text-primary-foreground transition-colors rounded-xs shadow-2xs border bg-primary hover:bg-primary/80 active:bg-primary/90 border-primary/40 text-center text-sm"
              >
                {dict.enrollCta}
              </Link>
            ) : (
              <span
                className="block w-full py-2.5 px-4 uppercase tracking-wider font-bold text-slate-500 bg-slate-300 border border-slate-400 rounded-xs shadow-2xs text-center cursor-not-allowed select-none text-sm"
              >
                {dict.enrollCta}
              </span>
            )}
            <a
              href={`/api/courses/${targetSlug}/brochure?locale=${currentLocale}`}
              download
              className="block w-full py-2 px-3 border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold uppercase tracking-wider transition-colors rounded-xs bg-slate-50 flex items-center justify-center gap-1.5 text-xs"
            >
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>{dict.downloadBrochure}</span>
            </a>
          </div>
        </div>

        </div> {/* End Right Column */}

          {/* Left Column — Main Content (continued) */}
          <div className="space-y-6 lg:col-span-2">

        {/* Hidden sections (preserved for potential re-enable): */}
        {/* <CourseInstructors dict={dict} course={course} /> */}
        {/* <CourseFaqs dict={dict} course={course} /> */}
          </div> {/* End Left Column */}
        </div> {/* End Grid */}
      </div>
    </div>
  );
}
