"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Plus,
  Search,
  Building2,
  Clock,
  Download,
  Filter,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";

export default function AdminDashboardPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";

  // Mock Admin Metrics
  const stats = {
    totalEnrolmentsThisMonth: 142,
    pendingVerificationCount: 8,
    cpdHoursIssuedCycle: 426.0,
    activeCoursesCount: 12,
  };

  // Mock Recent Enrolment Submissions awaiting audit
  const [enrolments, setEnrolments] = useState([
    {
      id: "DEMO-88392",
      attendeeName: "CHAN Tai Man",
      licenseNo: "IA12345678",
      company: "Prudential HK",
      courseCode: "IA-2026-CPD01",
      courseTitle: "Regulatory Compliance & Ethics",
      cpdHours: "3.0 Hours (Ethics)",
      status: "Pending Verification",
      submissionDate: "2026-08-25",
    },
    {
      id: "DEMO-88393",
      attendeeName: "WONG Ka Ho",
      licenseNo: "IA87654321",
      company: "HSBC Life",
      courseCode: "IA-2026-AML04",
      courseTitle: "Anti-Money Laundering Standards",
      cpdHours: "4.0 Hours",
      status: "Verified",
      submissionDate: "2026-08-24",
    },
    {
      id: "DEMO-88394",
      attendeeName: "LEE Mary",
      licenseNo: "IA55667788",
      company: "AIA International",
      courseCode: "HKIB-2026-ESG",
      courseTitle: "ESG Risk Assessment Practice",
      cpdHours: "2.0 Hours",
      status: "Flagged (License Mismatch)",
      submissionDate: "2026-08-24",
    },
  ]);

  const handleAudit = (id: string, newStatus: string) => {
    setEnrolments((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item,
      ),
    );
  };

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Admin Header */}
        <header className="bg-white border border-slate-300 p-6 shadow-2xs border-t-4 border-t-[#1b4332] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              <Building2 className="w-3.5 h-3.5 text-[#1b4332]" />
              <span>CPD Compliance & Administration Portal</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1b4332]">
              Executive Admin Control Panel
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                alert("Exporting Regulatory CPD Return XML/CSV...")
              }
              className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xs transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1b4332]" />
              <span>Export Regulatory Return</span>
            </button>
            <Link
              href={`/${locale}/admin/courses/new`}
              className="inline-flex items-center space-x-1.5 bg-[#1b4332] hover:bg-[#112a1f] text-white text-xs font-bold px-3.5 py-2 rounded-xs transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Course Module</span>
            </Link>
          </div>
        </header>

        {/* Executive Key Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-300 p-4 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Monthly Enrolments
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-slate-900">
                {stats.totalEnrolmentsThisMonth}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-700">
                +14% vs last month
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-300 p-4 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Pending License Verification
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-amber-700">
                {stats.pendingVerificationCount}
              </span>
              <span className="text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 border border-amber-200">
                Requires Audit
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-300 p-4 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              CPD Hours Certified (Cycle)
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-[#1b4332]">
                {stats.cpdHoursIssuedCycle}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                IA / HKIB
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-300 p-4 shadow-2xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Active Offerings
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-serif font-bold text-slate-900">
                {stats.activeCoursesCount}
              </span>
              <span className="text-xs text-slate-500">Modules</span>
            </div>
          </div>
        </div>

        {/* Verification & Audit Table */}
        <section className="bg-white border border-slate-300 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#1b4332] flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Enrolment License & Regulatory Audit Queue</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify attendee Insurance Authority (IA) license numbers prior
                to submitting CPD hours.
              </p>
            </div>

            {/* Filter Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search Name or License..."
                className="pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-300 rounded-xs focus:outline-none focus:border-[#1b4332]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Attendee & Organization</th>
                  <th className="py-2.5 px-3">License Reg No.</th>
                  <th className="py-2.5 px-3">Module</th>
                  <th className="py-2.5 px-3">Audit Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {enrolments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">
                        {item.attendeeName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {item.company}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {item.licenseNo}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-serif font-bold text-slate-900">
                        {item.courseTitle}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {item.courseCode} ({item.cpdHours})
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.status === "Verified" && (
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                          Verified
                        </span>
                      )}
                      {item.status === "Pending Verification" && (
                        <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200">
                          Pending Audit
                        </span>
                      )}
                      {item.status.includes("Flagged") && (
                        <span className="font-bold text-rose-800 bg-rose-50 px-2 py-0.5 border border-rose-200">
                          Flagged
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                      {item.status !== "Verified" && (
                        <button
                          onClick={() => handleAudit(item.id, "Verified")}
                          className="bg-[#1b4332] hover:bg-[#112a1f] text-white text-[11px] font-bold px-2 py-1 rounded-xs"
                        >
                          Approve
                        </button>
                      )}
                      <Link
                        href={`/${locale}/dashboard/enrolments/${item.id}/confirmation`}
                        className="border border-slate-300 hover:bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-1 rounded-xs inline-block"
                      >
                        Receipt
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
