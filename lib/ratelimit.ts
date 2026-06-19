import { NextRequest, NextResponse } from "next/server";

// Lightweight in-process rate limiter — no external service required.
// For multi-instance/serverless deployments swap this for @upstash/ratelimit.
const store = new Map<string, { count: number; resetAt: number }>();

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export function rateLimit(
  req: NextRequest,
  { limit, windowMs }: RateLimitOptions
): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous";

  const key = `${req.nextUrl.pathname}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count += 1;

  if (entry.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}
