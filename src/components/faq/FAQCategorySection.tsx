"use client";

import { ChevronDown } from "lucide-react";


export interface FAQItemView {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategoryView {
  category: {
    id: string;
    name: string;
  };
  items: FAQItemView[];
}

interface FAQCategorySectionProps {
  category: FAQCategoryView;
  expandedId: string | null;
  onToggle: (id: string) => void;
}

export function FAQCategorySection({
  category,
  expandedId,
  onToggle,
}: FAQCategorySectionProps) {
  // If searchQuery is active but none of the items match, we don't render at all
  // (filtering is handled by the parent)

  return (
    <div className="mb-6">
      {/* Category heading */}
      <h2 className="text-lg font-semibold text-emerald-900 mb-3 px-1">
        {category.category.name}
      </h2>

      {/* FAQ items */}
      <div className="space-y-1">
        {category.items.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              id={`faq-${item.id}`}
              className="border border-slate-200 rounded-xs overflow-hidden"
            >
              {/* Question button */}
              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-slate-800 bg-white hover:bg-slate-50 transition-colors"
                aria-expanded={isExpanded}
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 shrink-0 ml-2 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Answer panel */}
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 pb-4 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}