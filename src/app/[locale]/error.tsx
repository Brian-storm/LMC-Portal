"use client"; // Error boundary must be a client component

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Inline minimal dict to avoid importing server-only modules in a client component.
// Supports en, zh-hk, zh-cn.
const ERROR_DICT: Record<string, { title: string; message: string; retry: string; goHome: string; contactSupport: string }> = {
  en: {
    title: "Something went wrong",
    message: "We encountered an unexpected error while loading this page. Please try again.",
    retry: "Try Again",
    goHome: "Go to Homepage",
    contactSupport: "Contact Support",
  },
  "zh-hk": {
    title: "系統發生錯誤",
    message: "載入此頁面時發生意外錯誤，請重新嘗試。",
    retry: "重新嘗試",
    goHome: "返回首頁",
    contactSupport: "聯絡技術支援",
  },
  "zh-cn": {
    title: "系统发生错误",
    message: "加载此页面时发生意外错误，请重新尝试。",
    retry: "重新尝试",
    goHome: "返回首页",
    contactSupport: "联系技术支持",
  },
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Determine locale from URL when possible; fall back to "en"
  let locale = "en";
  try {
    const params = useParams();
    if (params && typeof params.locale === "string") {
      locale = params.locale;
    }
  } catch {
    // useParams may throw if called outside a router context; fall back to "en"
  }
  // Guard against unsupported locales
  const dict = ERROR_DICT[locale] ?? ERROR_DICT.en;

  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-background text-foreground transition-colors duration-300">
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
            {dict.title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            {dict.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Button
            onClick={() => reset()}
            variant="default"
            className="flex-1"
          >
            {dict.retry}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            asChild
          >
            <Link href={`/${locale}`}>{dict.goHome}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}