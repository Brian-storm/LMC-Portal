"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type TextSize = "md" | "lg" | "xl";

const SCALE_MAP: Record<TextSize, number> = {
  md: 1,
  lg: 1.125,
  xl: 1.25,
};

interface AccessibilityContextType {
  textSize: TextSize;
  setTextSize: (size: TextSize) => void;
  highContrast: boolean;
  setHighContrast: (contrast: boolean) => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [textSize, setTextSize] = useState<TextSize>("lg"); // Default set to 'lg'
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    // Scale the root font-size so all rem values (including Tailwind text-*)
    // scale proportionally. This preserves relative sizing (text-xs stays
    // smaller than text-sm) while still respecting the accessibility tier.
    root.style.fontSize = `calc(100% * ${SCALE_MAP[textSize]})`;
  }, [textSize]);

  return (
    <AccessibilityContext.Provider
      value={{ textSize, setTextSize, highContrast, setHighContrast }}
    >
      <div
        className={`accessibility-wrapper text-size-${textSize} ${highContrast ? "high-contrast" : ""}`}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider",
    );
  }
  return context;
}
