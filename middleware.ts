import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check if user is accessing protected routes
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/api/transcripts") ||
    request.nextUrl.pathname.startsWith("/api/summaries")

  if (isProtectedRoute) {
    // Check for session token in cookies
    const sessionToken =
      request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token")

    if (!sessionToken) {
      // Redirect to login if no session token
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/transcripts/:path*", "/api/summaries/:path*"],
}
