"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Award,
  MapPin,
  FileText,
  Calendar,
  User,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { CourseViewDict, DetailedCourse, CourseStatus, ScheduleSession } from "./types";

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
  // Render status badge style & dictionary label with statutory styling
  const getStatusBadge = (status: CourseStatus) => {
    const statusMap = {
      open: {
        text: dict.status?.open,
        color: "bg-emerald-50 text-emerald-900 border-emerald-300",
      },
      fewSeats: {
        text: dict.status?.fewSeats,
        color: "bg-amber-50 text-amber-900 border-amber-300",
      },
      full: {
        text: dict.status?.full,
        color: "bg-rose-50 text-rose-900 border-rose-300",
      },
      closed: {
        text: dict.status?.closed,
        color: "bg-slate-100 text-slate-800 border-slate-300",
      },
    };
    return statusMap[status] || statusMap.closed;
  };

  const statusBadge = getStatusBadge(course.status);
  const isEnrollable = course.status === "open" || course.status === "fewSeats";
  const targetSlug = course.slug || course.id;
  const enrollUrl = currentLocale
    ? `/${currentLocale}/courses/${targetSlug}/enroll`
    : `/courses/${targetSlug}/enroll`;

  // Build a map: syllabusItemId → ScheduleSession[] for combining syllabus with schedule
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

  return (
    <div className="bg-slate-100/80 min-h-screen py-6 sm:py-8 border-t border-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ------------------------------------------------------------------ */}
        {/* 1. INSTITUTIONAL HEADER / HERO BANNER                             */}
        {/* ------------------------------------------------------------------ */}
        <header className="bg-white border border-slate-300 rounded-xs p-4 sm:p-6 shadow-2xs relative overflow-hidden mb-6 pl-5">
          {/* Statutory Green Accent Bar */}
          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-primary" />

          {/* Registry Accreditation Headers */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-200 font-mono text-slate-700">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="bg-slate-100 border border-slate-300 px-2 py-0.5 font-bold uppercase tracking-wider text-slate-800 rounded-xs"
                style={{ fontSize: "9.5px" }}
              >
                {dict.certificateBadge}
              </span>
              {course.iaRefNumber && (
                <span
                  className="bg-slate-50 border border-slate-300 text-slate-700 px-2 py-0.5 font-semibold tracking-tight rounded-xs"
                  style={{ fontSize: "9.5px" }}
                >
                  <span className="text-slate-400 font-bold mr-1">
                    {dict.iaRef}:
                  </span>
                  {course.iaRefNumber}
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-2">
              <div
                className="inline-flex items-center space-x-1 text-primary font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-300 rounded-xs"
                style={{ fontSize: "9.5px" }}
              >
                <Award className="w-3 h-3 text-primary shrink-0" />
                <span>
                  {course.cpdHours} {dict.hours}
                </span>
              </div>
              {course.cpdHoursIa && (
                <div
                  className="inline-flex items-center space-x-1 text-emerald-800 font-bold bg-emerald-50/60 px-2 py-0.5 border border-emerald-200 rounded-xs"
                  style={{ fontSize: "9.5px" }}
                >
                  <span>{course.cpdHoursIa} IA {dict.hours}/session</span>
                </div>
              )}
            </div>
          </div>

          {/* Official Course Title & Executive Overview */}
          <h1 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 leading-snug tracking-tight">
            {course.title}
          </h1>
          <p
            className="mt-2 text-slate-700 border-l-2 border-slate-300 pl-3 py-0.5 leading-relaxed"
            style={{ fontSize: "12px" }}
          >
            {course.description}
          </p>

          {/* CPD Rules */}
          {(course.cpdRulesZh || course.cpdRulesEn) && (
            <div className="mt-3 bg-amber-50/80 border border-amber-200 p-3 rounded-xs text-xs text-amber-900 space-y-1">
              <p className="leading-relaxed">
                {course.cpdRulesZh || course.cpdRulesEn}
              </p>
            </div>
          )}
        </header>

        {/* ------------------------------------------------------------------ */}
        {/* 2. MAIN GRID LAYOUT                                               */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Course Documentation & Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* 2A. SYLLABUS & MODULES */}
            <section
              id="syllabus"
              className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>
                    {dict.sections?.syllabus}
                  </span>
                </h2>
                <span
                  className="font-mono text-slate-500 uppercase"
                  style={{ fontSize: "9px" }}
                >
                  {course.syllabus.length} MODULES
                </span>
              </div>

              <div className="space-y-4">
                {course.syllabus.map((mod) => {
                  const moduleSchedules = scheduleByModuleId.get(mod.id) ?? [];
                  return (
                    <div
                      key={mod.id}
                      className="border border-slate-300 rounded-xs bg-slate-50/50 p-3 sm:p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 gap-2">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {dict.labels?.module} {mod.moduleNumber}:{" "}
                          {mod.title}
                        </span>
                        <span
                          className="font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded-xs"
                          style={{ fontSize: "9px" }}
                        >
                          {dict.labels?.duration}: {mod.duration}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <p
                          className="font-mono font-semibold uppercase text-slate-500 mb-1.5"
                          style={{ fontSize: "8.5px" }}
                        >
                          {dict.labels?.topics}
                        </p>
                        <ul
                          className="space-y-1 text-slate-700"
                          style={{ fontSize: "11px" }}
                        >
                          {mod.topics.map((topic, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-primary font-bold select-none">
                                •
                              </span>
                              <span>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Associated schedule sessions for this module */}
                      {moduleSchedules.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                          <span
                            className="font-mono font-bold uppercase text-slate-400 block"
                            style={{ fontSize: "8px" }}
                          >
                            {dict.sections?.scheduleAndLocation || "Schedule & Physical Venue"}
                          </span>
                          {moduleSchedules.map((sch) => (
                            <div
                              key={sch.id}
                              className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-slate-700 bg-white border border-slate-200 rounded-xs px-2.5 py-2"
                              style={{ fontSize: "10px" }}
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
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-slate-600 text-xs font-mono flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-semibold text-slate-700">{dict.seats}: {course.capacity}</span>
              </div>
            </section>

            {/* 2C. INSTRUCTORS & FACULTY */}
            <section
              id="instructors"
              className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs"
            >
              <div className="border-b border-slate-200 pb-2 mb-4">
                <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>
                    {dict.sections?.instructors}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.instructors.map((ins) => (
                  <div
                    key={ins.id}
                    className="flex gap-3 border border-slate-300 rounded-xs p-3 bg-slate-50/50"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-slate-300 rounded-xs bg-slate-200">
                      <Image
                        src={ins.photoUrl}
                        alt={ins.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-sans font-bold text-slate-900 text-xs truncate">
                        {ins.name}
                      </h3>
                      <p
                        className="font-mono text-primary font-semibold truncate"
                        style={{ fontSize: "9px" }}
                      >
                        {ins.title}
                      </p>
                      <p
                        className="mt-1 text-slate-600 line-clamp-2 leading-tight"
                        style={{ fontSize: "10px" }}
                      >
                        {ins.bio}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2D. FAQS */}
            {course.faqs && course.faqs.length > 0 && (
              <section
                id="faqs"
                className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs"
              >
                <div className="border-b border-slate-200 pb-2 mb-4">
                  <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    <span>
                      {dict.sections?.faqs}
                    </span>
                  </h2>
                </div>

                <div className="space-y-2">
                  {course.faqs.map((faq) => (
                    <details
                      key={faq.id}
                      className="group border border-slate-300 rounded-xs bg-slate-50 p-3"
                    >
                      <summary className="cursor-pointer font-semibold text-slate-800 list-none flex justify-between items-center text-xs">
                        <span>{faq.question}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 transition-transform group-open:rotate-180 shrink-0 ml-2" />
                      </summary>
                      <p
                        className="mt-2 text-slate-600 border-t border-slate-200 pt-2 leading-relaxed"
                        style={{ fontSize: "11px" }}
                      >
                        {faq.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* Right Column: Statutory Action Panel                               */}
          {/* ------------------------------------------------------------------ */}
          <div>
            <div className="sticky top-6 bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs relative overflow-hidden">
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />

              {/* Status & Credits Header */}
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-3 font-mono">
                <span
                  className={`border px-2 py-0.5 font-bold uppercase rounded-xs ${statusBadge.color}`}
                  style={{ fontSize: "8.5px" }}
                >
                  {statusBadge.text}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-slate-700 font-bold"
                    style={{ fontSize: "10px" }}
                  >
                    {course.cpdHours} {dict.hours} CPD
                  </span>
                  {course.cpdHoursIa && (
                    <span
                      className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-xs border border-emerald-200"
                      style={{ fontSize: "8px" }}
                    >
                      IA {course.cpdHoursIa}h/session
                    </span>
                  )}
                </div>
              </div>

              {/* Course Fee Display */}
              <div className="mb-4">
                <span
                  className="text-slate-400 font-mono block uppercase font-bold mb-0.5"
                  style={{ fontSize: "8.5px" }}
                >
                  OFFICIAL COURSE FEE
                </span>
                <span className="text-2xl font-sans font-bold text-slate-900">
                  {course.fee}
                </span>
                {course.unitPrice && (
                  <span
                    className="text-slate-500 font-mono block mt-0.5"
                    style={{ fontSize: "9px" }}
                  >
                    Unit Price: HKD {typeof course.unitPrice === 'number' ? course.unitPrice.toLocaleString() : course.unitPrice}
                  </span>
                )}
              </div>

              {/* Primary Action Links */}
              <div className="space-y-2 font-mono">
                {isEnrollable ? (
                  <Link
                    href={`${enrollUrl}`}
                    className="w-full py-2 px-3 uppercase tracking-wider font-bold text-primary-foreground transition-colors rounded-xs shadow-2xs border bg-primary hover:bg-primary/80 active:bg-primary/90 border-primary/40 text-center block"
                    style={{ fontSize: "10px" }}
                  >
                    {dict.enrollCta}
                  </Link>
                ) : (
                  <span
                    className="w-full py-2 px-3 uppercase tracking-wider font-bold text-slate-500 bg-slate-300 border border-slate-400 rounded-xs shadow-2xs text-center block cursor-not-allowed select-none"
                    style={{ fontSize: "10px" }}
                  >
                    {dict.enrollCta}
                  </span>
                )}

                <a
                  href={`/api/courses/${targetSlug}/brochure?locale=${currentLocale}`}
                  download
                  className="w-full py-1.5 px-3 border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold uppercase tracking-wider transition-colors rounded-xs bg-slate-50 flex items-center justify-center gap-1.5"
                  style={{ fontSize: "9px" }}
                >
                  <FileText className="w-3 h-3 text-slate-600" />
                  <span>{dict.downloadBrochure}</span>
                </a>
              </div>

              {/* Mandatory Governance Notice */}
              <div
                className="mt-4 pt-3 border-t border-slate-200 text-slate-600 space-y-2 font-mono"
                style={{ fontSize: "9.5px" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase font-semibold">
                    {dict.deliveryMode}:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {(dict.deliveryModeValues as Record<string, string>)?.[course.deliveryMode] ??
                      course.deliveryMode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 uppercase font-semibold">
                    {dict.language}:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {(dict.languageValues as Record<string, string>)?.[course.language] ??
                      course.language}
                  </span>
                </div>
              </div>

              {/* Course Poster Image */}
              {course.imageUrl && (
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="relative w-full bg-slate-100 overflow-hidden rounded-xs border border-slate-200">
                    <Image
                      src={course.imageUrl}
                      alt={course.title}
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
