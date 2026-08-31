"use client";

import React from "react";
import { AccessibilityProvider } from "@/app/context/AccessibilityContext";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AccessibilityProvider>
      <ToastProvider>{children}</ToastProvider>
    </AccessibilityProvider>
  );
}
