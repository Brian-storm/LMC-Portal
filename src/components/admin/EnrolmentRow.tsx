"use client";

import { Fragment, type ReactNode } from "react";
import { User, Users, Copy, Clock, FileText, Eye, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Enrolment } from "./types";
import { STATUS_BADGE, PAYMENT_METHOD_LABELS, ID_DOC_TYPE_LABELS } from "./constants";
import type { AdminDict } from "@/dictionaries/types";
import EnrolmentMemberRow from "./EnrolmentMemberRow";

// ── Helpers ──

const STATUS_DICT_KEY: Record<string, keyof AdminDict> = {
  PENDING_VERIFICATION: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  REFUNDED: "refunded",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-CA");
};

// Renders both Chinese and English names stacked, but only when they differ.
// Enrollment form only collects English name, so nameZh/nameEn are often identical for guest enrollees.
const BilingualName = ({ user }: { user: { nameZh: string; nameEn: string } }): ReactNode => {
  const same = user.nameZh === user.nameEn || !user.nameZh;
  return same ? (
    <div className="text-slate-900">{user.nameEn}</div>
  ) : (
    <div>
      <div className="text-slate-900">{user.nameZh}</div>
      <div className="text-[10px] text-slate-500 leading-tight">{user.nameEn}</div>
    </div>
  );
};

const getCourseName = (e: Enrolment, locale: string) => {
  if (locale === "zh-cn") return e.course.nameCn || e.course.nameZh;
  return locale === "zh-hk" ? e.course.nameZh : e.course.nameEn;
};

const getTotalFee = (enrolment: Enrolment): number | null => {
  if (enrolment.enrollmentType === "ORGANIZATION" && enrolment.members && enrolment.members.length > 0) {
    const total = enrolment.members.reduce((sum, m) => sum + (m.fee ?? 0), 0);
    return total > 0 ? total : enrolment.fee;
  }
  return enrolment.fee;
};

