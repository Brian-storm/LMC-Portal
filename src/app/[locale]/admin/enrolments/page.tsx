"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldAlert,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Ban,
  ImageIcon,
  Eye,
  User,
  Users,
  Copy,
} from "lucide-react";

// ── Types matching the API response ──

type PaymentStatus = "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "REFUNDED";
type EnrollmentType = "INDIVIDUAL" | "ORGANIZATION";
type PaymentMethod = "FPS" | "ALIPAY" | "E_BANKING" | "CHEQUE" | "CASH" | "CORPORATE_INVOICE";

interface EnrolmentUser {
  id: string;
  nameEn: string;
  nameZh: string;
  email: string;
  idDocNumber: string;
  iaLicense: string | null;
  organization: string | null;
}

interface EnrolmentCourse {
  id: string;
  slug: string;
  nameEn: string;
  nameZh: string;
  iaRefNumber: string | null;
  cpdHours: number;
}

interface Enrolment {
  id: string;
  enrollmentType: EnrollmentType;
  groupId: string | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  isThirdPartyPay: boolean;
  payerFullName: string | null;
  paymentProofUrl: string | null;
  receiptNumber: string | null;
  submittedAt: string;
  user: EnrolmentUser;
  course: EnrolmentCourse;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ── Status tag definitions ──

const STATUS_TABS: { label: string; value: PaymentStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING_VERIFICATION" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
];

const STATUS_BADGE: Record<PaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING_VERIFICATION: { label: "Pending", variant: "outline" },
  VERIFIED: { label: "Verified", variant: "default" },
  REJECTED: { label: "Rejected", variant: "destructive" },
  REFUNDED: { label: "Refunded", variant: "secondary" },
};

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  FPS: "FPS",
  ALIPAY: "Alipay",
  E_BANKING: "E-Banking",
  CHEQUE: "Cheque",
  CASH: "Cash",
  CORPORATE_INVOICE: "Corporate Invoice",
};

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
      for (const e of data.enrolments as Enrolment[]) {
        // Check by idDocNumber
        if (e.user.idDocNumber) {
          const key = `${e.course.id}:idDoc:${e.user.idDocNumber}`;
          const list = seen.get(key) || [];
          list.push(e.id);
          seen.set(key, list);
        }
        // Check by iaLicense
        if (e.user.iaLicense) {
          const key = `${e.course.id}:iaLicense:${e.user.iaLicense}`;
          const list = seen.get(key) || [];
          list.push(e.id);
          seen.set(key, list);
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

  // Fetch on mount only — subsequent fetches are triggered by the tab click or pagination click handlers
  useEffect(() => {
    fetchEnrolments(statusFilter, page);
    // eslint-disable-next-line react-hooks/set-state-in-effect
  }, []);

  // ── Tab click handler: update both filter and page atomically ──

  const handleStatusTabClick = (value: PaymentStatus | "ALL") => {
    setStatusFilter(value);
    setPage(1);
    fetchEnrolments(value, 1);
  };

  // ── Approve handler ──
  // 1: Set the approving button to loading state to prevent double-clicks
  // 2: Call PATCH /api/admin/enrolments/[id] with action=APPROVE
  // 3: On success, optimistically update the local row to VERIFIED (no refetch needed)
  // 4: On failure, show a danger toast with the error message
  // 5: Always clear the loading state in finally

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const res = await fetch(`/api/admin/enrolments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed: ${res.status}`);
      }
      // Optimistically update the local state
      setEnrolments((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, paymentStatus: "VERIFIED" as PaymentStatus } : e,
        ),
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

  // ── Reject handler ──
  // 1: Guard against null rejectTarget (dialog closed without confirming)
  // 2: Set rejecting=true to show loading state on the confirm button
  // 3: Call PATCH /api/admin/enrolments/[id] with action=REJECT + the typed reason
  // 4: On success, optimistically update the local row to REJECTED
  // 5: Close the rejection dialog and clear the reason input
  // 6: On failure, show a danger toast with the error message
  // 7: Always clear the loading state in finally

  const handleReject = async () => {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      const res = await fetch(`/api/admin/enrolments/${rejectTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason: rejectReason || undefined }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed: ${res.status}`);
      }
      // Optimistically update the local state
      setEnrolments((prev) =>
        prev.map((e) =>
          e.id === rejectTarget.id
            ? { ...e, paymentStatus: "REJECTED" as PaymentStatus, payerFullName: rejectReason }
            : e,
        ),
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

  // ── Helpers ──

  // formatDate: converts ISO string to YYYY-MM-DD using en-CA locale (simplest cross-browser approach)
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-CA");
  };

  // getName: returns the best available name for the current locale (zh fields for zh-hk/zh-cn, en fallback)
  const getName = (e: Enrolment) => {
    const name = locale === "zh-hk" || locale === "zh-cn" ? e.user.nameZh : e.user.nameEn;
    return name || e.user.nameEn;
  };

  // getCourseName: same locale-aware selection for course names
  const getCourseName = (e: Enrolment) => {
    return locale === "zh-hk" || locale === "zh-cn" ? e.course.nameZh : e.course.nameEn;
  };

  // getStatusVariant: maps PaymentStatus to the corresponding Badge variant for consistent visual styling
  const getStatusVariant = (status: PaymentStatus): "default" | "secondary" | "destructive" | "outline" => {
    return STATUS_BADGE[status]?.variant ?? "outline";
  };

  // ── Render ──

  return (
    <div className="bg-[#f6f8f6] text-slate-800 min-h-screen py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ── Page header ── */}
        <header className="bg-white border border-slate-300 p-6 shadow-2xs border-t-4 border-t-[#1b4332] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              <ShieldAlert className="w-3.5 h-3.5 text-[#1b4332]" />
              <span>CPD Compliance & Administration Portal</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#1b4332]">
              Enrolment Review Queue
            </h1>
            <p className="text-xs text-slate-500">
              Verify payment proofs and approve or reject enrolments
            </p>
          </div>
        </header>

        {/* ── Status filter tabs ── */}
        <div className="flex items-center gap-1 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusTabClick(tab.value)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors ${
                statusFilter === tab.value
                  ? "bg-[#1b4332] text-white"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              {tab.value !== "ALL" && pagination && statusFilter === tab.value && (
                <span className="ml-1.5 text-[10px] opacity-70">({pagination.total})</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Main content area ── */}
        <section className="bg-white border border-slate-300 shadow-2xs">
          {/* ── Loading state: skeleton rows ── */}
          {loading && (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-3 w-32 bg-slate-200 rounded-xs" />
                  <div className="h-3 w-40 bg-slate-200 rounded-xs" />
                  <div className="h-3 w-20 bg-slate-200 rounded-xs" />
                  <div className="h-3 w-16 bg-slate-200 rounded-xs" />
                  <div className="h-3 w-24 bg-slate-200 rounded-xs" />
                  <div className="h-3 w-24 bg-slate-200 rounded-xs ml-auto" />
                </div>
              ))}
              <div className="text-xs text-slate-400 text-center pt-2">
                <Loader2 className="w-3.5 h-3.5 inline animate-spin mr-1.5" />
                Loading enrolments...
              </div>
            </div>
          )}

          {/* ── Error state ── */}
          {!loading && error && (
            <div className="p-12 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
              <p className="text-sm font-bold text-destructive">Failed to load enrolments</p>
              <p className="text-xs text-slate-500">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchEnrolments(statusFilter, page)}>
                Retry
              </Button>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && enrolments.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {statusFilter === "ALL"
                  ? "No enrolments yet"
                  : `No ${STATUS_BADGE[statusFilter as PaymentStatus]?.label.toLowerCase() ?? ""} enrolments`}
              </p>
              <p className="text-xs text-slate-500">
                {statusFilter === "ALL"
                  ? "Enrolments will appear here once learners submit their registration."
                  : "Try switching to a different status tab to see more results."}
              </p>
            </div>
          )}

          {/* ── Data table ── */}
          {!loading && !error && enrolments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Enrollee</th>
                    <th className="py-2.5 px-3">Course</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Payment</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Submitted</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {enrolments.map((enrolment) => (
                    <tr key={enrolment.id} className="hover:bg-slate-50/80">
                      {/* Enrollee */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400 shrink-0" />
                          {getName(enrolment)}
                          {duplicateIds.has(enrolment.id) && (
                            <span
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-xs"
                              title={`Duplicate credential: ${enrolment.user.idDocNumber}`}
                            >
                              <Copy className="w-2.5 h-2.5" />
                              Duplicate
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {enrolment.user.organization ?? enrolment.user.email}
                        </div>
                        {enrolment.user.iaLicense && (
                          <div className="text-[10px] font-mono text-slate-400">
                            IA: {enrolment.user.iaLicense}
                          </div>
                        )}
                      </td>

                      {/* Course */}
                      <td className="py-3 px-3">
                        <div className="font-serif font-bold text-slate-900">
                          {getCourseName(enrolment)}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500">
                          {enrolment.course.iaRefNumber ?? enrolment.course.slug}
                          <span className="ml-1.5">{enrolment.course.cpdHours} CPD hrs</span>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {enrolment.enrollmentType === "ORGANIZATION" ? (
                            <Users className="w-3 h-3 text-slate-400" />
                          ) : (
                            <User className="w-3 h-3 text-slate-400" />
                          )}
                          <span className="text-slate-700">
                            {enrolment.enrollmentType === "ORGANIZATION" ? "Group" : "Individual"}
                          </span>
                        </div>
                        {enrolment.isThirdPartyPay && (
                          <div className="text-[10px] text-amber-700">
                            3rd-party: {enrolment.payerFullName}
                          </div>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-3">
                        {enrolment.paymentMethod ? (
                          <span className="font-mono text-slate-700">
                            {PAYMENT_METHOD_LABELS[enrolment.paymentMethod] ?? enrolment.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                        {enrolment.receiptNumber && (
                          <div className="text-[10px] font-mono text-emerald-700">
                            RCPT: {enrolment.receiptNumber}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <Badge variant={getStatusVariant(enrolment.paymentStatus)}>
                          {STATUS_BADGE[enrolment.paymentStatus]?.label ?? enrolment.paymentStatus}
                        </Badge>
                        {enrolment.paymentStatus === "REJECTED" && enrolment.payerFullName && (
                          <div className="text-[10px] text-destructive mt-0.5 max-w-32 truncate" title={enrolment.payerFullName}>
                            {enrolment.payerFullName}
                          </div>
                        )}
                      </td>

                      {/* Submitted */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3 h-3 shrink-0" />
                          {formatDate(enrolment.submittedAt)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                        {/* Payment proof preview */}
                        {enrolment.paymentProofUrl && (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => setPreviewTarget(enrolment)}
                            title="View payment proof"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}

                        {/* Approve — only show for pending */}
                        {enrolment.paymentStatus === "PENDING_VERIFICATION" && (
                          <Button
                            variant="default"
                            size="xs"
                            loading={approvingId === enrolment.id}
                            disabled={approvingId === enrolment.id}
                            onClick={() => handleApprove(enrolment.id)}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Approve
                          </Button>
                        )}

                        {/* Reject — only show for pending */}
                        {enrolment.paymentStatus === "PENDING_VERIFICATION" && (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => { setRejectTarget(enrolment); setRejectReason(""); }}
                            className="border-rose-300 text-rose-700 hover:bg-rose-50"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination footer ── */}
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-slate-200 px-3 py-2 flex items-center justify-between text-xs text-slate-500">
              <span>
                Page {pagination.page} of {pagination.totalPages}
                &nbsp;({pagination.total} total)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="xs"
                  disabled={page <= 1}
                  onClick={() => { const next = Math.max(1, page - 1); setPage(next); fetchEnrolments(statusFilter, next); }}
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={page >= pagination.totalPages}
                  onClick={() => { const next = page + 1; setPage(next); fetchEnrolments(statusFilter, next); }}
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Reject confirmation dialog ── */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => { if (!open) setRejectTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Enrolment</DialogTitle>
            <DialogDescription>
              This will mark the enrolment as rejected. The learner will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {rejectTarget && (
              <div className="bg-slate-50 border border-slate-200 p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Enrollee:</span>
                  <span className="font-bold text-slate-800">{getName(rejectTarget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Course:</span>
                  <span className="font-bold text-slate-800">{getCourseName(rejectTarget)}</span>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Rejection reason <span className="text-destructive">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Payment proof is illegible, please re-upload a clear copy."
                rows={3}
                className="w-full text-xs border border-slate-300 bg-white px-2.5 py-1.5 rounded-xs focus:outline-none focus:border-[#1b4332] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              loading={rejecting}
              disabled={!rejectReason.trim() || rejecting}
            >
              <Ban className="w-3.5 h-3.5" />
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Payment proof preview dialog ── */}
      <Dialog open={!!previewTarget} onOpenChange={(open) => { if (!open) setPreviewTarget(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
            <DialogDescription>
              {previewTarget && `${getName(previewTarget)} — ${getCourseName(previewTarget)}`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center min-h-[200px] bg-slate-50 border border-slate-200 rounded-xs">
            {previewTarget?.paymentProofUrl ? (
              <div className="text-center space-y-2 p-4">
                {/* S3 presigned URL not yet implemented — show placeholder */}
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  Payment proof image will be displayed here via S3 presigned URL.
                </p>
                <p className="text-[10px] font-mono text-slate-400 truncate max-w-full">
                  {previewTarget.paymentProofUrl}
                </p>
              </div>
            ) : (
              <div className="text-center p-4">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No payment proof uploaded.</p>
              </div>
            )}
          </div>

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}