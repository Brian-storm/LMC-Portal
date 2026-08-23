import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "zh-hk", "zh-cn"];
const defaultLocale = "en";

// Renamed from 'middleware' to 'proxy'
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return;

  return NextResponse.redirect(
    new URL(`/${defaultLocale}${pathname}`, request.url),
  );
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
