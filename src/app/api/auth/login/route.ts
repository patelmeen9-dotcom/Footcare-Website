import { NextResponse } from "next/server";
import { signJWT } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Default admin credentials for catalog version 1
    const defaultEmail = "admin@footcare.com";
    const defaultPassword = "Password123";

    if (email === defaultEmail && password === defaultPassword) {
      const token = await signJWT({
        id: "admin-id-1",
        email: defaultEmail,
        role: "SUPER_ADMIN",
      });

      const response = NextResponse.json({
        success: true,
        user: {
          email: defaultEmail,
          name: "Super Admin",
          role: "SUPER_ADMIN",
        },
      });

      // Set session cookie
      response.cookies.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
