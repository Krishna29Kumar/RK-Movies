import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/models/Admin";
import { signAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Please enter your email and password." },
                { status: 400 }
            );
        }

        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (!valid) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
        }

        const token = await signAdminToken({
            adminId: admin._id.toString(),
            email: admin.email,
            name: admin.name,
        });

        const response = NextResponse.json({ success: true, name: admin.name });
        response.cookies.set(ADMIN_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 8, // 8 hours, matches the token's own expiry
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Could not sign in. Please try again." }, { status: 500 });
    }
}