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
      className="bg-background border-b border-border py-2.5 px-4"
    >
      <div className="container mx-auto max-w-7xl">
        <ol className="flex items-center space-x-2 text-xs text-muted-foreground">
          {/* Home Link */}
          <li>
            <Link
              href={`/${currentLocale}`}
              className="flex items-center font-medium text-foreground hover:text-primary transition-colors"
            >
              <Home className="w-3.5 h-3.5 mr-1" />
              <span>{dict?.home || "Home"}</span>
            </Link>
          </li>

          {/* Dynamic Trail Items */}
          {items.length > 0 && items.map((item, index) => {
            return (
              <li key={index} className="flex items-center space-x-2">
                <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                {!item.href ? (
                  <span
                    className="font-medium text-foreground"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={`/${currentLocale}${item.href}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <span>{item?.label}</span>
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
