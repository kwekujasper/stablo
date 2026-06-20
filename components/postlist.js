import Image from "next/image";
import Link from "next/link";
import { cx } from "@/utils/all";
import { parseISO, format } from "date-fns";
import { PhotoIcon } from "@heroicons/react/24/outline";
import CategoryLabel from "@/components/blog/category";

export default function PostList({
  post,
  aspect,
  minimal,
  pathPrefix,
  preloadImage,
  fontSize,
  fontWeight
}) {
  const featuredImage = post?.featuredImage?.node;
  const author = post?.author?.node;

  return (
    <div className={cx("group cursor-pointer", minimal && "grid gap-10 md:grid-cols-2")}>
      <div className="overflow-hidden rounded-md bg-gray-100 transition-all hover:scale-105 dark:bg-gray-800">
        <Link
          className={cx(
            "relative block",
            aspect === "landscape"
              ? "aspect-video"
              : aspect === "custom"
              ? "aspect-[5/4]"
              : "aspect-square"
          )}
          href={`/post/${pathPrefix ? `${pathPrefix}/` : ""}${post.slug}`}>
          {featuredImage ? (
            <Image
              src={featuredImage.sourceUrl}
              alt={featuredImage.altText || post.title || "Thumbnail"}
              priority={preloadImage ? true : false}
              className="object-cover transition-all"
              fill
              sizes="(max-width: 768px) 30vw, 33vw"
            />
          ) : (
            <span className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 text-gray-200">
              <PhotoIcon />
            </span>
          )}
        </Link>
      </div>

      <div className={cx(minimal && "flex items-center")}>
        <div>
          <CategoryLabel categories={post.categories?.nodes} nomargin={minimal} />
          <h2
            className={cx(
              fontSize === "large" ? "text-2xl" : minimal ? "text-3xl" : "text-lg",
              fontWeight === "normal"
                ? "line-clamp-2 font-medium tracking-normal text-black"
                : "font-semibold leading-snug tracking-tight",
              "mt-2 dark:text-white"
            )}>
            <Link href={`/post/${pathPrefix ? `${pathPrefix}/` : ""}${post.slug}`}>
              <span className="bg-gradient-to-r from-green-200 to-green-100 bg-[length:0px_10px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_10px] dark:from-purple-800 dark:to-purple-900">
                {post.title}
              </span>
            </Link>
          </h2>

          <div className="mt-3 flex items-center space-x-3 text-gray-500 dark:text-gray-400">
            {author && (
              <Link href={`/author/${author.slug}`}>
                <div className="flex items-center gap-3">
                  <div className="relative h-5 w-5 flex-shrink-0">
                    {author.avatar?.url && (
                      <Image
                        src={author.avatar.url}
                        alt={author.name}
                        className="rounded-full object-cover"
                        fill
                        sizes="20px"
                      />
                    )}
                  </div>
                  <span className="truncate text-sm">{author.name}</span>
                </div>
              </Link>
            )}
            {author && post?.date && (
              <span className="text-xs text-gray-300 dark:text-gray-600">&bull;</span>
            )}
            {post?.date && (
              <time className="truncate text-sm" dateTime={post.date}>
                {format(parseISO(post.date), "MMMM dd, yyyy")}
              </time>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
