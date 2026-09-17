"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ShieldAlert, AlertTriangle, Loader2, CheckCircle2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Enrolment, Pagination, EnrolmentUser, PaymentStatus } from "@/components/admin/types";
import EnrolmentFilters from "@/components/admin/EnrolmentFilters";
import EnrolmentRow from "@/components/admin/EnrolmentRow";
import RejectDialog from "@/components/admin/RejectDialog";
import PaymentProofPreview from "@/components/admin/PaymentProofPreview";
import EnrolmentPagination from "@/components/admin/EnrolmentPagination";

export default function AdminEnrolmentsPage() {
  const params = useParams();
  const locale = (params.locale as string) || "en";
  const { addToast } = useToast();

  // ── Data state ──
  const [enrolments, setEnrolments] = useState<Enrolment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed set of enrolment IDs that have a duplicate credential (same course + same idDocNumber)
  const [duplicateIds, setDuplicateIds] = useState<Set<string>>(new Set());

  // ── Filters ──
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const limit = 15;

  // ── Action dialogs ──
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Enrolment | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<Enrolment | null>(null);

  // ── Fetch enrolments from the API ──

  const fetchEnrolments = useCallback(async (fetchStatus: PaymentStatus | "ALL", fetchPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = fetchStatus === "ALL" ? "" : `&status=${fetchStatus}`;
      const res = await fetch(`/api/admin/enrolments?page=${fetchPage}&limit=${limit}${statusParam}`);
      if (!res.ok) {
        if (res.status === 403) throw new Error("Admin access required");
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      const data = await res.json();
      setEnrolments(data.enrolments);
      setPagination(data.pagination);
      // Compute duplicate credentials: same courseId + same user.idDocNumber OR same user.iaLicense
      const seen = new Map<string, string[]>();
      const dupes = new Set<string>();
      const checkUser = (entryId: string, courseId: string, user: EnrolmentUser) => {
        if (user.idDocNumber) {
          const key = `${courseId}:idDoc:${user.idDocNumber}`;
          const list = seen.get(key) || [];
          list.push(entryId);
          seen.set(key, list);
        }
        if (user.iaLicense) {
          const key = `${courseId}:iaLicense:${user.iaLicense}`;
          const list = seen.get(key) || [];
          list.push(entryId);
          seen.set(key, list);
        }
      };
      for (const e of data.enrolments as Enrolment[]) {
        checkUser(e.id, e.course.id, e.user);
        if (e.members) {
          for (const m of e.members) {
            checkUser(m.id, e.course.id, m.user);
          }
        }
      }
      for (const ids of seen.values()) {
        if (ids.length > 1) ids.forEach((id) => dupes.add(id));
      }
      setDuplicateIds(dupes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setEnrolments([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  // Fetch on mount only
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEnrolments(statusFilter, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ──

  const handleStatusTabClick = (value: PaymentStatus | "ALL") => {
    setStatusFilter(value);
    setPage(1);
    fetchEnrolments(value, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchEnrolments(statusFilter, newPage);
  };

  const handleApprove = async (id: string, groupId?: string | null) => {
    setApprovingId(id);
    try {
      const res = await fetch(`/api/admin/enrolments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE", groupId }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed: ${res.status}`);
      }
      setEnrolments((prev) =>
        prev.map((e) => {
          if (groupId && e.groupId === groupId) {
            return { ...e, paymentStatus: "VERIFIED" as PaymentStatus };
          }
          return e.id === id ? { ...e, paymentStatus: "VERIFIED" as PaymentStatus } : e;
        }),
      );
      addToast({ title: "Enrolment approved", variant: "success" });
    } catch (err) {
      addToast({
        title: "Approval failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "danger",
      });
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      const res = await fetch(`/api/admin/enrolments/${rejectTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason: rejectReason || undefined, groupId: rejectTarget.groupId || undefined }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed: ${res.status}`);
      }
      setEnrolments((prev) =>
        prev.map((e) => {
          if (rejectTarget.groupId && e.groupId === rejectTarget.groupId) {
            return { ...e, paymentStatus: "REJECTED" as PaymentStatus, payerFullName: rejectReason };
          }
          return e.id === rejectTarget.id
            ? { ...e, paymentStatus: "REJECTED" as PaymentStatus, payerFullName: rejectReason }
            : e;
        }),
      );
      addToast({ title: "Enrolment rejected", variant: "warning" });
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      addToast({
        title: "Rejection failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "danger",
      });
    } finally {
      setRejecting(false);
    }
  };

  // ── Render ──

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Page header ── */}
        <header className="bg-white border border-slate-300 p-6 shadow-2xs border-t-4 border-t-primary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-primary" />
              <span>CPD Compliance & Administration Portal</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-primary">
              Enrolment Review Queue
            </h1>
            <p className="text-xs text-slate-500">
              Verify payment proofs and approve or reject enrolments
            </p>
          </div>
        </header>

        {/* ── Status filter tabs ── */}
        <EnrolmentFilters
          statusFilter={statusFilter}
          pagination={pagination}
          onTabClick={handleStatusTabClick}
        />

        {/* ── Main content area ── */}
        <section className="bg-white border border-slate-300 shadow-2xs">
          {/* ── Loading state ── */}
          {loading && (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-4 w-32 bg-slate-200 rounded-xs" />
                  <div className="h-4 w-20 bg-slate-200 rounded-xs" />
                  <div className="h-4 w-40 bg-slate-200 rounded-xs" />
                  <div className="h-4 w-20 bg-slate-200 rounded-xs" />
                  <div className="h-4 w-14 bg-slate-200 rounded-xs" />
                  <div className="h-4 w-16 bg-slate-200 rounded-xs" />
                  <div className="h-4 w-24 bg-slate-200 rounded-xs" />
                  <div className="h-4 w-24 bg-slate-200 rounded-xs ml-auto" />
                </div>
              ))}
              <div className="text-center pt-2 text-slate-400">
                <Loader2 className="w-3.5 h-3.5 inline animate-spin mr-1.5" />
                Loading enrolments...
              </div>
            </div>
          )}

          {/* ── Error state ── */}
          {!loading && error && (
            <div className="p-12 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
              <p className="font-bold text-destructive">Failed to load enrolments</p>
              <p className="text-slate-500">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchEnrolments(statusFilter, page)}>
                Retry
              </Button>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && enrolments.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-700">
                {statusFilter === "ALL"
                  ? "No enrolments yet"
                  : `No ${statusFilter?.toLowerCase().replace("_", " ")} enrolments`}
              </p>
              <p className="text-slate-500">
                {statusFilter === "ALL"
                  ? "Enrolments will appear here once learners submit their registration."
                  : "Try switching to a different status tab to see more results."}
              </p>
            </div>
          )}

          {/* ── Data table ── */}
          {!loading && !error && enrolments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse table-fixed">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase font-bold tracking-wider">
                    <th className="py-2 px-2 w-[160px]">Enrollee</th>
                    <th className="py-2 px-2 w-[120px]">ID Doc</th>
                    <th className="py-2 px-2 w-[180px]">Course</th>
                    <th className="py-2 px-2 w-[200px]">Schedules</th>
                    <th className="py-2 px-2 w-[80px]">Type</th>
                    <th className="py-2 px-2 w-[80px]">Registrants</th>
                    <th className="py-2 px-2 w-[100px]">Payment</th>
                    <th className="py-2 px-2 w-[90px]"><DollarSign className="w-3.5 h-3.5 inline mr-0.5" />Fee</th>
                    <th className="py-2 px-2 w-[80px]">Status</th>
                    <th className="py-2 px-2 w-[90px]">Submitted</th>
                    <th className="py-2 px-2 w-[140px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {enrolments.map((enrolment) => (
                    <EnrolmentRow
                      key={enrolment.id}
                      enrolment={enrolment}
                      locale={locale}
                      duplicateIds={duplicateIds}
                      approvingId={approvingId}
                      onApprove={handleApprove}
                      onRejectClick={(e) => { setRejectTarget(e); setRejectReason(""); }}
                      onPreviewClick={setPreviewTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination footer ── */}
          {pagination && pagination.totalPages > 1 && (
            <EnrolmentPagination
              pagination={pagination}
              page={page}
              onPageChange={handlePageChange}
            />
          )}
        </section>
      </div>

      {/* ── Reject confirmation dialog ── */}
      <RejectDialog
        rejectTarget={rejectTarget}
        rejectReason={rejectReason}
        rejecting={rejecting}
        locale={locale}
        onReasonChange={setRejectReason}
        onConfirm={handleReject}
        onClose={() => { setRejectTarget(null); setRejectReason(""); }}
      />

      {/* ── Payment proof preview dialog ── */}
      <PaymentProofPreview
        previewTarget={previewTarget}
        locale={locale}
        onClose={() => setPreviewTarget(null)}
      />
    </div>
  );
}