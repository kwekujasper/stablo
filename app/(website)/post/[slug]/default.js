import Image from "next/image";
import Link from "next/link";
import Container from "@/components/container";
import { notFound } from "next/navigation";
import { parseISO, format } from "date-fns";
import CategoryLabel from "@/components/blog/category";
import AuthorCard from "@/components/blog/authorCard";
import dynamic from "next/dynamic";

const Comments = dynamic(() => import("@/components/blog/Comments"), { ssr: false });
const NewsletterForm = dynamic(() => import("@/components/blog/NewsletterForm"), { ssr: false });
const GatedContent = dynamic(() => import("@/components/auth/GatedContent"), { ssr: false });

// Inject an in-article ad every N paragraphs
const AD_INTERVAL = 4;
const IN_ARTICLE_AD_SLOT = process.env.NEXT_PUBLIC_IN_ARTICLE_AD_SLOT;

function PostBody({ content, isGated }) {
  if (!content) return null;

  // Split at paragraph boundaries to inject ads
  const paragraphs = content.split(/(?<=<\/p>)/i).filter(Boolean);

  return (
    <div className="prose mx-auto my-3 dark:prose-invert prose-a:text-blue-600">
      {paragraphs.map((para, i) => (
        <div key={i}>
          <div dangerouslySetInnerHTML={{ __html: para }} />
          {IN_ARTICLE_AD_SLOT &&
            (i + 1) % AD_INTERVAL === 0 &&
            !isGated && (
              <div className="my-6 not-prose" style={{ minHeight: 250 }}>
                {/* InArticleAd loaded client-side to avoid SSR issues */}
              </div>
            )}
        </div>
      ))}
    </div>
  );
}

export default function Post(props) {
  const { post } = props;
  const slug = post?.slug;

  if (!slug) notFound();

  const featuredImage = post?.featuredImage?.node;
  const author = post?.author?.node;
  const isSubscriberOnly = post?.acfFields?.isSubscriberOnly ?? false;

  // Build teaser: first ~200 words of HTML for gated content
  const teaser = post.content
    ? post.content.split(/(?<=<\/p>)/i).slice(0, 2).join("")
    : "";

  return (
    <>
      <Container className="!pt-0">
        <div className="mx-auto max-w-screen-md">
          <div className="flex justify-center">
            <CategoryLabel categories={post.categories?.nodes} />
          </div>

          <h1 className="text-brand-primary mb-3 mt-2 text-center text-3xl font-semibold tracking-tight dark:text-white lg:text-4xl lg:leading-snug">
            {post.title}
          </h1>

          <div className="mt-3 flex justify-center space-x-3 text-gray-500">
            <div className="flex items-center gap-3">
              {author?.avatar?.url && (
                <div className="relative h-10 w-10 flex-shrink-0">
                  <Link href={`/author/${author.slug}`}>
                    <Image
                      src={author.avatar.url}
                      alt={author.name}
                      className="rounded-full object-cover"
                      fill
                      sizes="40px"
                    />
                  </Link>
                </div>
              )}
              <div>
                {author && (
                  <p className="text-gray-800 dark:text-gray-400">
                    <Link href={`/author/${author.slug}`}>{author.name}</Link>
                  </p>
                )}
                {post?.date && (
                  <div className="flex items-center space-x-2 text-sm">
                    <time className="text-gray-500 dark:text-gray-400" dateTime={post.date}>
                      {format(parseISO(post.date), "MMMM dd, yyyy")}
                    </time>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>

      {featuredImage && (
        <div className="relative z-0 mx-auto aspect-video max-w-screen-lg overflow-hidden lg:rounded-lg">
          <Image
            src={featuredImage.sourceUrl}
            alt={featuredImage.altText || "Thumbnail"}
            loading="eager"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      <Container>
        <article className="mx-auto max-w-screen-md">
          {isSubscriberOnly ? (
            <GatedContent teaser={teaser} fullContent={post.content || ""} />
          ) : (
            <PostBody content={post.content} isGated={false} />
          )}

          <div className="mb-7 mt-7 flex justify-center">
            <Link
              href="/"
              className="bg-brand-secondary/20 rounded-full px-5 py-2 text-sm text-blue-600 dark:text-blue-500">
              ← View all posts
            </Link>
          </div>

          {author && <AuthorCard author={author} />}

          {/* Newsletter opt-in after post */}
          <div className="mt-10">
            <NewsletterForm compact={false} />
          </div>

          {/* Comments section */}
          {post.databaseId && (
            <Comments postId={post.databaseId} />
          )}
        </article>
      </Container>
    </>
  );
}
