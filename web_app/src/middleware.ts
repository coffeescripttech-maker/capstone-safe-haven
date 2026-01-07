import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
      return NextResponse.rewrite(new URL("/unauthorized", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token;
        }
        
        // Protect dashboard and other authenticated routes
        if (
          req.nextUrl.pathname === "/" ||
          req.nextUrl.pathname.startsWith("/calendar") ||
          req.nextUrl.pathname.startsWith("/profile") ||
          req.nextUrl.pathname.startsWith("/projects") ||
          req.nextUrl.pathname.startsWith("/form-elements") ||
          req.nextUrl.pathname.startsWith("/basic-tables") ||
          req.nextUrl.pathname.startsWith("/line-chart") ||
          req.nextUrl.pathname.startsWith("/bar-chart") ||
          req.nextUrl.pathname.startsWith("/alerts") ||
          req.nextUrl.pathname.startsWith("/avatars") ||
          req.nextUrl.pathname.startsWith("/badge") ||
          req.nextUrl.pathname.startsWith("/buttons") ||
          req.nextUrl.pathname.startsWith("/images") ||
          req.nextUrl.pathname.startsWith("/videos") ||
          req.nextUrl.pathname.startsWith("/modals") ||
          req.nextUrl.pathname.startsWith("/blank")
        ) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|signin|signup|error-404).*)",
  ],
};