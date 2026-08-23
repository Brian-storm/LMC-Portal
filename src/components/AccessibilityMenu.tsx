"use client";

import { useState, useRef, useEffect } from "react";
import { useAccessibility, TextSize } from "@/app/context/AccessibilityContext";
import { Eye, Type, ChevronDown } from "lucide-react";

interface AccessibilityMenuProps {
  accessDict: {
    textSize: string;
    highContrast: string;
  };
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
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors border border-slate-700/60"
        aria-label="Accessibility options"
      >
        <Eye className="w-3.5 h-3.5 text-amber-400" />
        <span className="hidden sm:inline font-medium text-[11px]">A</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700/80 rounded-md shadow-xl p-3 z-50 text-xs text-slate-200 space-y-3">
          {/* Text Size Control */}
          {/* Text Size Control */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              {accessDict.textSize}
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded border border-slate-800">
              {(
                [
                  { size: "md", labelStyle: "text-xs" },
                  { size: "lg", labelStyle: "text-sm" },
                  { size: "xl", labelStyle: "text-base" },
                ] as const
              ).map(({ size, labelStyle }) => (
                <button
                  key={size}
                  onClick={() => setTextSize(size)}
                  className={`py-1 rounded font-bold uppercase transition-colors flex items-center justify-center ${labelStyle} ${
                    textSize === size
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                  aria-label={`Set text size to ${size}`}
                >
                  A
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800" />

          {/* High Contrast Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${
              highContrast
                ? "bg-amber-400 text-slate-950 font-bold"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700"
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
