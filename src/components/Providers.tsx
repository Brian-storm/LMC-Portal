"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { AccessibilityProvider } from "@/app/context/AccessibilityContext";
import { ToastProvider } from "@/components/ui/toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AccessibilityProvider>
        <ToastProvider>{children}</ToastProvider>
      </AccessibilityProvider>
    </SessionProvider>
  );
}
