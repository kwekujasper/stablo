import Image from "next/image";
import { parseISO, format } from "date-fns";
import { cx } from "@/utils/all";
import Link from "next/link";

export default function Featured({ post, pathPrefix }) {
  const featuredImage = post?.featuredImage?.node;
  const author = post?.author?.node;

  return (
    <div className={cx("grid md:grid-cols-2 gap-5 md:gap-10 md:min-h-[calc(100vh-30vh)]")}
      style={{ backgroundColor: "black" }}>
      {featuredImage && (
        <div className="relative aspect-video md:aspect-auto">
          <Link href={`/post/${pathPrefix ? `${pathPrefix}/` : ""}${post.slug}`}>
            <Image
              src={featuredImage.sourceUrl}
              alt={featuredImage.altText || "Thumbnail"}
              priority
              fill
              sizes="100vw"
              className="object-cover"
            />
          </Link>
        </div>
      )}

      <div className="self-center px-5 pb-10">
        <Link href={`/post/${pathPrefix ? `${pathPrefix}/` : ""}${post.slug}`}>
          <div className="max-w-2xl">
            <h1 className="mt-2 mb-3 text-3xl font-semibold tracking-tight text-white lg:leading-tight text-brand-primary lg:text-5xl">
              {post.title}
            </h1>

            <div className="flex mt-4 space-x-3 text-gray-500 md:mt-8">
              <div className="flex flex-col gap-3 md:items-center md:flex-row">
                {author && (
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0 w-5 h-5">
                      {author.avatar?.url && (
                        <Image
                          src={author.avatar.url}
                          alt={author.name}
                          className="object-cover rounded-full"
                          fill
                          sizes="20px"
                        />
                      )}
                    </div>
                    <p className="text-gray-100">
                      {author.name}
                      <span className="hidden pl-2 md:inline"> ·</span>
                    </p>
                  </div>
                )}
                {post?.date && (
                  <div className="flex space-x-2 text-sm md:flex-row md:items-center">
                    <time className="text-white" dateTime={post.date}>
                      {format(parseISO(post.date), "MMMM dd, yyyy")}
                    </time>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
