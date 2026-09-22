"use client";

import { type LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  trend?: number;
  trendUp?: boolean;
  color?: string;
}

export default function AdminStatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  color = "text-slate-900",
}: AdminStatCardProps) {
  return (
    <div className="bg-white border border-slate-200 p-4 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-bold text-slate-400 block">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
      </div>
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-serif font-bold ${color}`}>{value}</span>
        {trend !== undefined && (
          <span className={`text-[10px] font-bold ${trendUp ? "text-emerald-600" : "text-rose-600"}`}>
            {trendUp ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}