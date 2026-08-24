"use client";

import { useState, useRef, useEffect } from "react";
import { useAccessibility, TextSize } from "@/app/context/AccessibilityContext";
import { Eye, ChevronDown } from "lucide-react";
import { AccessibilityDict } from "@/dictionaries/types";


interface AccessibilityMenuProps {
  accessDict: AccessibilityDict;
}

export function AccessibilityMenu({ accessDict }: AccessibilityMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { textSize, setTextSize, highContrast, setHighContrast } =
    useAccessibility();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors border border-slate-300/80 shadow-xs"
        aria-label="Accessibility options"
      >
        <Eye className="w-3.5 h-3.5 text-blue-900" />
        <span className="hidden sm:inline font-semibold text-[11px] text-slate-800">
          A
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-sm shadow-xl p-3 z-50 text-xs text-slate-800 space-y-3">
          {/* Text Size Control */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              {accessDict.textSize}
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-sm border border-slate-200">
              {(
                [
                  { size: "md", labelStyle: "text-xs" },
                  { size: "lg", labelStyle: "text-sm" },
                  { size: "xl", labelStyle: "text-base" },
                ] as const
              ).map(({ size, labelStyle }) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size as TextSize)}
                  className={`py-1 rounded-sm font-bold uppercase transition-colors flex items-center justify-center ${labelStyle} ${
                    textSize === size
                      ? "bg-blue-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                  aria-label={`Set text size to ${size}`}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200" />

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm transition-colors border ${
              highContrast
                ? "bg-blue-900 text-white font-bold border-blue-900"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
            }`}
          >
            <span className="text-[11px] font-medium">
              {accessDict.highContrast}
            </span>
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
