import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ==============================================================================
// FIXIA GymOS — Edge Request & Route Protection Middleware
// ==============================================================================

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/platform-admin/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/offline",
  "/api/auth",
  "/manifest.json",
  "/sw.js",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, Next internals, icons, and public endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/g/") ||
    pathname.startsWith("/gym/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/sw.js" ||
    pathname === "/manifest.json" ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionToken =
    request.cookies.get("__Secure-fixia_session_token")?.value ||
    request.cookies.get("fixia_session_token")?.value ||
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("__Secure-authjs.session-token")?.value;

  // Protected paths require an active session token
  if (!sessionToken) {
    // If accessing platform-admin, redirect to platform-admin login
    if (pathname.startsWith("/platform-admin")) {
      const adminLoginUrl = new URL("/platform-admin/login", request.url);
      adminLoginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(adminLoginUrl);
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

