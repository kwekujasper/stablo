import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";

const bodySchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  // Strict rate limit for login: 5 attempts per 15 minutes per IP
  const limited = rateLimit(req, { limit: 5, windowMs: 15 * 60_000 });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }

  const { username, password } = parsed.data;
  const wpUrl = process.env.WP_SITE_URL;

  if (!wpUrl) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    const wpRes = await fetch(`${wpUrl}/wp-json/jwt-auth/v1/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const wpData = await wpRes.json();

    if (!wpRes.ok || !wpData.token) {
      // Return a generic error — never forward WP's message to the client
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      user: {
        name: wpData.user_display_name,
        email: wpData.user_email,
        nicename: wpData.user_nicename,
      },
    });

    // Store token in httpOnly cookie — never accessible via JS
    response.cookies.set("wp_token", wpData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("[auth/login] Error:", err);
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      { status: 503 }
    );
  }
}
