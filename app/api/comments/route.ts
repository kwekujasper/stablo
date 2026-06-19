import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";
import { getComments } from "@/lib/wordpress/api";

const submitSchema = z.object({
  postId: z.number().int().positive(),
  authorName: z.string().min(1).max(100).trim(),
  authorEmail: z.string().email().max(200),
  authorUrl: z.string().url().optional().or(z.literal("")),
  content: z.string().min(1).max(5000).trim(),
  parentId: z.number().int().nonnegative().optional(),
});

// GET /api/comments?postId=123
export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId");
  if (!postId) {
    return NextResponse.json({ error: "postId is required" }, { status: 400 });
  }

  const comments = await getComments(postId);
  return NextResponse.json({ comments });
}

// POST /api/comments
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { postId, authorName, authorEmail, authorUrl, content, parentId } =
    parsed.data;

  // Akismet spam check
  const isSpam = await checkAkismet({
    userIp:
      req.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1",
    userAgent: req.headers.get("user-agent") ?? "",
    commentAuthor: authorName,
    commentAuthorEmail: authorEmail,
    commentAuthorUrl: authorUrl ?? "",
    commentContent: content,
  });

  if (isSpam) {
    // Silently return success to not tip off spammers
    return NextResponse.json({ success: true, held: true });
  }

  const wpUrl = process.env.WP_SITE_URL;
  if (!wpUrl) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    const wpRes = await fetch(`${wpUrl}/wp-json/wp/v2/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post: postId,
        author_name: authorName,
        author_email: authorEmail,
        author_url: authorUrl,
        content,
        parent: parentId ?? 0,
      }),
    });

    if (!wpRes.ok) {
      console.error("[comments] WP REST error:", await wpRes.text());
      return NextResponse.json(
        { error: "Failed to submit comment" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, held: false });
  } catch (err) {
    console.error("[comments] Error:", err);
    return NextResponse.json(
      { error: "Comment service unavailable" },
      { status: 503 }
    );
  }
}

async function checkAkismet(params: {
  userIp: string;
  userAgent: string;
  commentAuthor: string;
  commentAuthorEmail: string;
  commentAuthorUrl: string;
  commentContent: string;
}): Promise<boolean> {
  const apiKey = process.env.AKISMET_API_KEY;
  const siteUrl = process.env.SITE_URL;
  if (!apiKey || !siteUrl) return false;

  try {
    const form = new URLSearchParams({
      blog: siteUrl,
      user_ip: params.userIp,
      user_agent: params.userAgent,
      comment_type: "comment",
      comment_author: params.commentAuthor,
      comment_author_email: params.commentAuthorEmail,
      comment_author_url: params.commentAuthorUrl,
      comment_content: params.commentContent,
    });

    const res = await fetch(
      `https://${apiKey}.rest.akismet.com/1.1/comment-check`,
      { method: "POST", body: form }
    );
    const text = await res.text();
    return text.trim() === "true";
  } catch {
    return false;
  }
}
