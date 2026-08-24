"use client";

import { usePathname, useRouter } from "next/navigation";

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const redirectedPathName = (targetLocale: string) => {
    if (!pathname) return `/${targetLocale}`;
    const segments = pathname.split("/");
    // Ensure we handle leading slashes correctly
    segments[1] = targetLocale;
    return segments.join("/");
  };

  const handleSwitch = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetLocale: string,
  ) => {
    e.preventDefault();
    const newPath = redirectedPathName(targetLocale);

    // Set cookie if your middleware relies on a locale cookie
    document.cookie = `NEXT_LOCALE=${targetLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Navigate and force Next.js to re-fetch Server Components
    router.push(newPath);
    router.refresh();
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
        const newPath = redirectedPathName(loc.code);

        return (
          <a
            key={loc.code}
            href={newPath}
            onClick={(e) => handleSwitch(e, loc.code)}
            className={`no-scale px-2 py-0.5 text-sm rounded transition-colors cursor-pointer ${
              isActive
                ? "bg-primary text-primary-foreground font-semibold border border-primary/20 shadow-xs"
                : "text-secondary hover:text-primary hover:bg-primary/5"
            }`}
          >
            {loc.label}
          </a>
        );
      })}
    </div>
  );
}
