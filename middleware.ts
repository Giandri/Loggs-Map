import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";

  // Handle domain redirect
  if (host === "dashboard-maps.loggsvisual.com") {
    const url = req.nextUrl.clone();
    url.hostname = "loggsvisual.com";
    url.protocol = "https";

    const incomingPath = req.nextUrl.pathname === "/" ? "" : req.nextUrl.pathname;
    url.pathname = `/dashboard${incomingPath}`;

    return NextResponse.redirect(url, 307);
  }

  // Protect dashboard routes with session authentication
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const sessionCookie = req.cookies.get("dashboard-session");

    // If no session cookie, allow access to dashboard (will show login form)
    // The dashboard component will handle authentication check and show login form
    if (!sessionCookie && req.nextUrl.pathname === "/dashboard") {
      return NextResponse.next();
    }

    // If no session cookie and accessing sub-routes, redirect to dashboard root
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // If accessing dashboard root, continue
    if (req.nextUrl.pathname === "/dashboard") {
      return NextResponse.next();
    }

    // Additional session validation could be added here
    // For now, presence of session cookie is sufficient
  }

  return NextResponse.next();
}
