"use client";

import { useAdminDict } from "@/components/admin/AdminDictContext";
import CourseForm from "@/components/admin/CourseForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function NewCoursePage() {
  const dict = useAdminDict();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/admin/courses`}
            className="inline-flex items-center space-x-1 text-slate-500 hover:text-primary transition-colors text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{dict.courses}</span>
          </Link>
          <h1 className="text-xl font-serif font-bold text-primary">{dict.create}</h1>
        </div>
      </div>

      {/* Form card */}
      <section className="bg-white border border-slate-200 p-6">
        <CourseForm mode="create" />
      </section>
    </div>
  );
}