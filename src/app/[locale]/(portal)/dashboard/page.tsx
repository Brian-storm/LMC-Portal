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
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LearnerDashboardPage() {
  const params = useParams();
  const rawLocale = (params.locale as string) || "en";
  const locale = rawLocale.replace(/^\/+/, "");

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
    <div className="bg-[#f2f6f3] text-slate-900 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Governance Utility Banner */}
        <div className="bg-[#1b4332] text-emerald-100 text-[11px] font-mono px-4 py-2 border-b-2 border-[#2d6a4f] flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="font-semibold tracking-wider uppercase">
              HK SAR REGULATORY COMPLIANCE DASHBOARD
            </span>
          </div>
          <div className="flex items-center space-x-4 text-emerald-200">
            <span>Cycle Status: Active</span>
            <span>•</span>
            <span>Tamper-Proof Ledger</span>
          </div>
        </div>

        {/* Header Block */}
        <header className="bg-white border border-emerald-950/20 p-6 md:p-8 shadow-xs border-t-4 border-t-[#1b4332] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-[#2d6a4f] uppercase">
              <Building2 className="w-3.5 h-3.5 text-[#1b4332]" />
              <span>Learner Portal & License Compliance Log</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332] tracking-tight">
              Welcome back, {learner.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-mono pt-1">
              <span className="bg-emerald-50 text-[#1b4332] border border-emerald-200/80 px-2 py-0.5 font-bold">
                IA Reg No: {learner.licenseNo}
              </span>
              <span className="text-slate-300">•</span>
              <span>
                Organization:{" "}
                <strong className="text-slate-800">
                  {learner.organization}
                </strong>
              </span>
            </div>
          </div>

          {/* Browse Catalog Button */}
          <Button
            asChild
            className="bg-[#1b4332] hover:bg-[#2d6a4f] text-white rounded-none text-xs font-bold uppercase tracking-wider px-5 py-2.5 self-start md:self-auto border border-emerald-900 shadow-xs"
          >
            <Link href={`/${locale}/courses`}>
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Catalog
            </Link>
          </Button>
        </header>

        {/* CPD Requirement Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {/* Main Progress Bar Card */}
          <div className="md:col-span-2 bg-white border border-emerald-950/20 p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-900/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#1b4332]" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#1b4332]">
                    Annual CPD Fulfillment ({learner.cpdCycle})
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-[#1b4332] bg-emerald-50 border border-emerald-200 px-2.5 py-1">
                  {learner.earnedCpd} / {learner.requiredCpd} Hours
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Progress towards requirement
                  </span>
                  <span className="font-bold font-mono text-[#1b4332]">
                    {cpdPercentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200 h-4 p-0.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] h-full transition-all duration-500"
                    style={{ width: `${cpdPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
              Remaining requirement:{" "}
              <strong className="text-[#1b4332] font-semibold">
                {(learner.requiredCpd - learner.earnedCpd).toFixed(1)} CPD hours
              </strong>{" "}
              prior to cycle declaration deadline.
            </p>
          </div>

          {/* Ethics Hours Requirement Card */}
          <div className="bg-white border border-emerald-950/20 p-5 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="border-b border-emerald-900/10 pb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1b4332] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1b4332]" />
                  <span>Mandatory Ethics</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  {learner.mandatoryEthicsEarned} /{" "}
                  {learner.mandatoryEthicsRequired} hrs
                </span>
              </div>

              <div className="flex items-start space-x-2 text-xs text-amber-900 bg-amber-50/80 border border-amber-200/80 p-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[11px] leading-snug font-medium block">
                    1.0 Ethics CPD hour required before cycle end.
                  </span>
                  <span className="text-[9px] text-amber-800/80 font-mono block uppercase">
                    IA Compliance Mandate
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between pt-2 border-t border-slate-100">
              <span>Status: Pending Ethics Unit</span>
            </div>
          </div>
        </div>

        {/* Upcoming Active Enrolments */}
        <section className="bg-white border border-emerald-950/20 p-6 shadow-xs space-y-4">
          <div className="border-b border-emerald-900/10 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1b4332] flex items-center space-x-2">
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
                className="border border-slate-200 bg-[#fbfdfb] p-4 hover:border-emerald-700/40 transition-colors space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500 mb-1">
                      <span>Ref: {item.id}</span>
                      <span>•</span>
                      <span className="font-bold text-[#1b4332] bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                        {item.cpdHours}
                      </span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-slate-900">
                      {item.title}
                    </h3>
                  </div>

                  {/* Smaller Receipt Button using Button asChild */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="rounded-none border-slate-300 text-slate-800 hover:bg-slate-100 text-[10px] font-bold uppercase tracking-wider h-7 px-2.5"
                    >
                      <Link
                        href={`/${locale}/dashboard/enrolments/${item.id}/confirmation`}
                      >
                        Receipt
                        <ExternalLink className="w-3 h-3 ml-1 text-slate-500" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-200/80">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0" />
                    <span>
                      {item.date} ({item.time})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0" />
                    <span className="truncate">{item.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Completed CPD Records & Certificates */}
        <section className="bg-white border border-emerald-950/20 p-6 shadow-xs space-y-4">
          <div className="border-b border-emerald-900/10 pb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1b4332] flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4" />
              <span>Completed CPD Log & Verified Certificates</span>
            </h2>
            <span className="text-[10px] font-mono uppercase bg-emerald-50 text-[#1b4332] border border-emerald-200 px-2 py-0.5">
              Audited Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-[#1b4332] bg-emerald-50/50 text-[#1b4332] uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-3">Module Name & Code</th>
                  <th className="py-3 px-3">Date Completed</th>
                  <th className="py-3 px-3">CPD Hours</th>
                  <th className="py-3 px-3">Certificate ID</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {completedHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-emerald-50/30 transition-colors"
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-serif font-bold text-slate-900 text-sm">
                        {item.title}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500">
                        {item.code}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-mono whitespace-nowrap">
                      {item.completionDate}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-[#1b4332] bg-emerald-50 px-2 py-0.5 border border-emerald-200 whitespace-nowrap">
                        {item.cpdHours}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                      {item.certificateNo}
                    </td>
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          alert(
                            `Downloading Official Certificate ${item.certificateNo}...`,
                          )
                        }
                        className="text-[#1b4332] hover:text-[#2d6a4f] hover:bg-emerald-50 text-[10px] font-bold uppercase tracking-wider h-6 px-2"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        PDF
                      </Button>
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
