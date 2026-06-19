import type { WPPost, WPAuthor, WPCategory, WPGeneralSettings } from "@/lib/wordpress/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Script({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-side JSON-LD
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ─── WebSite (homepage) ───────────────────────────────────────────────────────

export function WebSiteSchema({
  settings,
}: {
  settings: WPGeneralSettings;
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: settings.title,
        description: settings.description,
        url: settings.url,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${settings.url}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

// ─── Organization ─────────────────────────────────────────────────────────────

export function OrganizationSchema({
  settings,
  logoUrl,
}: {
  settings: WPGeneralSettings;
  logoUrl?: string;
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: settings.title,
        url: settings.url,
        ...(logoUrl && {
          logo: {
            "@type": "ImageObject",
            url: logoUrl,
          },
        }),
      }}
    />
  );
}

// ─── Article (blog post) ──────────────────────────────────────────────────────

export function ArticleSchema({
  post,
  siteUrl,
  siteName,
  logoUrl,
}: {
  post: WPPost;
  siteUrl: string;
  siteName: string;
  logoUrl?: string;
}) {
  const author = post.author?.node;
  const image = post.featuredImage?.node;
  const categories = post.categories?.nodes ?? [];

  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.excerpt?.replace(/<[^>]+>/g, "").trim(),
        url: `${siteUrl}/post/${post.slug}`,
        datePublished: post.date,
        dateModified: post.modified || post.date,
        ...(image && {
          image: {
            "@type": "ImageObject",
            url: image.sourceUrl,
            width: image.mediaDetails?.width,
            height: image.mediaDetails?.height,
          },
        }),
        author: author
          ? {
              "@type": "Person",
              name: author.name,
              url: `${siteUrl}/author/${author.slug}`,
            }
          : undefined,
        publisher: {
          "@type": "Organization",
          name: siteName,
          url: siteUrl,
          ...(logoUrl && {
            logo: { "@type": "ImageObject", url: logoUrl },
          }),
        },
        keywords: categories.map(c => c.name).join(", "),
        articleSection: categories[0]?.name,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${siteUrl}/post/${post.slug}`,
        },
      }}
    />
  );
}

// ─── BreadcrumbList ───────────────────────────────────────────────────────────

export function BreadcrumbSchema({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

// ─── Author / Person ─────────────────────────────────────────────────────────

export function PersonSchema({
  author,
  siteUrl,
}: {
  author: WPAuthor;
  siteUrl: string;
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name: author.name,
        url: `${siteUrl}/author/${author.slug}`,
        description: author.description,
        ...(author.avatar?.url && {
          image: {
            "@type": "ImageObject",
            url: author.avatar.url,
          },
        }),
      }}
    />
  );
}

// ─── CollectionPage (category archive) ───────────────────────────────────────

export function CollectionPageSchema({
  category,
  siteUrl,
}: {
  category: WPCategory;
  siteUrl: string;
}) {
  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: category.name,
        description: category.description,
        url: `${siteUrl}/category/${category.slug}`,
      }}
    />
  );
}
