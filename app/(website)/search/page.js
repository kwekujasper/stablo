"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/container";
import PostList from "@/components/postlist";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      runSearch(q);
    }
  }, []);

  async function runSearch(q) {
    if (!q || q.trim().length < 2) return;
    startTransition(async () => {
      setSearched(true);
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q.trim())}`
      );
      const data = await res.json();
      setResults(data.posts ?? []);
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    runSearch(query);
  }

  return (
    <Container>
      <h1 className="mb-6 text-center text-3xl font-semibold tracking-tight dark:text-white lg:text-4xl">
        Search
      </h1>
      <form onSubmit={handleSubmit} className="mx-auto mb-10 max-w-xl">
        <div className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="w-full rounded-full border border-gray-300 px-5 py-3 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            aria-label="Search articles"
            minLength={2}
          />
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700">
            Search
          </button>
        </div>
      </form>

      {isPending && (
        <p className="text-center text-gray-500" aria-live="polite">
          Searching…
        </p>
      )}

      {!isPending && searched && results.length === 0 && (
        <p className="text-center text-gray-500" aria-live="polite">
          No results found for &ldquo;{query}&rdquo;.
        </p>
      )}

      <div className="grid gap-10 md:grid-cols-2 lg:gap-10 xl:grid-cols-3">
        {results.map(post => (
          <PostList key={post.id} post={post} aspect="square" />
        ))}
      </div>
    </Container>
  );
}
