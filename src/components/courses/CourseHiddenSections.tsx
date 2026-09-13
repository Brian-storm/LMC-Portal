"use client";

import Image from "next/image";
import {
  User,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { CourseViewDict, DetailedCourse } from "./types";

interface CourseHiddenSectionsProps {
  dict: CourseViewDict;
  course: DetailedCourse;
}

export function CourseInstructors({ dict, course }: CourseHiddenSectionsProps) {
  return (
    <section id="instructors" className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs">
      <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
        <User className="w-4 h-4 text-primary" />
        <span>{dict.sections?.instructors}</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {course.instructors.map((ins) => (
          <div key={ins.id} className="flex gap-3 border border-slate-300 rounded-xs p-3 bg-slate-50/50">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-slate-300 rounded-xs bg-slate-200">
              <Image src={ins.photoUrl} alt={ins.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-sans font-bold text-slate-900 text-sm truncate">{ins.name}</h3>
              <p className="font-mono text-primary font-semibold truncate text-xs">{ins.title}</p>
              <p className="mt-1 text-slate-600 line-clamp-2 leading-tight text-sm">{ins.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CourseFaqs({ dict, course }: CourseHiddenSectionsProps) {
  if (!course.faqs || course.faqs.length === 0) return null;

  return (
    <section id="faqs" className="bg-white border border-slate-300 rounded-xs p-4 sm:p-5 shadow-2xs">
      <h2 className="font-sans font-bold text-slate-900 text-sm sm:text-base uppercase tracking-wider flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
        <HelpCircle className="w-4 h-4 text-primary" />
        <span>{dict.sections?.faqs}</span>
      </h2>
      <div className="space-y-2">
        {course.faqs.map((faq) => (
          <details key={faq.id} className="group border border-slate-300 rounded-xs bg-slate-50 p-3">
            <summary className="cursor-pointer font-semibold text-slate-800 list-none flex justify-between items-center text-sm">
              <span>{faq.question}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 transition-transform group-open:rotate-180 shrink-0 ml-2" />
            </summary>
            <p className="mt-2 text-slate-600 border-t border-slate-200 pt-2 leading-relaxed text-sm">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}