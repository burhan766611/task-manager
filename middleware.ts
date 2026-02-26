import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }
  }

  // Prevent logged in users from visiting login/register
  if (
    token &&
    (pathname.startsWith("/login") ||
      pathname.startsWith("/register"))
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};