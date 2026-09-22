"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, RefreshCw, AlertCircle, FileQuestion } from "lucide-react";
import { FaqPageDict } from "@/dictionaries/types";
import {
  FAQCategorySection,
  type FAQCategoryView,
} from "./FAQCategorySection";


interface FAQAccordionProps {
  categories?: FAQCategoryView[];
  error?: string | null;
  dict: FaqPageDict;
}

export function FAQAccordion({
  categories,
  error,
  dict,
}: FAQAccordionProps) {
  const router = useRouter();

  // 1: Accordion state — which item is currently expanded.
  // Initialize from URL hash for #faq-{id} support.
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const match = window.location.hash.match(/^#faq-(.+)$/);
    return match ? match[1] : null;
  });

  // 2: Search query state
  const [searchQuery, setSearchQuery] = useState("");

  // 3: Toggle handler — close current if same, else open new
  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // 5: Filter categories + items by search query
  const filteredCategories = useMemo(() => {
    if (!categories) return null;
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) =>
          item.question.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
    }, [categories, searchQuery]);

  // 6: Loading skeleton
  if (!categories && !error) {
    return (
      <div className="animate-pulse space-y-6" role="status" aria-label={dict.loadingMessage}>
        {/* Search skeleton */}
        <div className="h-10 bg-slate-200 rounded-xs w-full max-w-md" />
        {/* Category skeleton */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            {[1, 2].map((j) => (
              <div key={j} className="border border-slate-200 rounded-xs p-4">
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // 7: Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <p className="text-base text-slate-700 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-700 rounded-xs hover:bg-emerald-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {dict.pageTitle === "Frequently Asked Questions"
              ? "Retry"
              : "重新載入"}
          </button>
      </div>
    );
  }

  // 8: Empty state
  if (!categories || categories.length === 0 || filteredCategories?.length === 0) {
    const isSearchWithNoResults = searchQuery.trim().length > 0;

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileQuestion className="w-12 h-12 text-slate-400 mb-4" />
        <p className="text-base text-slate-600">
          {isSearchWithNoResults ? dict.noResults : dict.emptyState}
        </p>
      </div>
    );
  }

  // 9: Normal render
  return (
    <div>
      {/* Search input */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={dict.searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* FAQ categories with accordion items */}
      {filteredCategories!.map((cat) => (
        <FAQCategorySection
          key={cat.category.id}
          category={cat}
          expandedId={expandedId}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}