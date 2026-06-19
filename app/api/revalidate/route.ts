import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";

const bodySchema = z.object({
  type: z.enum(["post", "category", "author", "page", "settings"]),
  slug: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  // Rate limit: 60 requests per minute per IP
  const limited = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  // Validate secret
  const authHeader = req.headers.get("authorization") ?? "";
  const secret = authHeader.replace(/^Bearer\s+/i, "");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, slug } = parsed.data;

  try {
    switch (type) {
      case "post":
        revalidatePath(`/post/${slug}`);
        revalidateTag(`post-${slug}`);
        revalidateTag("posts");
        break;
      case "category":
        revalidatePath(`/category/${slug}`);
        revalidateTag(`category-${slug}`);
        revalidateTag("categories");
        break;
      case "author":
        revalidatePath(`/author/${slug}`);
        revalidateTag(`author-${slug}`);
        revalidateTag("authors");
        break;
      case "page":
        revalidatePath(`/${slug}`);
        break;
      case "settings":
        revalidatePath("/", "layout");
        revalidateTag("settings");
        break;
    }

    // Always refresh homepage and archive listing
    revalidatePath("/");
    revalidatePath("/archive");

    return NextResponse.json({ revalidated: true, type, slug });
  } catch (err) {
    console.error("[revalidate] Error:", err);
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 }
    );
  }
}
