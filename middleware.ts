import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";

  // Redirect all requests coming to dashboard subdomain to the main domain's /dashboard path
  if (host === "dashboard-loggsmap.vercel.app") {
    const url = req.nextUrl.clone();
    url.hostname = "loggsmap.vercel.app";
    url.protocol = "https";

    // Preserve additional path segments after root; default to /dashboard
    const incomingPath = req.nextUrl.pathname === "/" ? "" : req.nextUrl.pathname;
    url.pathname = `/dashboard${incomingPath}`;

    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

