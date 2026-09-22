"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  cta?: ReactNode;
}

export default function AdminPageHeader({
  title,
  subtitle,
  backHref,
  backLabel,
  cta,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center space-x-1 text-slate-500 hover:text-primary transition-colors text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{backLabel ?? "Back"}</span>
          </Link>
        )}
        <div>
          <h1 className="text-xl font-serif font-bold text-primary">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {cta && <div>{cta}</div>}
    </div>
  );
}