"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Calendar,
  Clock,
  Download,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  Building2,
  User,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function LearnerDashboardPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";

  // Mock Learner Data
  const learner = {
    name: "CHAN Tai Man",
    licenseNo: "IA12345678",
    organization: "Prudential Hong Kong",
    cpdCycle: "2026/2027 Cycle",
    earnedCpd: 9.0,
    requiredCpd: 15.0,
    mandatoryEthicsEarned: 2.0,
    mandatoryEthicsRequired: 3.0,
  };

  // Mock Active Enrolments
  const activeEnrolments = [
    {
      id: "DEMO-88392",
      title: "Regulatory Compliance & Ethics in Financial Practice",
      code: "IA-2026-CPD01",
      cpdHours: "3.0 Hours (Ethics)",
      date: "15 Sep 2026",
      time: "14:00 - 17:00",
      venue: "Main Campus Auditorium / Live Stream",
      status: "Confirmed",
      materialsAvailable: true,
    },
    {
      id: "DEMO-90124",
      title:
        "Anti-Money Laundering (AML) & Counter-Terrorist Financing Standards",
      code: "IA-2026-AML04",
      cpdHours: "4.0 Hours",
      date: "28 Oct 2026",
      time: "09:30 - 13:30",
      venue: "Online Interactive Webinar",
      status: "Confirmed",
      materialsAvailable: false,
    },
  ];

  // Mock Completed Enrolments / CPD History
  const completedHistory = [
    {
      id: "DEMO-71029",
      title: "ESG Risk Assessment & Sustainable Investment Regulations",
      code: "HKIB-2026-ESG",
      cpdHours: "2.0 Hours",
      completionDate: "12 May 2026",
      certificateNo: "CERT-2026-9912",
    },
    {
      id: "DEMO-65411",
      title: "Cross-Boundary Wealth Management Connect Compliance",
      code: "IA-2026-WMC02",
      cpdHours: "4.0 Hours",
      completionDate: "18 Feb 2026",
      certificateNo: "CERT-2026-4018",
    },
  ];

  const cpdPercentage = Math.min(
    100,
    Math.round((learner.earnedCpd / learner.requiredCpd) * 100),
  );

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Block */}
        <header className="bg-white border border-slate-300 p-6 shadow-2xs border-t-4 border-t-[#1b4332] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              <Building2 className="w-3.5 h-3.5 text-[#1b4332]" />
              <span>Learner Portal & License Log</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1b4332]">
              Welcome back, {learner.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono pt-0.5">
              <span>
                IA Reg No:{" "}
                <strong className="text-slate-900">{learner.licenseNo}</strong>
              </span>
              <span>•</span>
              <span>
                Organization:{" "}
                <strong className="text-slate-900">
                  {learner.organization}
                </strong>
              </span>
            </div>
          </div>

          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center justify-center space-x-1.5 bg-[#1b4332] hover:bg-[#112a1f] text-white font-bold px-4 py-2 text-xs uppercase tracking-wider rounded-xs transition-colors shadow-2xs self-start md:self-auto"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Browse Catalog</span>
          </Link>
        </header>

        {/* CPD Requirement Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {/* Main Progress Bar Card */}
          <div className="md:col-span-2 bg-white border border-slate-300 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-[#1b4332]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Annual CPD Fulfillment ({learner.cpdCycle})
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-[#1b4332] bg-emerald-50 border border-emerald-200 px-2 py-0.5">
                {learner.earnedCpd} / {learner.requiredCpd} Hours
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">
                  Progress towards requirement
                </span>
                <span className="font-bold text-slate-900">
                  {cpdPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-100 border border-slate-200 h-3.5 rounded-xs overflow-hidden p-0.5">
                <div
                  className="bg-[#1b4332] h-full rounded-2xs transition-all duration-500"
                  style={{ width: `${cpdPercentage}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              Remaining requirement:{" "}
              <strong>
                {(learner.requiredCpd - learner.earnedCpd).toFixed(1)} CPD hours
              </strong>{" "}
              prior to cycle declaration deadline.
            </p>
          </div>

          {/* Ethics Hours Requirement Card (Height Reduced) */}
          <div className="bg-white border border-slate-300 p-3.5 shadow-2xs space-y-2">
            <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#1b4332]" />
                <span>Mandatory Ethics</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {learner.mandatoryEthicsEarned} /{" "}
                {learner.mandatoryEthicsRequired} hrs
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-amber-900 bg-amber-50 border border-amber-200 p-1.5 rounded-xs">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="text-[11px] leading-tight font-medium">
                  1.0 Ethics CPD hour required before cycle end.
                </span>
              </div>
              <span className="text-[9px] text-amber-800/70 shrink-0 ml-2 font-mono">
                IA Guidelines
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Active Enrolments */}
        <section className="bg-white border border-slate-300 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1b4332] flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Upcoming & Active Enrolments</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {activeEnrolments.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {activeEnrolments.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 bg-slate-50/50 p-4 rounded-xs hover:border-slate-300 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 mb-1">
                      <span>Ref: {item.id}</span>
                      <span>•</span>
                      <span className="font-bold text-[#1b4332] bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                        {item.cpdHours}
                      </span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-slate-900">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      href={`/${locale}/dashboard/enrolments/${item.id}/confirmation`}
                      className="inline-flex items-center space-x-1 border border-slate-300 hover:bg-white text-slate-700 text-xs font-bold px-2.5 py-1 rounded-xs transition-colors"
                    >
                      <span>Receipt</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {item.date} ({item.time})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Completed CPD Records & Certificates */}
        <section className="bg-white border border-slate-300 p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1b4332] flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4" />
              <span>Completed CPD Log & Certificates</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Module Name & Code</th>
                  <th className="py-2.5 px-3">Date Completed</th>
                  <th className="py-2.5 px-3">CPD Hours</th>
                  <th className="py-2.5 px-3">Certificate ID</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {completedHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="font-serif font-bold text-slate-900">
                        {item.title}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {item.code}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono whitespace-nowrap">
                      {item.completionDate}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#1b4332] bg-emerald-50 px-1.5 py-0.5 border border-emerald-200 whitespace-nowrap">
                        {item.cpdHours}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {item.certificateNo}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() =>
                          alert(
                            `Downloading Certificate ${item.certificateNo}...`,
                          )
                        }
                        className="inline-flex items-center space-x-1 text-[#1b4332] hover:text-[#112a1f] font-bold text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
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
