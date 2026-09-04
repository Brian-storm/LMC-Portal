import { auth } from "@/auth";
import { NextResponse } from "next/server";

const locales = ["en", "zh-hk", "zh-cn"];
const defaultLocale = "zh-hk";

const publicSegments = [
  "courses",
  "about",
  "privacy",
  "terms",
  "login",
  "register",
];

function getLocale(pathname: string): string | null {
  for (const locale of locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return null;
}

function isPublicPath(locale: string, pathname: string): boolean {
  if (pathname === `/${locale}` || pathname === `/${locale}/`) return true;
  return publicSegments.some(
    (seg) =>
      pathname === `/${locale}/${seg}` ||
      pathname.startsWith(`/${locale}/${seg}/`),
  );
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const locale = getLocale(pathname);

  if (!locale) {
    const redirectUrl = new URL(
      `/${defaultLocale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`,
      req.url,
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (isPublicPath(locale, pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith(`/${locale}/admin`)) {
    if (!req.auth) {
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (req.auth.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith(`/${locale}/dashboard`)) {
    if (!req.auth) {
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};