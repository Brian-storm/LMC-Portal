"use client";

import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import { BreadcrumbsDict } from "@/dictionaries/types";


export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  currentLocale: string;
  items?: BreadcrumbItem[];
  dict?: BreadcrumbsDict;
}

export function Breadcrumbs({
  currentLocale,
  items = [],
  dict,
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label={dict?.ariaLabel || "Breadcrumb"}
      className="bg-white border-b border-slate-200 py-2.5 px-4"
    >
      <div className="container mx-auto max-w-7xl">
        <ol className="flex items-center space-x-2 text-xs text-slate-500">
          {/* Home Link */}
          <li>
            <Link
              href={`/${currentLocale}`}
              className="flex items-center hover:text-blue-900 transition-colors"
            >
              <Home className="w-3.5 h-3.5 mr-1" />
              <span>{dict?.home || "Home"}</span>
            </Link>
          </li>

          {/* Fallback item for Homepage if items array is empty */}
          {items.length === 0 && (
            <>
              <li>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </li>
              <li className="font-medium text-slate-800" aria-current="page">
                {dict?.overview || "Overview"}
              </li>
            </>
          )}

          {/* Dynamic Trail Items */}
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center space-x-2">
                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                {isLast || !item.href ? (
                  <span
                    className="font-medium text-slate-800"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={`/${currentLocale}${item.href}`}
                    className="hover:text-blue-900 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
