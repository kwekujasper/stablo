import { POST_FIELDS, SEO_FIELDS, AUTHOR_FIELDS, CATEGORY_FIELDS } from "./fragments";

// ─── Posts ────────────────────────────────────────────────────────────────────

export const GET_ALL_POSTS = /* GraphQL */ `
  ${POST_FIELDS}
  query GetAllPosts($first: Int = 20, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          ...PostFields
        }
      }
    }
  }
`;

// SEO fields are only available when WPGraphQL for Yoast SEO plugin is active.
// Set NEXT_PUBLIC_YOAST_WPGRAPHQL=true in .env.local once the plugin is installed.
const SEO_BLOCK =
  process.env.NEXT_PUBLIC_YOAST_WPGRAPHQL === "true"
    ? `seo {
        title
        metaDesc
        opengraphTitle
        opengraphDescription
        opengraphImage {
          sourceUrl
          altText
          mediaDetails { width height }
        }
        twitterTitle
        twitterDescription
        twitterImage { sourceUrl }
        canonical
        schema { raw }
      }`
    : "";

// ACF fields are only available when WPGraphQL for ACF plugin is active.
const ACF_BLOCK =
  process.env.NEXT_PUBLIC_ACF_WPGRAPHQL === "true"
    ? `acfFields {
        isSubscriberOnly
        adSlotsEnabled
      }`
    : "";

export const GET_POST_BY_SLUG = /* GraphQL */ `
  ${POST_FIELDS}
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ...PostFields
      content(format: RENDERED)
      status
      ${ACF_BLOCK}
      ${SEO_BLOCK}
    }
  }
`;

export const GET_ALL_POST_SLUGS = /* GraphQL */ `
  query GetAllPostSlugs {
    posts(first: 9999, where: { status: PUBLISH }) {
      edges {
        node {
          slug
          modified
        }
      }
    }
  }
`;

export const GET_PAGINATED_POSTS = /* GraphQL */ `
  ${POST_FIELDS}
  query GetPaginatedPosts($first: Int = 6, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...PostFields
        }
      }
    }
  }
`;

export const SEARCH_POSTS = /* GraphQL */ `
  ${POST_FIELDS}
  query SearchPosts($search: String!, $first: Int = 10) {
    posts(first: $first, where: { search: $search, status: PUBLISH }) {
      edges {
        node {
          ...PostFields
        }
      }
    }
  }
`;

export const GET_RELATED_POSTS = /* GraphQL */ `
  ${POST_FIELDS}
  query GetRelatedPosts($categoryId: [ID], $excludeId: [ID], $first: Int = 4) {
    posts(
      first: $first
      where: {
        categoryIn: $categoryId
        notIn: $excludeId
        status: PUBLISH
      }
    ) {
      edges {
        node {
          ...PostFields
        }
      }
    }
  }
`;

// ─── Categories ───────────────────────────────────────────────────────────────

export const GET_ALL_CATEGORIES = /* GraphQL */ `
  ${CATEGORY_FIELDS}
  query GetAllCategories {
    categories(first: 100, where: { hideEmpty: true }) {
      nodes {
        ...CategoryFields
      }
    }
  }
`;

export const GET_POSTS_BY_CATEGORY = /* GraphQL */ `
  ${POST_FIELDS}
  query GetPostsByCategory($slug: String!, $first: Int = 10, $after: String) {
    posts(
      first: $first
      after: $after
      where: { categoryName: $slug, status: PUBLISH }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...PostFields
        }
      }
    }
    categories(where: { slug: [$slug] }) {
      nodes {
        id
        name
        slug
        description
      }
    }
  }
`;

// ─── Authors ──────────────────────────────────────────────────────────────────

export const GET_ALL_AUTHORS = /* GraphQL */ `
  ${AUTHOR_FIELDS}
  query GetAllAuthors {
    users(first: 100, where: { hasPublishedPosts: POST }) {
      nodes {
        ...AuthorFields
      }
    }
  }
`;

export const GET_AUTHOR_BY_SLUG = /* GraphQL */ `
  ${AUTHOR_FIELDS}
  query GetAuthorBySlug($slug: ID!) {
    user(id: $slug, idType: SLUG) {
      ...AuthorFields
    }
  }
`;

export const GET_POSTS_BY_AUTHOR = /* GraphQL */ `
  ${POST_FIELDS}
  query GetPostsByAuthor($slug: String!, $first: Int = 10, $after: String) {
    posts(
      first: $first
      after: $after
      where: { authorName: $slug, status: PUBLISH }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ...PostFields
        }
      }
    }
  }
`;

// ─── Site Settings ────────────────────────────────────────────────────────────

export const GET_GENERAL_SETTINGS = /* GraphQL */ `
  query GetGeneralSettings {
    generalSettings {
      title
      description
      url
      language
      logoUrl
    }
  }
`;

// ─── Comments ─────────────────────────────────────────────────────────────────

export const GET_COMMENTS = /* GraphQL */ `
  query GetComments($postId: ID!) {
    comments(
      first: 100
      where: { contentId: $postId, status: "approve", parent: 0 }
    ) {
      nodes {
        id
        databaseId
        content(format: RENDERED)
        date
        parentId
        author {
          node {
            name
            avatar { url }
            ... on CommentAuthor {
              url
            }
          }
        }
        replies {
          nodes {
            id
            databaseId
            content(format: RENDERED)
            date
            parentId
            author {
              node {
                name
                avatar { url }
              }
            }
          }
        }
      }
    }
  }
`;

// ─── Nav Menu ─────────────────────────────────────────────────────────────────

export const GET_MENU_ITEMS = /* GraphQL */ `
  query GetMenuItems($location: MenuLocationEnum!) {
    menuItems(where: { location: $location }, first: 50) {
      nodes {
        id
        label
        url
        path
        parentId
        childItems {
          nodes {
            id
            label
            url
            path
          }
        }
      }
    }
  }
`;
