import { Suspense } from "react";
import { notFound } from "next/navigation";
import Container from "@/components/container";
import PostList from "@/components/postlist";
import Loading from "@/components/loading";
import {
  getAllCategories,
  getPostsByCategory,
  getSettings,
} from "@/lib/wordpress/api";
import {
  CollectionPageSchema,
  BreadcrumbSchema,
} from "@/components/seo/JsonLd";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { posts, category } = await getPostsByCategory(params.slug, 1);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: category.description || `Posts in ${category.name}`,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const page = parseInt(searchParams?.page, 10) || 1;
  const POSTS_PER_PAGE = 9;

  let after = undefined;
  if (page > 1) {
    const prev = await getPostsByCategory(
      params.slug,
      POSTS_PER_PAGE * (page - 1)
    );
    after = prev.endCursor ?? undefined;
  }

  const { posts, category, hasNextPage } = await getPostsByCategory(
    params.slug,
    POSTS_PER_PAGE,
    after
  );

  if (!category) notFound();

  const settings = await getSettings();

  return (
    <>
      <CollectionPageSchema category={category} siteUrl={settings.url} />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: settings.url },
          {
            name: category.name,
            url: `${settings.url}/category/${category.slug}`,
          },
        ]}
      />
      <Container>
        <h1 className="text-center text-3xl font-semibold tracking-tight dark:text-white lg:text-4xl">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-2 text-center text-lg text-gray-500">
            {category.description}
          </p>
        )}
        <div className="mt-10 grid gap-10 md:grid-cols-2 lg:gap-10 xl:grid-cols-3">
          {posts.map(post => (
            <PostList key={post.id} post={post} aspect="square" />
          ))}
        </div>
        {posts.length === 0 && (
          <p className="mt-10 text-center text-gray-500">No posts found.</p>
        )}
        <div className="mt-10 flex justify-center gap-4">
          {page > 1 && (
            <a
              href={`/category/${params.slug}?page=${page - 1}`}
              className="rounded-full bg-gray-100 px-5 py-2 text-sm dark:bg-gray-800">
              ← Previous
            </a>
          )}
          {hasNextPage && (
            <a
              href={`/category/${params.slug}?page=${page + 1}`}
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
