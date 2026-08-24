"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();

  const redirectedPathName = (targetLocale: string) => {
    if (!pathname) return `/${targetLocale}`;
    const segments = pathname.split("/");
    segments[1] = targetLocale;
    return segments.join("/");
  };

  const locales = [
    { code: "en", label: "EN" },
    { code: "zh-hk", label: "繁" },
    { code: "zh-cn", label: "簡" },
  ];

  return (
    <div className="flex items-center space-x-1">
      {locales.map((loc) => {
        const isActive = currentLocale === loc.code;
        return (
          <Link
            key={loc.code}
            href={redirectedPathName(loc.code)}
            className={`no-scale px-2 py-0.5 text-sm rounded transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground font-semibold border border-primary/20 shadow-xs"
                : "text-secondary hover:text-primary hover:bg-primary/5"
            }`}
          >
            {loc.label}
          </Link>
        );
      })}
    </div>
  );
}