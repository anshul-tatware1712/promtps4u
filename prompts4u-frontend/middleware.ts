import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is authenticated (has auth_token cookie or localStorage)
  // Since we're using localStorage for auth, we can only check cookies here
  // The auth token is stored in localStorage, so we need to rely on the app to handle redirect
  // But we can still protect routes by checking for a session cookie if set

  // For now, we'll just add a basic check for logged-in users
  // The actual auth state is managed client-side via localStorage

  // Paths that require authentication
  const protectedPaths = ["/dashboard"];

  // Paths that should redirect to dashboard if already logged in
  const authPaths = ["/login", "/auth/callback"];

  // Check if trying to access protected route
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      // No token, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if trying to access auth pages while already authenticated
  if (authPaths.some((path) => pathname.startsWith(path))) {
    const token = request.cookies.get("auth_token")?.value;
    if (token) {
      // Already has token, redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|assets).*)"],
};
