"use client";

import Image from "next/image";
import { CourseViewDict, DetailedCourse, CourseStatus } from "./types";

interface CourseDetailViewProps {
  currentLocale: string;
  dict: CourseViewDict;
  course: DetailedCourse;
}

export function CourseDetailView({ dict, course }: CourseDetailViewProps) {
  // Render status badge style & dictionary label
  const getStatusBadge = (status: CourseStatus) => {
    const statusMap = {
      open: {
        text: dict.status.open,
        color: "bg-emerald-100 text-emerald-800",
      },
      fewSeats: {
        text: dict.status.fewSeats,
        color: "bg-amber-100 text-amber-800",
      },
      full: { text: dict.status.full, color: "bg-rose-100 text-rose-800" },
      closed: {
        text: dict.status.closed,
        color: "bg-slate-100 text-slate-800",
      },
    };
    return statusMap[status] || statusMap.closed;
  };

  const statusBadge = getStatusBadge(course.status);
  const isEnrollable = course.status === "open" || course.status === "fewSeats";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header / Hero */}
      <div className="mb-8 border-b pb-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
            {dict.certificateBadge}
          </span>
          {course.iaRefNumber && (
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {dict.iaRef} {course.iaRefNumber}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {course.title}
        </h1>
        <p className="mt-3 text-lg text-slate-600">{course.description}</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left Column (Main Content) */}
        <div className="space-y-12 lg:col-span-2">
          {/* 1. Syllabus & Modules Section */}
          <section id="syllabus" className="scroll-mt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {dict.sections.syllabus}
            </h2>
            <div className="space-y-4">
              {course.syllabus.map((mod) => (
                <div
                  key={mod.moduleNumber}
                  className="rounded-lg border border-slate-200 p-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="font-semibold text-slate-900">
                      {dict.labels.module} {mod.moduleNumber}: {mod.title}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {dict.labels.duration}: {mod.duration}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                      {dict.labels.topics}
                    </p>
                    <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                      {mod.topics.map((topic, i) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Schedule & Location Section */}
          <section id="schedule" className="scroll-mt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {dict.sections.scheduleAndLocation}
            </h2>
            <div className="space-y-4">
              {course.schedules.map((sch) => (
                <div
                  key={sch.id}
                  className="rounded-lg bg-slate-50 p-4 border border-slate-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {dict.labels.dateAndTime}: {sch.dateAndTime}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {dict.labels.venue}: {sch.venue}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                      {dict.quotaRemaining} {sch.quotaRemaining} {dict.seats}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Instructors Profile & Photo Section */}
          <section id="instructors" className="scroll-mt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {dict.sections.instructors}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {course.instructors.map((ins) => (
                <div
                  key={ins.id}
                  className="flex gap-4 rounded-xl border p-4 bg-white shadow-sm"
                >
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border">
                    <Image
                      src={ins.photoUrl}
                      alt={ins.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{ins.name}</h3>
                    <p className="text-xs font-medium text-blue-600">
                      {ins.title}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 line-clamp-3">
                      {ins.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Student Reviews Section */}
          <section id="reviews" className="scroll-mt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {dict.sections.reviews}
            </h2>
            <div className="space-y-4">
              {course.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {rev.authorName}
                      </p>
                      <p className="text-xs text-slate-500">{rev.authorRole}</p>
                    </div>
                    <span className="text-amber-500 text-sm">
                      {"★".repeat(rev.rating)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-700 italic">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. FAQs Section */}
          <section id="faqs" className="scroll-mt-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {dict.sections.faqs}
            </h2>
            <div className="space-y-3">
              {course.faqs.map((faq) => (
                <details
                  key={faq.id}
                  className="group rounded-lg border border-slate-200 p-4"
                >
                  <summary className="cursor-pointer font-semibold text-slate-800 list-none flex justify-between items-center">
                    <span>{faq.question}</span>
                    <span className="transition group-open:rotate-180">▼</span>
                  </summary>
                  <p className="mt-3 text-sm text-slate-600 border-t pt-3">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column (Sticky Enrollment Sidebar) */}
        <div>
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadge.color}`}
              >
                {statusBadge.text}
              </span>
              <span className="text-sm text-slate-500">
                {course.cpdHours} {dict.hours} CPD
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-extrabold text-slate-900">
                {course.fee}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                disabled={!isEnrollable}
                className={`w-full rounded-lg py-3 text-center font-semibold text-white transition ${
                  isEnrollable
                    ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                    : "cursor-not-allowed bg-slate-300"
                }`}
              >
                {dict.enrollCta}
              </button>
              <button className="w-full rounded-lg border border-slate-300 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {dict.downloadBrochure}
              </button>
            </div>

            {/* Metadata Overview */}
            <div className="mt-6 border-t pt-4 text-xs text-slate-600 space-y-2">
              <div className="flex justify-between">
                <span>{dict.deliveryMode}:</span>
                <span className="font-semibold text-slate-800">
                  {course.deliveryMode}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{dict.language}:</span>
                <span className="font-semibold text-slate-800">
                  {course.language}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
