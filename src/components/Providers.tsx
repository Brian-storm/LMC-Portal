"use client";

import React from "react";
import { AccessibilityProvider } from "@/app/context/AccessibilityContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AccessibilityProvider>{children}</AccessibilityProvider>;
}
