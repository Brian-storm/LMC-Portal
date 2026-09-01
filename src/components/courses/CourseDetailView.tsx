"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Clock,
  Globe,
  MapPin,
  FileText,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  User,
  HelpCircle,
  Star,
  ChevronDown,
} from "lucide-react";
import { CourseViewDict, DetailedCourse, CourseStatus } from "./types";

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
  const enrollUrl = currentLocale
    ? `/${currentLocale}/courses/${course.id}/enroll`
    : `/courses/${course.id}/enroll`;

  return (
    <div className="bg-slate-100/80 min-h-screen py-6 sm:py-8 border-t border-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ------------------------------------------------------------------ */}
        {/* 1. INSTITUTIONAL HEADER / HERO BANNER                             */}
        {/* ------------------------------------------------------------------ */}
        <header className="bg-white border border-slate-300 rounded-xs p-4 sm:p-6 shadow-2xs relative overflow-hidden mb-6 pl-5">
          {/* Statutory Green Accent Bar */}
          <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#1b4332]" />

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

            <div
              className="inline-flex items-center space-x-1 text-[#1b4332] font-bold bg-emerald-50 px-2 py-0.5 border border-emerald-300 rounded-xs"
              style={{ fontSize: "9.5px" }}
            >
              <Award className="w-3 h-3 text-[#1b4332] shrink-0" />
              <span>
                {course.cpdHours} {dict.hours}
              </span>
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
                  <FileText className="w-4 h-4 text-[#1b4332]" />
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

              <div className="space-y-3">
                {course.syllabus.map((mod) => (
                  <div
                    key={mod.moduleNumber}
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
                            <span className="text-[#1b4332] font-bold select-none">
                              •
                            </span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2B. SCHEDULE & LOCATION */}
            <section
              id="schedule"
              className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs"
            >
              <div className="border-b border-slate-200 pb-2 mb-4">
                <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#1b4332]" />
                  <span>
                    {dict.sections?.scheduleAndLocation ||
                      "Schedule & Physical Venue"}
                  </span>
                </h2>
              </div>

              <div className="space-y-3">
                {course.schedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="border border-slate-300 rounded-xs bg-slate-50 p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{sch.dateAndTime}</span>
                      </div>
                      <div
                        className="flex items-start gap-2 text-slate-700"
                        style={{ fontSize: "10px" }}
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span>
                          {dict.labels?.venue}: {sch.venue}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span
                        className="bg-amber-50 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-xs uppercase tracking-wider"
                        style={{ fontSize: "8.5px" }}
                      >
                        {dict.quotaRemaining} {sch.quotaRemaining}{" "}
                        {dict.seats}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2C. INSTRUCTORS & FACULTY */}
            <section
              id="instructors"
              className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs"
            >
              <div className="border-b border-slate-200 pb-2 mb-4">
                <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#1b4332]" />
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
                        className="font-mono text-[#1b4332] font-semibold truncate"
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

            {/* 2D. VERIFIED REVIEWS */}
            {course.reviews && course.reviews.length > 0 && (
              <section
                id="reviews"
                className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs"
              >
                <div className="border-b border-slate-200 pb-2 mb-4">
                  <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#1b4332]" />
                    <span>
                      {dict.sections?.reviews}
                    </span>
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {course.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="border border-slate-200 bg-slate-50/60 p-3 rounded-xs"
                    >
                      <div className="flex items-center justify-between font-mono">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">
                            {rev.authorName}
                          </p>
                          <p
                            className="text-slate-500"
                            style={{ fontSize: "8.5px" }}
                          >
                            {rev.authorRole}
                          </p>
                        </div>
                        <span
                          className="text-amber-600 font-bold"
                          style={{ fontSize: "11px" }}
                        >
                          {"★".repeat(rev.rating)}
                        </span>
                      </div>
                      <p
                        className="mt-2 text-slate-700 italic border-l border-slate-300 pl-2 py-0.5"
                        style={{ fontSize: "11px" }}
                      >
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 2E. FAQS */}
            {course.faqs && course.faqs.length > 0 && (
              <section
                id="faqs"
                className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs"
              >
                <div className="border-b border-slate-200 pb-2 mb-4">
                  <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#1b4332]" />
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
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#1b4332]" />

              {/* Status & Credits Header */}
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-3 font-mono">
                <span
                  className={`border px-2 py-0.5 font-bold uppercase rounded-xs ${statusBadge.color}`}
                  style={{ fontSize: "8.5px" }}
                >
                  {statusBadge.text}
                </span>
                <span
                  className="text-slate-700 font-bold"
                  style={{ fontSize: "10px" }}
                >
                  {course.cpdHours} {dict.hours} CPD
                </span>
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
              </div>

              {/* Primary Action Links */}
              <div className="space-y-2 font-mono">
                {isEnrollable ? (
                  <Link
                    href={`${enrollUrl}`}
                    className="w-full py-2 px-3 uppercase tracking-wider font-bold text-white transition-colors rounded-xs shadow-2xs border bg-[#1b4332] hover:bg-[#112a1f] active:bg-[#091711] border-[#0d2118] text-center block"
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

                <Link
                  href={course.brochureUrl || `#`}
                  target={course.brochureUrl ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-3 border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold uppercase tracking-wider transition-colors rounded-xs bg-slate-50 flex items-center justify-center gap-1.5"
                  style={{ fontSize: "9px" }}
                >
                  <FileText className="w-3 h-3 text-slate-600" />
                  <span>{dict.downloadBrochure}</span>
                </Link>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
