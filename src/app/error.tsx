"use client"; // Root error boundary — no i18n available (outside [locale])

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground transition-colors duration-300">
      <div className="relative flex flex-col items-center max-w-md w-full text-center space-y-6">
        {/* Decorative icon */}
        <div className="relative">
          <div className="absolute -inset-4 bg-destructive/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center border border-destructive/20">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            An unexpected error occurred. Please try again or contact support.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Button
            onClick={() => reset()}
            variant="default"
            className="flex-1"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => { window.location.replace("/"); }}
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}