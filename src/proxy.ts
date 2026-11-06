import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) =>
    cookie.name === "better-auth.session_token" ||
    cookie.name === "__Secure-better-auth.session_token",
  );
}

export function proxy(request: NextRequest) {
  const loggingIn = request.nextUrl.pathname.startsWith("/panel/logowanie");
  const response =
    loggingIn || hasSessionCookie(request)
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/panel/logowanie", request.url));

  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/panel/:path*"],
};
