import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("wp_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const wpUrl = process.env.WP_SITE_URL;
  if (!wpUrl) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    const wpRes = await fetch(`${wpUrl}/wp-json/jwt-auth/v1/token/validate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!wpRes.ok) {
      const response = NextResponse.json({ user: null }, { status: 401 });
      // Clear stale cookie
      response.cookies.set("wp_token", "", { maxAge: 0, path: "/" });
      return response;
    }

    const data = await wpRes.json();
    return NextResponse.json({ valid: true, data });
  } catch {
    return NextResponse.json({ user: null }, { status: 503 });
  }
}
