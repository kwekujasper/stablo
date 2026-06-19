import { GraphQLClient } from "graphql-request";

const endpoint = process.env.WP_GRAPHQL_URL;

if (!endpoint) {
  console.error(
    "[WordPress] WP_GRAPHQL_URL is not set. Check your environment variables."
  );
}

// Public client — used for all server-side data fetching with Next.js cache tags
export function getClient(tags?: string[]): GraphQLClient {
  return new GraphQLClient(endpoint || "", {
    fetch: (url: RequestInfo | URL, init?: RequestInit) =>
      fetch(url, {
        ...init,
        next: {
          // 1-hour stale time; on-demand webhook resets specific tags
          revalidate: 3600,
          tags: tags ?? ["wordpress"],
        },
      }),
  });
}

// Authenticated client — used for subscriber-only content.
// Token is retrieved server-side from the httpOnly cookie; never passed from the browser.
export function getAuthClient(token: string): GraphQLClient {
  return new GraphQLClient(endpoint || "", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
