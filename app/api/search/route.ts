import { NextRequest, NextResponse } from "next/server";
import { searchPosts } from "@/lib/wordpress/api";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ posts: [] });
  }

  // Sanitise: strip anything that isn't word chars, spaces, or common punctuation
  const sanitised = q.replace(/[^\w\s\-.,!?'"]/g, "").slice(0, 100);

  const posts = await searchPosts(sanitised, 10);

  return NextResponse.json(
    { posts },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
