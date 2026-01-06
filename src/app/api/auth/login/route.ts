import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Simple authentication using single password from environment
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Validate input
    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    // Check password (simple string comparison)
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Create session
    const sessionId = crypto.randomUUID();

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("dashboard-session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
