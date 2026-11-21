import { NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin portal protection — its own cookie/JWT, unrelated to any user session.
  // /admin/login itself stays public.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const payload = token ? await verifyAdminToken(token) : null;

    if (!payload) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl.origin));
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ["/admin/:path*"],
};
