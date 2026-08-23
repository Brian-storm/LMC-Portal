import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "zh-hk", "zh-cn"];
const defaultLocale = "en";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if pathname already has a valid locale prefix
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return NextResponse.next();

  // 2. Redirect root / or non-localized paths to /en
  const redirectUrl = new URL(
    `/${defaultLocale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`,
    request.url,
  );

  return NextResponse.redirect(redirectUrl);
}

// Export default to cover all Next.js resolution rules
export default middleware;

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, api routes, and icons
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
