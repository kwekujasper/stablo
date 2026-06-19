import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";

const bodySchema = z.object({
  email: z.string().email().max(200).toLowerCase(),
  firstName: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const { email, firstName } = parsed.data;

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
  const server = process.env.MAILCHIMP_SERVER_PREFIX;

  if (!apiKey || !audienceId || !server) {
    console.error("[newsletter] Mailchimp env vars not set");
    return NextResponse.json(
      { error: "Newsletter service unavailable" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}/members`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
        },
        body: JSON.stringify({
          email_address: email,
          status: "pending", // double opt-in (GDPR compliant)
          merge_fields: firstName ? { FNAME: firstName } : {},
        }),
      }
    );

    if (res.status === 400) {
      const data = await res.json();
      // Already subscribed — treat as success
      if (data.title === "Member Exists") {
        return NextResponse.json({ success: true, alreadySubscribed: true });
      }
      // Generic error without leaking Mailchimp details
      return NextResponse.json({ error: "Could not subscribe" }, { status: 400 });
    }

    if (!res.ok) {
      return NextResponse.json({ error: "Could not subscribe" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[newsletter] Error:", err);
    return NextResponse.json(
      { error: "Newsletter service unavailable" },
      { status: 503 }
    );
  }
}
