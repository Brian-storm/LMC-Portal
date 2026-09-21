"use client";

import { type ReactNode } from "react";
import { User } from "lucide-react";
import type { EnrolmentMember } from "./types";
import { ID_DOC_TYPE_LABELS } from "./constants";

interface EnrolmentMemberRowProps {
  member: EnrolmentMember;
  idx: number;
  totalMembers: number;
}

// Renders both Chinese and English names stacked, but only when they differ.
// Enrollment form only collects English name, so nameZh/nameEn are often identical for guest enrollees.
const BilingualName = ({ user }: { user: { nameZh: string; nameEn: string } }): ReactNode => {
  const same = user.nameZh === user.nameEn || !user.nameZh;
  return same ? (
    <div className="text-slate-800">{user.nameEn}</div>
  ) : (
    <div>
      <div className="text-slate-800">{user.nameZh}</div>
      <div className="text-[10px] text-slate-500 leading-tight">{user.nameEn}</div>
    </div>
  );
};

const formatFee = (fee: number | null): string => {
  if (fee == null) return "—";
  return `HK$${fee.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function EnrolmentMemberRow({ member, idx, totalMembers }: EnrolmentMemberRowProps) {
  const isLast = idx === totalMembers - 1;

  return (
    <tr className="bg-slate-50/40">
      <td className="py-1.5 px-2 pl-8" colSpan={2}>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-300 select-none">
            {isLast ? "└─" : "├─"}
          </span>
          <User className="w-3 h-3 text-slate-300 shrink-0" />
          <BilingualName user={member.user} />
        </div>
        <div className="ml-4 text-[10px] text-slate-500 space-y-0.5 mt-0.5">
          {member.user.idDocNumber && (
            <span className="font-mono mr-3">
              {member.user.idDocType ? `${ID_DOC_TYPE_LABELS[member.user.idDocType] ?? member.user.idDocType} ` : ""}
              {member.user.idDocNumber}
            </span>
          )}
          {member.user.iaLicense && (
            <span className="font-mono mr-3">IA: {member.user.iaLicense}</span>
          )}
          <span className="mr-3">{member.user.email}</span>
          <span>{member.user.phone}</span>
        </div>
      </td>
      {/* Course — empty for member rows (inherit from parent) */}
      <td className="py-1.5 px-2" />
      {/* Schedules — each member has their own schedule selections */}
      <td className="py-1.5 px-2">
        {member.schedules && member.schedules.length > 0 ? (
          <div className="leading-tight space-y-0.5">
            {member.schedules.map((rs) => (
              <div key={rs.schedule.id} className="text-[10px] text-slate-500">
                {rs.schedule.dateAndTime}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      {/* Type — empty */}
      <td className="py-1.5 px-2" />
      {/* Registrants — empty */}
      <td className="py-1.5 px-2" />
      {/* Payment — empty */}
      <td className="py-1.5 px-2" />
      {/* Fee — individual member fee, right-aligned to match parent fee column */}
      <td className="py-1.5 px-2 whitespace-nowrap text-right">
        <span className="font-mono text-[10px] text-slate-500">
          {formatFee(member.fee)}
        </span>
      </td>
      {/* Status — empty (inherits from parent) */}
      <td className="py-1.5 px-2" />
      {/* Submitted — empty */}
      <td className="py-1.5 px-2" />
      {/* Actions — empty (actions on parent only) */}
      <td className="py-1.5 px-2" />
    </tr>
  );
}