"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  AlertCircle,
  Loader2,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";

interface AdminCourse {
  id: string;
  slug: string;
  nameZh: string;
  nameEn: string;
  iaRefNumber: string | null;
  cpdHours: number;
  price: number;
  registrationStatus: string;
  instructors: { instructor: { nameEn: string; nameZh: string } }[];
  _count: { registrants: number };
}

export default function AdminCoursesPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCourses() {
      try {
        const res = await fetch("/api/admin/courses");
        if (!res.ok) throw new Error("Failed to load courses");
        const data = await res.json();
        if (!cancelled) setCourses(data.courses);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCourses();
    return () => { cancelled = true; };
  }, []);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OPEN: "bg-emerald-50 text-emerald-800 border border-emerald-200",
      FEW_SEATS: "bg-amber-50 text-amber-800 border border-amber-200",
      FULL: "bg-rose-50 text-rose-800 border border-rose-200",
      CLOSED: "bg-slate-100 text-slate-500 border border-slate-200",
    };
    return styles[status] ?? "bg-slate-100 text-slate-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#1b4332]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-slate-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold text-[#1b4332]">Course Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">{courses.length} courses</p>
        </div>
        <Link
          href={`/${locale}/admin/courses/new`}
          className="inline-flex items-center space-x-1 bg-[#1b4332] hover:bg-[#112a1f] text-white text-xs font-bold px-3 py-2 rounded-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Course</span>
        </Link>
      </div>

      {/* Course table */}
      <section className="bg-white border border-slate-200">
        {courses.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500">No courses yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Course Name</th>
                  <th className="py-2.5 px-3">IA Ref</th>
                  <th className="py-2.5 px-3">CPD</th>
                  <th className="py-2.5 px-3">Price</th>
                  <th className="py-2.5 px-3">Enrolled</th>
                  <th className="py-2.5 px-3">Instructor</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="font-serif font-bold text-slate-900">
                        {locale === "zh-hk" || locale === "zh-cn" ? course.nameZh : course.nameEn}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">{course.slug}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{course.iaRefNumber ?? "—"}</td>
                    <td className="py-3 px-3 font-bold text-[#1b4332]">{course.cpdHours}h</td>
                    <td className="py-3 px-3 font-mono text-slate-700">HK$ {course.price.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Users className="w-3 h-3" />
                        {course._count.registrants}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {course.instructors.map((i) =>
                        locale === "zh-hk" || locale === "zh-cn" ? i.instructor.nameZh : i.instructor.nameEn
                      ).join(", ") || "—"}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 ${statusBadge(course.registrationStatus)}`}>
                        {course.registrationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}