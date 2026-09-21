"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  AlertCircle,
  Loader2,
  Plus,
  Users,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { AdminDict } from "@/dictionaries/types";

interface AdminCourse {
  id: string;
  slug: string;
  nameZh: string;
  nameEn: string;
  nameCn: string | null;
  iaRefNumber: string | null;
  cpdHours: number;
  price: number;
  registrationStatus: string;
  generalInstructor: { nameEn: string; nameZh: string } | null;
  _count: { registrants: number };
}

export default function AdminCoursesPage() {
  const dict = useAdminDict();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const { addToast } = useToast();

  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete dialog state
  const [deleteTarget, setDeleteTarget] = useState<AdminCourse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggle state
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/courses");
      if (!res.ok) throw new Error("Failed to load courses");
      const data = await res.json();
      setCourses(data.courses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourses();
  }, []);

  const STATUS_LABEL_KEY: Record<string, keyof AdminDict> = {
    OPEN: "open",
    FEW_SEATS: "fewSeats",
    FULL: "full",
    CLOSED: "closed",
  };

  const handleToggleStatus = async (course: AdminCourse) => {
    const newStatus = course.registrationStatus === "OPEN" ? "CLOSED" : "OPEN";
    setTogglingId(course.id);
    try {
      const res = await fetch(`/api/admin/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationStatus: newStatus }),
      });
      if (!res.ok) throw new Error(`Failed to toggle: ${res.status}`);
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, registrationStatus: newStatus } : c)),
      );
      addToast({ title: dict.toastStatusUpdated, variant: "success" });
    } catch (err) {
      addToast({
        title: dict.error,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "danger",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.status === 409) {
        addToast({ title: dict.toastCourseDeleteBlocked, variant: "warning" });
        setDeleteTarget(null);
        return;
      }
      if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      addToast({ title: dict.toastCourseDeleted, variant: "success" });
      setDeleteTarget(null);
    } catch (err) {
      addToast({
        title: dict.error,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "danger",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
          <h1 className="text-xl font-serif font-bold text-primary">{ dict.courses }</h1>
          <p className="text-xs text-slate-500 mt-0.5">{courses.length} { dict.courses }</p>
        </div>
        <Link
          href={`/${locale}/admin/courses/new`}
          className="inline-flex items-center space-x-1 bg-primary hover:bg-primary/80 text-primary-foreground text-xs font-bold px-3 py-2 rounded-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{ dict.newCourse }</span>
        </Link>
      </div>

      {/* Course table */}
      <section className="bg-white border border-slate-200">
        {courses.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500">{ dict.noData }</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">{ dict.courseName }</th>
                  <th className="py-2.5 px-3">{ dict.iaRef }</th>
                  <th className="py-2.5 px-3">{ dict.cpdHours }</th>
                  <th className="py-2.5 px-3">{ dict.price }</th>
                  <th className="py-2.5 px-3">{ dict.enrolments }</th>
                  <th className="py-2.5 px-3">{ dict.instructors }</th>
                  <th className="py-2.5 px-3">{ dict.status }</th>
                  <th className="py-2.5 px-3 text-right">{ dict.actions }</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="font-serif font-bold text-slate-900">
                        {locale === "en" ? course.nameEn : (locale === "zh-cn" ? (course.nameCn || course.nameZh) : course.nameZh)}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">{course.slug}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{course.iaRefNumber ?? "—"}</td>
                    <td className="py-3 px-3 font-bold text-primary">{course.cpdHours}h</td>
                    <td className="py-3 px-3 font-mono text-slate-700">HK$ {course.price.toFixed(2)}</td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Users className="w-3 h-3" />
                        {course._count.registrants}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {course.generalInstructor
                        ? (locale === "zh-hk" || locale === "zh-cn"
                          ? course.generalInstructor.nameZh
                          : course.generalInstructor.nameEn)
                        : "—"}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleStatus(course)}
                        disabled={togglingId === course.id}
                        title={dict.formStatus}
                        className={`relative inline-flex items-center h-5 w-9 rounded-full border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ${
                          course.registrationStatus === "OPEN"
                            ? "bg-emerald-600 border-emerald-600"
                            : "bg-slate-300 border-slate-300"
                        }`}
                      >
                        <span
                          className={`inline-block w-3.5 h-3.5 transform rounded-full bg-white shadow-xs transition-transform ${
                            course.registrationStatus === "OPEN" ? "translate-x-[18px]" : "translate-x-[1px]"
                          }`}
                        />
                      </button>
                      <span className="ml-1.5 text-[10px] font-medium text-slate-600">
                        {togglingId === course.id ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin inline" />
                        ) : (
                          dict[STATUS_LABEL_KEY[course.registrationStatus] as keyof AdminDict] as string ?? course.registrationStatus
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                      <Link
                        href={`/${locale}/admin/courses/${course.id}/edit`}
                        className="inline-flex items-center p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xs transition-colors"
                        title={dict.update}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(course)}
                        className="inline-flex items-center p-1.5 text-slate-500 hover:text-destructive hover:bg-rose-50 rounded-xs transition-colors"
                        title={dict.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{ dict.confirmDelete }</DialogTitle>
            <DialogDescription>
              { dict.deleteWarning }
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (
            <div className="bg-slate-50 border border-slate-200 p-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{ dict.courseName }:</span>
                <span className="font-bold text-slate-800">
                  {locale === "en" ? deleteTarget.nameEn : (locale === "zh-cn" ? (deleteTarget.nameCn || deleteTarget.nameZh) : deleteTarget.nameZh)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{ dict.enrolments }:</span>
                <span className="font-bold text-slate-800">{deleteTarget._count.registrants}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              { dict.cancel }
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleting}
            >
              <Trash2 className="w-3.5 h-3.5" />
              { dict.delete }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}