"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type TextSize = "md" | "lg" | "xl";

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

    // Remove old scaling classes
    root.classList.remove("text-size-md", "text-size-lg", "text-size-xl");

    // Apply new tier class to HTML root
    root.classList.add(`text-size-${textSize}`);
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
