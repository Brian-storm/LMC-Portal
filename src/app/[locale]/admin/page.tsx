"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

interface DashboardStats {
  totalEnrolments: number;
  pendingCount: number;
  verifiedCount: number;
  rejectedCount: number;
  courseCount: number;
  userCount: number;
  recentEnrolments: {
    id: string;
    paymentMethod: string | null;
    paymentStatus: string;
    submittedAt: string;
    user: { nameEn: string; nameZh: string; email: string };
    course: { nameEn: string; nameZh: string; nameCn: string | null };
  }[];
}

export default function AdminDashboardPage() {
  const dict = useAdminDict();
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard stats");
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-xs text-slate-700">{error ?? dict.error}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: dict.totalEnrolments, value: stats.totalEnrolments },
    { label: dict.pending, value: stats.pendingCount },
    { label: dict.verified, value: stats.verifiedCount },
    { label: dict.activeCourses, value: stats.courseCount },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page header via shared component */}
      <AdminPageHeader title={dict.dashboard} subtitle={dict.portalTitle} />

      {/* Stat cards via shared component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const colors = ["text-slate-900", "text-amber-700", "text-emerald-700", "text-primary"];
          return <AdminStatCard key={card.label} label={card.label} value={card.value} color={colors[idx] ?? "text-slate-900"} />;
        })}
      </div>

      {/* Recent submissions — using AdminDataTable as shell */}
      <section className="bg-white border border-slate-200">
        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">{ dict.recentSubmissions }</h2>
          <Link
            href={`/${locale}/admin/enrolments`}
            className="text-[10px] font-bold text-primary hover:underline flex items-center"
          >
            { dict.viewAll } <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold text-[10px]">
                <th className="py-2 px-3">{ dict.name }</th>
                <th className="py-2 px-3">{ dict.courseName }</th>
                <th className="py-2 px-3">{ dict.status }</th>
                <th className="py-2 px-3">{ dict.date }</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentEnrolments.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3">
                    <span className="font-bold text-slate-900">
                      {locale === "zh-hk" || locale === "zh-cn" ? e.user.nameZh : e.user.nameEn}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-700">
                    {locale === "zh-cn" ? (e.course.nameCn || e.course.nameZh) : (locale === "en" ? e.course.nameEn : e.course.nameZh)}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 ${
                      e.paymentStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                      e.paymentStatus === "REJECTED" ? "bg-rose-50 text-rose-800 border border-rose-200" :
                      "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}>
                      {e.paymentStatus === "PENDING_VERIFICATION" ? dict.pendingVerification : e.paymentStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-500">
                    {new Date(e.submittedAt).toLocaleDateString("en-CA")}
                  </td>
                </tr>
              ))}
              {stats.recentEnrolments.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    { dict.noData }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}