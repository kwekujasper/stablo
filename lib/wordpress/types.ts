export interface WPImage {
  sourceUrl: string;
  altText: string;
  mediaDetails?: {
    width: number;
    height: number;
  };
}

export interface WPCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
  description?: string;
}

export interface WPAuthor {
  id: string;
  name: string;
  slug: string;
  description?: string;
  avatar?: {
    url: string;
  };
}

export interface WPPost {
  id: string;
  databaseId: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  modified: string;
  status: string;
  featuredImage?: {
    node: WPImage;
  };
  categories?: {
    nodes: WPCategory[];
  };
  author?: {
    node: WPAuthor;
  };
  seo?: WPYoastSEO;
  acfFields?: {
    isSubscriberOnly?: boolean;
    adSlotsEnabled?: boolean;
  };
}

export interface WPYoastSEO {
  title?: string;
  metaDesc?: string;
  opengraphTitle?: string;
  opengraphDescription?: string;
  opengraphImage?: {
    sourceUrl: string;
    altText: string;
    mediaDetails?: { width: number; height: number };
  };
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: {
    sourceUrl: string;
  };
  canonical?: string;
  schema?: {
    raw?: string;
  };
}

export interface WPComment {
  id: string;
  databaseId: number;
  content: string;
  date: string;
  parentId?: string;
  author?: {
    node: {
      name: string;
      avatar?: { url: string };
      url?: string;
    };
  };
  replies?: {
    nodes: WPComment[];
  };
}

export interface WPPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

export interface WPPostsConnection {
  pageInfo: WPPageInfo;
  edges: Array<{
    cursor: string;
    node: WPPost;
  }>;
}

export interface WPGeneralSettings {
  title: string;
  description: string;
  url: string;
  email?: string;
  language?: string;
}

export interface WPMenuItem {
  id: string;
  label: string;
  url: string;
  path: string;
  parentId?: string;
  childItems?: {
    nodes: WPMenuItem[];
  };
}
