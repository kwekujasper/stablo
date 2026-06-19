import PostPage from "./default";
import { getAllPostsSlugs, getPostBySlug, getSettings } from "@/lib/wordpress/api";
import {
  ArticleSchema,
  BreadcrumbSchema,
} from "@/components/seo/JsonLd";

export async function generateStaticParams() {
  const slugs = await getAllPostsSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  const settings = await getSettings();

  if (!post) return { title: "Post not found" };

  // Prefer Yoast SEO fields if available
  const seo = post.seo;
  const imageUrl =
    seo?.opengraphImage?.sourceUrl ||
    post.featuredImage?.node?.sourceUrl;

  return {
    title: seo?.title || post.title,
    description:
      seo?.metaDesc ||
      post.excerpt?.replace(/<[^>]+>/g, "").trim().slice(0, 160),
    alternates: {
      canonical: seo?.canonical || `${settings?.url}/post/${post.slug}`,
    },
    openGraph: {
      title: seo?.opengraphTitle || post.title,
      description: seo?.opengraphDescription || post.excerpt,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      title: seo?.twitterTitle || post.title,
      description: seo?.twitterDescription,
      card: "summary_large_image",
      images: seo?.twitterImage?.sourceUrl
        ? [seo.twitterImage.sourceUrl]
        : [],
    },
  };
}

export default async function PostDefault({ params }) {
  const [post, settings] = await Promise.all([
    getPostBySlug(params.slug),
    getSettings(),
  ]);

  return (
    <>
      {post && settings && (
        <>
          <ArticleSchema
            post={post}
            siteUrl={settings.url}
            siteName={settings.title}
          />
          <BreadcrumbSchema
            items={[
              { name: "Home", url: settings.url },
              {
                name: post.categories?.nodes[0]?.name || "Blog",
                url: `${settings.url}/category/${post.categories?.nodes[0]?.slug || "blog"}`,
              },
              { name: post.title, url: `${settings.url}/post/${post.slug}` },
            ]}
          />
        </>
      )}
      <PostPage post={post} />
    </>
  );
}

export const revalidate = 3600;
