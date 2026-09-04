"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";

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
    course: { nameEn: string; nameZh: string };
  }[];
}

export default function AdminDashboardPage() {
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
        <Loader2 className="w-6 h-6 animate-spin text-[#1b4332]" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm text-slate-700">{error ?? "Failed to load dashboard"}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Enrolments", value: stats.totalEnrolments, color: "text-slate-900" },
    { label: "Pending", value: stats.pendingCount, color: "text-amber-700" },
    { label: "Verified", value: stats.verifiedCount, color: "text-emerald-700" },
    { label: "Active Courses", value: stats.courseCount, color: "text-[#1b4332]" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-serif font-bold text-[#1b4332]">Admin Dashboard</h1>
        <p className="text-xs text-slate-500 mt-0.5">CPD Compliance & Administration Portal</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-slate-200 p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{card.label}</span>
            <span className={`text-2xl font-serif font-bold ${card.color}`}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* Recent submissions */}
      <section className="bg-white border border-slate-200">
        <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Recent Submissions</h2>
          <Link
            href={`/${locale}/admin/enrolments`}
            className="text-[10px] font-bold text-[#1b4332] hover:underline flex items-center"
          >
            View All <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold text-[10px]">
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Course</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Date</th>
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
                    {locale === "zh-hk" || locale === "zh-cn" ? e.course.nameZh : e.course.nameEn}
                  </td>
                  <td className="py-2 px-3">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 ${
                      e.paymentStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                      e.paymentStatus === "REJECTED" ? "bg-rose-50 text-rose-800 border border-rose-200" :
                      "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}>
                      {e.paymentStatus === "PENDING_VERIFICATION" ? "Pending" : e.paymentStatus}
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
                    No enrolments yet
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