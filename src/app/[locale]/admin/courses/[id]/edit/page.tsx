"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import CourseForm from "@/components/admin/CourseForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

interface CourseData {
  id: string;
  nameZh: string;
  nameEn: string;
  nameCn: string | null;
  slug: string;
  category: string;
  iaRefNumber: string | null;
  cpdHours: number;
  price: number;
  unitPrice: number | null;
  capacity: number;
  registrationStatus: "OPEN" | "FEW_SEATS" | "FULL" | "CLOSED";
  deliveryMode: string | null;
  language: string | null;
  descriptionZh: string | null;
  descriptionEn: string | null;
  descriptionCn: string | null;
  generalInstructorId: string | null;
  organizerZh: string | null;
  organizerEn: string | null;
  feeDescriptionZh: string | null;
  feeDescriptionEn: string | null;
  feeDescriptionCn: string | null;
}

export default function EditCoursePage() {
  const dict = useAdminDict();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCourse() {
      try {
        const res = await fetch(`/api/admin/courses/${courseId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Course not found");
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) setCourse(data.course);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (courseId) fetchCourse();
    return () => { cancelled = true; };
  }, [courseId]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6 space-y-6">
        <AdminPageHeader
          title=""
          backHref={`/${locale}/admin/courses`}
          backLabel={dict.courses}
        />
        <div className="bg-white border border-slate-200 p-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-bold text-destructive">{dict.error}</p>
          <p className="text-xs text-slate-500">{error || "Course not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header via shared component */}
      <AdminPageHeader
        title={dict.update}
        backHref={`/${locale}/admin/courses`}
        backLabel={dict.courses}
      />

      {/* Form card */}
      <section className="bg-white border border-slate-200 p-6">
        <CourseForm mode="edit" initialData={course} />
      </section>
    </div>
  );
}