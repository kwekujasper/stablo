import { getClient } from "./client";
import {
  GET_ALL_POSTS,
  GET_POST_BY_SLUG,
  GET_ALL_POST_SLUGS,
  GET_PAGINATED_POSTS,
  SEARCH_POSTS,
  GET_RELATED_POSTS,
  GET_ALL_CATEGORIES,
  GET_POSTS_BY_CATEGORY,
  GET_ALL_AUTHORS,
  GET_AUTHOR_BY_SLUG,
  GET_POSTS_BY_AUTHOR,
  GET_GENERAL_SETTINGS,
  GET_COMMENTS,
  GET_MENU_ITEMS,
} from "./queries";
import type {
  WPPost,
  WPCategory,
  WPAuthor,
  WPComment,
  WPGeneralSettings,
  WPMenuItem,
  WPPostsConnection,
} from "./types";

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function getAllPosts(first = 20): Promise<WPPost[]> {
  try {
    const client = getClient(["posts"]);
    const data = await client.request<{ posts: WPPostsConnection }>(
      GET_ALL_POSTS,
      { first }
    );
    return data.posts.edges.map(e => e.node);
  } catch (err) {
    console.error("[WP] getAllPosts failed:", err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
  try {
    const client = getClient([`post-${slug}`]);
    const data = await client.request<{ post: WPPost }>(GET_POST_BY_SLUG, {
      slug,
    });
    return data.post ?? null;
  } catch (err) {
    console.error("[WP] getPostBySlug failed:", err);
    return null;
  }
}

export async function getAllPostsSlugs(): Promise<
  Array<{ slug: string; modified?: string }>
> {
  try {
    const client = getClient(["post-slugs"]);
    const data = await client.request<{
      posts: { edges: Array<{ node: { slug: string; modified: string } }> };
    }>(GET_ALL_POST_SLUGS);
    return data.posts.edges.map(e => ({
      slug: e.node.slug,
      modified: e.node.modified,
    }));
  } catch (err) {
    console.error("[WP] getAllPostsSlugs failed:", err);
    return [];
  }
}

export async function getPaginatedPosts(
  first = 6,
  after?: string
): Promise<{
  posts: WPPost[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  try {
    const client = getClient(["posts"]);
    const data = await client.request<{ posts: WPPostsConnection }>(
      GET_PAGINATED_POSTS,
      { first, after }
    );
    return {
      posts: data.posts.edges.map(e => e.node),
      hasNextPage: data.posts.pageInfo.hasNextPage,
      endCursor: data.posts.pageInfo.endCursor ?? null,
    };
  } catch (err) {
    console.error("[WP] getPaginatedPosts failed:", err);
    return { posts: [], hasNextPage: false, endCursor: null };
  }
}

export async function searchPosts(
  query: string,
  first = 10
): Promise<WPPost[]> {
  try {
    const client = getClient();
    const data = await client.request<{ posts: WPPostsConnection }>(
      SEARCH_POSTS,
      { search: query, first }
    );
    return data.posts.edges.map(e => e.node);
  } catch (err) {
    console.error("[WP] searchPosts failed:", err);
    return [];
  }
}

export async function getRelatedPosts(
  categoryIds: string[],
  excludeId: string,
  first = 4
): Promise<WPPost[]> {
  try {
    const client = getClient(["posts"]);
    const data = await client.request<{ posts: WPPostsConnection }>(
      GET_RELATED_POSTS,
      { categoryId: categoryIds, excludeId: [excludeId], first }
    );
    return data.posts.edges.map(e => e.node);
  } catch (err) {
    console.error("[WP] getRelatedPosts failed:", err);
    return [];
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getAllCategories(): Promise<WPCategory[]> {
  try {
    const client = getClient(["categories"]);
    const data = await client.request<{ categories: { nodes: WPCategory[] } }>(
      GET_ALL_CATEGORIES
    );
    return data.categories.nodes;
  } catch (err) {
    console.error("[WP] getAllCategories failed:", err);
    return [];
  }
}

export async function getPostsByCategory(
  slug: string,
  first = 10,
  after?: string
): Promise<{
  posts: WPPost[];
  category: WPCategory | null;
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  try {
    const client = getClient([`category-${slug}`]);
    const data = await client.request<{
      posts: WPPostsConnection;
      categories: { nodes: WPCategory[] };
    }>(GET_POSTS_BY_CATEGORY, { slug, first, after });
    return {
      posts: data.posts.edges.map(e => e.node),
      category: data.categories.nodes[0] ?? null,
      hasNextPage: data.posts.pageInfo.hasNextPage,
      endCursor: data.posts.pageInfo.endCursor ?? null,
    };
  } catch (err) {
    console.error("[WP] getPostsByCategory failed:", err);
    return { posts: [], category: null, hasNextPage: false, endCursor: null };
  }
}

export async function getTopCategories(limit = 5): Promise<WPCategory[]> {
  const categories = await getAllCategories();
  return [...categories]
    .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
    .slice(0, limit);
}

// ─── Authors ──────────────────────────────────────────────────────────────────

export async function getAllAuthors(): Promise<WPAuthor[]> {
  try {
    const client = getClient(["authors"]);
    const data = await client.request<{ users: { nodes: WPAuthor[] } }>(
      GET_ALL_AUTHORS
    );
    return data.users.nodes;
  } catch (err) {
    console.error("[WP] getAllAuthors failed:", err);
    return [];
  }
}

export async function getAuthorBySlug(slug: string): Promise<WPAuthor | null> {
  try {
    const client = getClient([`author-${slug}`]);
    const data = await client.request<{ user: WPAuthor }>(GET_AUTHOR_BY_SLUG, {
      slug,
    });
    return data.user ?? null;
  } catch (err) {
    console.error("[WP] getAuthorBySlug failed:", err);
    return null;
  }
}

export async function getPostsByAuthor(
  slug: string,
  first = 10,
  after?: string
): Promise<{
  posts: WPPost[];
  hasNextPage: boolean;
  endCursor: string | null;
}> {
  try {
    const client = getClient([`author-${slug}`]);
    const data = await client.request<{ posts: WPPostsConnection }>(
      GET_POSTS_BY_AUTHOR,
      { slug, first, after }
    );
    return {
      posts: data.posts.edges.map(e => e.node),
      hasNextPage: data.posts.pageInfo.hasNextPage,
      endCursor: data.posts.pageInfo.endCursor ?? null,
    };
  } catch (err) {
    console.error("[WP] getPostsByAuthor failed:", err);
    return { posts: [], hasNextPage: false, endCursor: null };
  }
}

export async function getAllAuthorsSlugs(): Promise<Array<{ author: string }>> {
  const authors = await getAllAuthors();
  return authors.map(a => ({ author: a.slug }));
}

// ─── Site Settings ────────────────────────────────────────────────────────────

function decodeHtmlEntities(str: string): string {
  return str.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(Number(code))
  ).replace(/&amp;/g, "&")
   .replace(/&lt;/g, "<")
   .replace(/&gt;/g, ">")
   .replace(/&quot;/g, '"')
   .replace(/&#039;/g, "'")
   .replace(/&apos;/g, "'");
}

export async function getSettings(): Promise<WPGeneralSettings> {
  try {
    const client = getClient(["settings"]);
    const data = await client.request<{
      generalSettings: WPGeneralSettings;
    }>(GET_GENERAL_SETTINGS);
    const s = data.generalSettings;
    return {
      ...s,
      title: s.title ? decodeHtmlEntities(s.title) : s.title,
      description: s.description ? decodeHtmlEntities(s.description) : s.description,
    };
  } catch (err) {
    console.error("[WP] getSettings failed:", err);
    return { title: "", description: "", url: "" };
  }
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(postId: string): Promise<WPComment[]> {
  try {
    const client = getClient();
    const data = await client.request<{ comments: { nodes: WPComment[] } }>(
      GET_COMMENTS,
      { postId }
    );
    return data.comments.nodes;
  } catch (err) {
    console.error("[WP] getComments failed:", err);
    return [];
  }
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export async function getMenuItems(
  location: string
): Promise<WPMenuItem[]> {
  try {
    const client = getClient(["menu"]);
    const data = await client.request<{
      menuItems: { nodes: WPMenuItem[] };
    }>(GET_MENU_ITEMS, { location });
    return data.menuItems.nodes;
  } catch (err) {
    console.error("[WP] getMenuItems failed:", err);
    return [];
  }
}
