"use client";

import type { PaymentStatus, Pagination } from "./types";
import { STATUS_TABS } from "./constants";
import type { AdminDict } from "@/dictionaries/types";

interface EnrolmentFiltersProps {
  statusFilter: PaymentStatus | "ALL";
  pagination: Pagination | null;
  onTabClick: (value: PaymentStatus | "ALL") => void;
  dict: AdminDict;
}

const FILTER_DICT_KEY: Record<string, keyof AdminDict> = {
  ALL: "filterAll",
  PENDING_VERIFICATION: "filterPending",
  VERIFIED: "filterVerified",
  REJECTED: "filterRejected",
};

export default function EnrolmentFilters({ statusFilter, pagination, onTabClick, dict }: EnrolmentFiltersProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STATUS_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabClick(tab.value)}
          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors ${
            statusFilter === tab.value
              ? "bg-primary text-primary-foreground"
              : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {dict[FILTER_DICT_KEY[tab.value] as keyof AdminDict] as string}
          {tab.value !== "ALL" && pagination && statusFilter === tab.value && (
            <span className="ml-1.5 text-[10px] opacity-70">({pagination.total})</span>
          )}
        </button>
      ))}
    </div>
  );
}