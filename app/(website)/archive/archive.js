import PostList from "@/components/postlist";
import Pagination from "@/components/blog/pagination";
import { getPaginatedPosts } from "@/lib/wordpress/api";

const POSTS_PER_PAGE = 6;

export default async function Archive({ searchParams }) {
  const page = parseInt(searchParams.page, 10) || 1;

  // Cursor-based pagination: fetch enough cursors to get to the requested page.
  // For page 1 we don't need a cursor; for subsequent pages we walk forward.
  // This is the simplest approach for SSR — for a large blog consider caching cursors.
  let after = undefined;

  if (page > 1) {
    // Fetch cursors for all previous pages to get the correct `after` cursor
    const prev = await getPaginatedPosts(POSTS_PER_PAGE * (page - 1));
    after = prev.endCursor ?? undefined;
  }

  const { posts, hasNextPage } = await getPaginatedPosts(POSTS_PER_PAGE, after);

  const isFirstPage = page < 2;
  const isLastPage = !hasNextPage;

  return (
    <>
      {posts.length === 0 && (
        <div className="flex h-40 items-center justify-center">
          <span className="text-lg text-gray-500">End of the result!</span>
        </div>
      )}
      <div className="mt-10 grid gap-10 md:grid-cols-2 lg:gap-10 xl:grid-cols-3">
        {posts.map(post => (
          <PostList key={post.id} post={post} aspect="square" />
        ))}
      </div>
      <Pagination
        pageIndex={page}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
      />
    </>
  );
}
