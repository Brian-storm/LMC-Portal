"use client";

import { useAdminDict } from "@/components/admin/AdminDictContext";
import CourseForm from "@/components/admin/CourseForm";
import { useParams } from "next/navigation";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default function NewCoursePage() {
  const dict = useAdminDict();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  return (
    <div className="p-6 space-y-6">
      {/* Page header via shared component */}
      <AdminPageHeader
        title={dict.create}
        backHref={`/${locale}/admin/courses`}
        backLabel={dict.courses}
      />

      {/* Form card */}
      <section className="bg-white border border-slate-200 p-6">
        <CourseForm mode="create" />
      </section>
    </div>
  );
}