"use client";

import { type LucideIcon, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminDataTableProps {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  emptyExtra?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function AdminDataTable({
  loading,
  error,
  onRetry,
  emptyMessage,
  emptyIcon: EmptyIcon,
  emptyExtra,
  children,
  footer,
}: AdminDataTableProps) {
  // Loading skeleton — renders 5 placeholder rows with animated pulse
  if (loading) {
    return (
      <section className="bg-white border border-slate-200">
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-4 w-28 bg-slate-200 rounded-xs" />
              <div className="h-4 w-36 bg-slate-200 rounded-xs" />
              <div className="h-4 w-24 bg-slate-200 rounded-xs" />
              <div className="h-4 w-16 bg-slate-200 rounded-xs" />
              <div className="h-4 w-20 bg-slate-200 rounded-xs" />
            </div>
          ))}
          <div className="text-center pt-2 text-slate-400">
            <Loader2 className="w-3.5 h-3.5 inline animate-spin mr-1.5" />
            Loading...
          </div>
        </div>
      </section>
    );
  }

  // Error state — icon, message, and optional retry button
  if (error) {
    return (
      <section className="bg-white border border-slate-200">
        <div className="p-12 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-bold text-destructive">Error</p>
          <p className="text-xs text-slate-500">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </section>
    );
  }

  // Empty state — icon + message + optional extra content
  if (!children) {
    const Icon = EmptyIcon ?? AlertCircle;
    return (
      <section className="bg-white border border-slate-200">
        <div className="p-12 text-center space-y-3">
          <Icon className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700">{emptyMessage ?? "No data"}</p>
          {emptyExtra}
        </div>
      </section>
    );
  }

  // Normal state — table wrapper with optional footer
  return (
    <section className="bg-white border border-slate-200">
      <div className="overflow-x-auto">{children}</div>
      {footer}
    </section>
  );
}