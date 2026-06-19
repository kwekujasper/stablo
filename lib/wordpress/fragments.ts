export const AUTHOR_FIELDS = /* GraphQL */ `
  fragment AuthorFields on User {
    id
    name
    slug
    description
    avatar {
      url
    }
  }
`;

export const CATEGORY_FIELDS = /* GraphQL */ `
  fragment CategoryFields on Category {
    id
    name
    slug
    count
    description
  }
`;

export const IMAGE_FIELDS = /* GraphQL */ `
  fragment ImageFields on MediaItem {
    sourceUrl
    altText
    mediaDetails {
      width
      height
    }
  }
`;

// Only included when WPGraphQL for Yoast SEO plugin is active.
// Falls back gracefully if the plugin is not installed.
export const SEO_FIELDS = /* GraphQL */ `
  fragment SeoFields on PostTypeSEO {
    title
    metaDesc
    opengraphTitle
    opengraphDescription
    opengraphImage {
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
    twitterTitle
    twitterDescription
    twitterImage {
      sourceUrl
    }
    canonical
    schema {
      raw
    }
  }
`;

export const POST_FIELDS = /* GraphQL */ `
  ${AUTHOR_FIELDS}
  ${CATEGORY_FIELDS}
  ${IMAGE_FIELDS}
  fragment PostFields on Post {
    id
    databaseId
    slug
    title
    excerpt(format: RENDERED)
    date
    modified
    featuredImage {
      node {
        ...ImageFields
      }
    }
    categories {
      nodes {
        ...CategoryFields
      }
    }
    author {
      node {
        ...AuthorFields
      }
    }
  }
`;
