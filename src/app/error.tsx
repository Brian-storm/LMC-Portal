"use client"; // 👈 THIS MUST BE THE VERY FIRST LINE

import { useEffect } from "react";
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
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
      <h2 className="text-2xl font-bold text-slate-900">
        Something went wrong!
      </h2>
      <p className="text-sm text-slate-600">
        We encountered an error loading this page.
      </p>
      <Button
        onClick={() => reset()}
        className="bg-blue-900 hover:bg-blue-800 text-white"
      >
        Try again
      </Button>
    </div>
  );
}
