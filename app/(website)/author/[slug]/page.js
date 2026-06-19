import { notFound } from "next/navigation";
import Image from "next/image";
import Container from "@/components/container";
import PostList from "@/components/postlist";
import {
  getAllAuthors,
  getAuthorBySlug,
  getPostsByAuthor,
  getSettings,
} from "@/lib/wordpress/api";
import { PersonSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

export async function generateStaticParams() {
  const authors = await getAllAuthors();
  return authors.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const author = await getAuthorBySlug(params.slug);
  if (!author) return { title: "Author not found" };
  return {
    title: author.name,
    description: author.description || `Posts by ${author.name}`,
  };
}

export default async function AuthorPage({ params, searchParams }) {
  const page = parseInt(searchParams?.page, 10) || 1;
  const POSTS_PER_PAGE = 9;

  let after = undefined;
  if (page > 1) {
    const prev = await getPostsByAuthor(
      params.slug,
      POSTS_PER_PAGE * (page - 1)
    );
    after = prev.endCursor ?? undefined;
  }

  const [author, { posts, hasNextPage }, settings] = await Promise.all([
    getAuthorBySlug(params.slug),
    getPostsByAuthor(params.slug, POSTS_PER_PAGE, after),
    getSettings(),
  ]);

  if (!author) notFound();

  return (
    <>
      <PersonSchema author={author} siteUrl={settings.url} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: settings.url },
          {
            name: author.name,
            url: `${settings.url}/author/${author.slug}`,
          },
        ]}
      />
      <Container>
        <div className="mx-auto mb-10 max-w-screen-md text-center">
          {author.avatar?.url && (
            <div className="relative mx-auto mb-4 h-20 w-20">
              <Image
                src={author.avatar.url}
                alt={author.name}
                fill
                className="rounded-full object-cover"
                sizes="80px"
              />
            </div>
          )}
          <h1 className="text-3xl font-semibold tracking-tight dark:text-white lg:text-4xl">
            {author.name}
          </h1>
          {author.description && (
            <p className="mt-3 text-lg text-gray-500">{author.description}</p>
          )}
        </div>

        <div className="mt-6 grid gap-10 md:grid-cols-2 lg:gap-10 xl:grid-cols-3">
          {posts.map(post => (
            <PostList key={post.id} post={post} aspect="square" />
          ))}
        </div>
        {posts.length === 0 && (
          <p className="mt-10 text-center text-gray-500">No posts yet.</p>
        )}
        <div className="mt-10 flex justify-center gap-4">
          {page > 1 && (
            <a
              href={`/author/${params.slug}?page=${page - 1}`}
              className="rounded-full bg-gray-100 px-5 py-2 text-sm dark:bg-gray-800">
              ← Previous
            </a>
          )}
          {hasNextPage && (
            <a
              href={`/author/${params.slug}?page=${page + 1}`}
              className="rounded-full bg-gray-100 px-5 py-2 text-sm dark:bg-gray-800">
              Next →
            </a>
          )}
        </div>
      </Container>
    </>
  );
}

export const revalidate = 3600;
