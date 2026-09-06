import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  // --- Customer dashboard protection (NextAuth session) ---
  if (pathname.startsWith("/dashboard")) {
    if (!req.auth) {
      const signInUrl = new URL("/signin", req.nextUrl.origin);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return;
  }

  // --- Admin portal protection — its own cookie/JWT, unrelated to
  //     the customer auth system above. /admin/login itself stays public.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const payload = token ? await verifyAdminToken(token) : null;

    if (!payload) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
    }
    return;
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};