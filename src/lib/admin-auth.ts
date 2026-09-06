import { SignJWT, jwtVerify } from "jose";

// Completely separate from the customer auth system (NextAuth) — its own
// secret, its own cookie, its own token format. Keeping the two apart
// means logging in as a customer never touches admin access, and vice versa.
export const ADMIN_COOKIE_NAME = "admin_session";
const SESSION_DURATION = "8h";

function getSecretKey() {
    const secret = process.env.ADMIN_JWT_SECRET;
    if (!secret) {
        throw new Error("ADMIN_JWT_SECRET is not set. Add it to .env.local.");
    }
    return new TextEncoder().encode(secret);
}

export type AdminTokenPayload = {
    adminId: string;
    email: string;
    name: string;
};

export async function signAdminToken(payload: AdminTokenPayload) {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(SESSION_DURATION)
        .sign(getSecretKey());
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecretKey());
        return payload as unknown as AdminTokenPayload;
    } catch {
        return null;
    }
}

// Convenience for API routes: pull the admin session straight off the
// incoming request's cookies and verify it in one call.
export async function getAdminFromRequest(request: {
    cookies: { get: (name: string) => { value: string } | undefined };
}): Promise<AdminTokenPayload | null> {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
}