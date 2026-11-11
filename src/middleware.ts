import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ==============================================================================
// FIXIA GymOS — Route Canonicalization & Protection Middleware
// ==============================================================================

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/platform-admin/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/terms",
  "/security",
  "/offline",
  "/api/auth",
  "/api/cron",
  "/manifest.json",
  "/sw.js",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Canonicalize Legacy Platform Admin Routes: /admin/* -> /platform-admin/*
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const target = pathname === "/admin" ? "/platform-admin" : pathname.replace(/^\/admin/, "/platform-admin");
    return NextResponse.redirect(new URL(target, request.url));
  }

  // 2. Canonicalize Legacy Public Gym Microsite Routes: /gym/[slug] -> /g/[slug]
  if (pathname.startsWith("/gym/")) {
    const target = pathname.replace(/^\/gym\//, "/g/");
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Allow static files, Next internals, icons, and public endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/g/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.json" ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  ) {
    return NextResponse.next();
  }

  // Session token lookup
  const sessionToken =
    request.cookies.get("__Secure-fixia_session_token")?.value ||
    request.cookies.get("fixia_session_token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  // 3. Protected Platform Admin Routes
  if (pathname.startsWith("/platform-admin") && !pathname.startsWith("/platform-admin/login")) {
    if (!sessionToken) {
      const adminLoginUrl = new URL("/platform-admin/login", request.url);
      adminLoginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  // 4. Protected Owner & Member Routes
  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/gym/:path*",
    "/platform-admin/:path*",
    "/owner/:path*",
    "/member/:path*",
    "/portal/:path*",
  ],
};
