"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { ShieldAlert, AlertTriangle, Loader2, CheckCircle2, DollarSign, Search, X } from "lucide-react";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Enrolment, Pagination, EnrolmentUser, PaymentStatus } from "@/components/admin/types";
import EnrolmentFilters from "@/components/admin/EnrolmentFilters";
import EnrolmentRow from "@/components/admin/EnrolmentRow";
import RejectDialog from "@/components/admin/RejectDialog";
import PaymentProofPreview from "@/components/admin/PaymentProofPreview";
import EnrolmentPagination from "@/components/admin/EnrolmentPagination";

export default function AdminEnrolmentsPage() {
  const dict = useAdminDict();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
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
  // Read search from URL params on mount (useSearchParams is synchronous)
  const urlSearchTerm = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(urlSearchTerm);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearchTerm);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limit = 15;

  // Debounce search input (300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchTerm]);

  // ── Action dialogs ──
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Enrolment | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<Enrolment | null>(null);

  // ── Batch selection ──
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchConfirmApprove, setBatchConfirmApprove] = useState(false);
  const [batchRejectOpen, setBatchRejectOpen] = useState(false);
  const [batchRejectReason, setBatchRejectReason] = useState("");

  // ── Fetch enrolments from the API ──

  const fetchEnrolments = useCallback(async (
    fetchStatus: PaymentStatus | "ALL",
    fetchPage: number,
    fetchSearch: string,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = fetchStatus === "ALL" ? "" : `&status=${fetchStatus}`;
      const searchParam = fetchSearch ? `&search=${encodeURIComponent(fetchSearch)}` : "";
      const res = await fetch(`/api/admin/enrolments?page=${fetchPage}&limit=${limit}${statusParam}${searchParam}`);
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

  // When debounced search changes, reset to page 1, update URL, and refetch
  useEffect(() => {
    const sp = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      sp.set("search", debouncedSearch);
    } else {
      sp.delete("search");
    }
    router.replace(`/${locale}/admin/enrolments?${sp.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
    fetchEnrolments(statusFilter, 1, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // ── Handlers ──

  const handleStatusTabClick = (value: PaymentStatus | "ALL") => {
    setStatusFilter(value);
    setPage(1);
    fetchEnrolments(value, 1, debouncedSearch);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchEnrolments(statusFilter, newPage, debouncedSearch);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
  };

  // ── Batch selection handlers ──

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === enrolments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(enrolments.map((e) => e.id)));
    }
  };

  const handleBatchApprove = async () => {
    setBatchSubmitting(true);
    const ids = Array.from(selectedIds);
    try {
      const res = await fetch("/api/admin/enrolments/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE", ids }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed: ${res.status}`);
      }
      const result = await res.json();
      setEnrolments((prev) =>
        prev.map((e) =>
          ids.includes(e.id) ? { ...e, paymentStatus: "VERIFIED" as PaymentStatus } : e,
        ),
      );
      if (result.skippedCount > 0) {
        addToast({
          title: dict.batchPartial.replace("{updated}", String(result.updatedCount)).replace("{skipped}", String(result.skippedCount)),
          variant: "warning",
        });
      } else {
        addToast({ title: dict.batchSuccess.replace("{count}", String(result.updatedCount)), variant: "success" });
      }
      setSelectedIds(new Set());
      setBatchConfirmApprove(false);
    } catch (err) {
      addToast({
        title: dict.toastApprovalFailed,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "danger",
      });
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleBatchReject = async () => {
    setBatchSubmitting(true);
    const ids = Array.from(selectedIds);
    try {
      const res = await fetch("/api/admin/enrolments/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", ids, reason: batchRejectReason || undefined }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed: ${res.status}`);
      }
      const result = await res.json();
      setEnrolments((prev) =>
        prev.map((e) =>
          ids.includes(e.id)
            ? { ...e, paymentStatus: "REJECTED" as PaymentStatus, payerFullName: batchRejectReason }
            : e,
        ),
      );
      if (result.skippedCount > 0) {
        addToast({
          title: dict.batchPartial.replace("{updated}", String(result.updatedCount)).replace("{skipped}", String(result.skippedCount)),
          variant: "warning",
        });
      } else {
        addToast({ title: dict.batchSuccess.replace("{count}", String(result.updatedCount)), variant: "warning" });
      }
      setSelectedIds(new Set());
      setBatchRejectReason("");
    } catch (err) {
      addToast({
        title: dict.toastRejectionFailed,
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "danger",
      });
    } finally {
      setBatchSubmitting(false);
    }
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
      addToast({ title: dict.toastApproved, variant: "success" });
    } catch (err) {
      addToast({
        title: dict.toastApprovalFailed,
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
      addToast({ title: dict.toastRejected, variant: "warning" });
      setRejectTarget(null);
      setRejectReason("");
    } catch (err) {
      addToast({
        title: dict.toastRejectionFailed,
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
              <span>{ dict.portalTitle }</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-primary">
              { dict.reviewQueue }
            </h1>
            <p className="text-xs text-slate-500">
              { dict.reviewDescription }
            </p>
          </div>
        </header>

        {/* ── Search input ── */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder={dict.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 h-10 text-sm bg-white border-slate-300 focus-visible:ring-emerald-600"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={dict.search}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Status filter tabs ── */}
        <EnrolmentFilters
          statusFilter={statusFilter}
          pagination={pagination}
          onTabClick={handleStatusTabClick}
          dict={dict}
        />

        {/* ── Batch toolbar ── */}
        {selectedIds.size > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 px-4 py-2.5 flex items-center justify-between rounded-xs shadow-2xs">
            <span className="text-sm font-medium text-emerald-800">
              {dict.selectedCount.replace("{count}", String(selectedIds.size))}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="xs"
                loading={batchSubmitting}
                disabled={batchSubmitting}
                onClick={() => setBatchConfirmApprove(true)}
              >
                {dict.batchApprove}
              </Button>
              <Button
                variant="outline"
                size="xs"
                loading={batchSubmitting}
                disabled={batchSubmitting}
                onClick={() => setBatchRejectOpen(true)}
                className="border-rose-300 text-rose-700 hover:bg-rose-50"
              >
                {dict.batchReject}
              </Button>
            </div>
          </div>
        )}

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
                { dict.loading }
              </div>
            </div>
          )}

          {/* ── Error state ── */}
          {!loading && error && (
            <div className="p-12 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
              <p className="font-bold text-destructive">{ dict.error }</p>
              <p className="text-slate-500">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchEnrolments(statusFilter, page, debouncedSearch)}>
                { dict.retry }
              </Button>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && enrolments.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-700">
                {statusFilter === "ALL"
                  ? dict.noData
                  : `${
                      statusFilter === "PENDING_VERIFICATION"
                        ? dict.pendingVerification
                        : statusFilter === "VERIFIED"
                          ? dict.verified
                          : dict.rejected
                    }`}
              </p>
              <p className="text-slate-500">
                {statusFilter === "ALL"
                  ? dict.emptyAllHint
                  : dict.emptyFilteredHint}
              </p>
            </div>
          )}

          {/* ── Data table ── */}
          {!loading && !error && enrolments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse table-fixed">
                <thead>
<tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase font-bold tracking-wider">
                      <th className="py-2 px-2 w-[30px]">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === enrolments.length && enrolments.length > 0}
                          onChange={handleSelectAll}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                        />
                      </th>
                      <th className="py-2 px-2 w-[160px]">{ dict.enrollee }</th>
                    <th className="py-2 px-2 w-[120px]">{ dict.idDoc }</th>
                    <th className="py-2 px-2 w-[180px]">{ dict.course }</th>
                    <th className="py-2 px-2 w-[200px]">{ dict.schedules }</th>
                    <th className="py-2 px-2 w-[80px]">{ dict.type }</th>
                    <th className="py-2 px-2 w-[80px]">{ dict.registrants }</th>
                    <th className="py-2 px-2 w-[100px]">{ dict.payment }</th>
                    <th className="py-2 px-2 w-[90px]"><DollarSign className="w-3.5 h-3.5 inline mr-0.5" />{ dict.fee }</th>
                    <th className="py-2 px-2 w-[80px]">{ dict.status }</th>
                    <th className="py-2 px-2 w-[90px]">{ dict.submitted }</th>
                    <th className="py-2 px-2 w-[140px] text-right">{ dict.actions }</th>
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
                      selected={selectedIds.has(enrolment.id)}
                      onToggle={handleToggleSelect}
                      onApprove={handleApprove}
                      onRejectClick={(e) => { setRejectTarget(e); setRejectReason(""); }}
                      onPreviewClick={setPreviewTarget}
                      dict={dict}
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
              dict={dict}
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
        dict={dict}
        onReasonChange={setRejectReason}
        onConfirm={handleReject}
        onClose={() => { setRejectTarget(null); setRejectReason(""); }}
      />

      {/* ── Batch approve confirmation dialog ── */}
      <Dialog open={batchConfirmApprove} onOpenChange={(o) => { if (!o) setBatchConfirmApprove(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dict.batchConfirmApprove.replace("{count}", String(selectedIds.size))}</DialogTitle>
            <DialogDescription>
              {dict.selectedCount.replace("{count}", String(selectedIds.size))}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatchConfirmApprove(false)}>
              {dict.cancel}
            </Button>
            <Button
              variant="default"
              onClick={handleBatchApprove}
              loading={batchSubmitting}
              disabled={batchSubmitting}
            >
              {dict.batchApprove}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Batch reject dialog ── */}
      {batchRejectOpen && selectedIds.size > 0 && (
        <RejectDialog
          rejectTarget={null}
          rejectReason={batchRejectReason}
          rejecting={batchSubmitting}
          locale={locale}
          dict={dict}
          batchCount={selectedIds.size}
          onReasonChange={setBatchRejectReason}
          onConfirm={handleBatchReject}
          onClose={() => { setBatchRejectOpen(false); setBatchRejectReason(""); }}
        />
      )}

      {/* ── Payment proof preview dialog ── */}
      <PaymentProofPreview
        previewTarget={previewTarget}
        locale={locale}
        dict={dict}
        onClose={() => setPreviewTarget(null)}
      />
    </div>
  );
}