const formatFee = (fee: number | null): string => {
  if (fee == null) return "—";
  return `HK$${fee.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ── Props ──

interface EnrolmentRowProps {
  enrolment: Enrolment;
  locale: string;
  duplicateIds: Set<string>;
  approvingId: string | null;
  onApprove: (id: string, groupId?: string | null) => void;
  onRejectClick: (enrolment: Enrolment) => void;
  onPreviewClick: (enrolment: Enrolment) => void;
  dict: AdminDict;
}

export default function EnrolmentRow({
  enrolment,
  locale,
  duplicateIds,
  approvingId,
  onApprove,
  onRejectClick,
  onPreviewClick,
  dict,
}: EnrolmentRowProps) {
  const isGroup = enrolment.enrollmentType === "ORGANIZATION";
  const totalFee = getTotalFee(enrolment);

  return (
    <Fragment>
      {/* Parent row: enroller or individual */}
      <tr className="hover:bg-slate-50/80">
        {/* Enrollee */}
        <td className="py-2 px-2">
          {isGroup ? (
            <>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {enrolment.user.organization || <BilingualName user={enrolment.user} />}
              </div>
              <div className="text-[10px] text-slate-500">
                { dict.enroller } {enrolment.user.email}
              </div>
              {enrolment.user.organization && (
                <div className="text-[10px] text-slate-400 mt-1">
                  <BilingualName user={enrolment.user} />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="font-bold text-slate-900 flex items-start gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <BilingualName user={enrolment.user} />
                </div>
                {duplicateIds.has(enrolment.id) && (
                  <span
                    className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-xs"
                    title={`Duplicate credential: ${enrolment.user.idDocNumber}`}
                  >
                    <Copy className="w-2.5 h-2.5" />
{ dict.duplicate }
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500">
                {enrolment.user.email}
              </div>
              {enrolment.user.organization && (
                <div className="text-[10px] text-slate-400">
                  {enrolment.user.organization}
                </div>
              )}
              <div className="text-[10px] text-slate-400">
                {enrolment.user.phone}
              </div>
              {enrolment.user.iaLicense && (
                <div className="text-[10px] font-mono text-slate-400">
                  IA: {enrolment.user.iaLicense}
                </div>
              )}
            </>
          )}
        </td>

        {/* ID Doc — empty for organization (enroller is not a registrant) */}
        <td className="py-2 px-2 whitespace-nowrap">
          {isGroup ? (
            <span className="text-slate-400">—</span>
          ) : enrolment.user.idDocNumber ? (
            <>
              <span className="text-[10px] text-slate-500 mr-1">
                {enrolment.user.idDocType ? ID_DOC_TYPE_LABELS[enrolment.user.idDocType] ?? enrolment.user.idDocType : ""}
              </span>
              <span className="font-mono text-slate-700">{enrolment.user.idDocNumber}</span>
            </>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>

        {/* Course */}
        <td className="py-2 px-2">
          <div className="font-serif font-bold text-slate-900">
            {getCourseName(enrolment, locale)}
          </div>
          <div className="font-mono text-[10px] text-slate-500">
            {enrolment.course.iaRefNumber ?? enrolment.course.slug}
            <span className="ml-1.5">{enrolment.course.cpdHours} { dict.cpdHrs }</span>
          </div>
        </td>

        {/* Schedules — enrolled sessions for this registrant */}
        <td className="py-2 px-2">
          {(!isGroup && enrolment.schedules && enrolment.schedules.length > 0) ? (
            <div className="space-y-0.5">
              {enrolment.schedules.map((rs) => (
                <div key={rs.schedule.id} className="text-[10px] leading-tight">
                  <span className="text-[10px] text-slate-700">{rs.schedule.dateAndTime}</span>
                </div>
              ))}
            </div>
          ) : isGroup ? (
            <span className="text-[10px] text-slate-400">{ dict.seeMembers }</span>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>

        {/* Type */}
        <td className="py-2 px-2">
          <div className="flex items-center gap-1">
            {isGroup ? (
              <Users className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <User className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="text-slate-700">
              {isGroup ? "Group" : "Individual"}
            </span>
          </div>
          {enrolment.isThirdPartyPay && (
            <div className="text-[10px] text-amber-700">
              3rd-party: {enrolment.payerFullName}
            </div>
          )}
        </td>

        {/* Registrants */}
        <td className="py-2 px-2 text-center">
          {isGroup && enrolment.registrantCount != null ? (
            <>
              <span className="font-bold text-slate-900">{enrolment.registrantCount}</span>
              <div className="text-[10px] text-slate-400">{ dict.exclEnroller }</div>
            </>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>

        {/* Payment */}
        <td className="py-2 px-2">
          {enrolment.paymentMethod ? (
            <span className="font-mono text-slate-700">
              {PAYMENT_METHOD_LABELS[enrolment.paymentMethod] ?? enrolment.paymentMethod}
            </span>
          ) : (
            <span className="text-slate-400">—</span>
          )}
          {enrolment.receiptNumber && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-700">
              <span>{ dict.rcpt } {enrolment.receiptNumber}</span>
              <a
                href={`/api/admin/enrolments/${enrolment.id}/receipt`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                title={ dict.downloadReceipt }
              >
                <FileText className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </td>

        {/* Fee — total for group, individual for single */}
        <td className="py-2 px-2 whitespace-nowrap text-right">
          {totalFee != null ? (
            <div className={`font-mono font-bold ${isGroup ? "text-primary" : "text-slate-900"}`}>
              {formatFee(totalFee)}
            </div>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </td>

        {/* Status */}
        <td className="py-2 px-2">
          <Badge variant={STATUS_BADGE[enrolment.paymentStatus]?.variant ?? "outline"}>
            {dict[STATUS_DICT_KEY[enrolment.paymentStatus] as keyof AdminDict] as string ?? enrolment.paymentStatus}
          </Badge>
          {enrolment.paymentStatus === "REJECTED" && enrolment.payerFullName && (
            <div className="text-[10px] text-destructive mt-0.5 max-w-32 truncate" title={enrolment.payerFullName}>
              {enrolment.payerFullName}
            </div>
          )}
        </td>

        {/* Submitted */}
        <td className="py-2 px-2 whitespace-nowrap">
          <div className="flex items-center gap-1 text-[10px] text-slate-600">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            {formatDate(enrolment.submittedAt)}
          </div>
        </td>

        {/* Actions — on parent row only */}
        <td className="py-2 px-2 text-right whitespace-nowrap space-x-1">
          {enrolment.paymentProofUrl && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onPreviewClick(enrolment)}
              title={ dict.viewProof }
            >
              <Eye className="w-3.5 h-3.5" />
            </Button>
          )}

          {enrolment.paymentStatus === "PENDING_VERIFICATION" && (
            <Button
              variant="default"
              size="xs"
              loading={approvingId === enrolment.id}
              disabled={approvingId === enrolment.id}
              onClick={() => onApprove(enrolment.id, isGroup ? enrolment.groupId : null)}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
{ dict.approve }
            </Button>
          )}

          {enrolment.paymentStatus === "PENDING_VERIFICATION" && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => onRejectClick(enrolment)}
              className="border-rose-300 text-rose-700 hover:bg-rose-50"
            >
              <XCircle className="w-3.5 h-3.5" />
{ dict.reject }
            </Button>
          )}
        </td>
      </tr>

      {/* Children rows: group members */}
      {isGroup && enrolment.members && enrolment.members.map((member, idx) => (
        <EnrolmentMemberRow
          key={member.id}
          member={member}
          idx={idx}
          totalMembers={enrolment.members!.length}
        />
      ))}
    </Fragment>
  );
}