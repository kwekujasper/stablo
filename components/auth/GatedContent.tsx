"use client";

import { useState, useEffect } from "react";
import LoginModal from "./LoginModal";

interface GatedContentProps {
  teaser: string;    // First ~200 words of post HTML
  fullContent: string; // Full post HTML (shown after auth)
}

// Wraps subscriber-only post content.
// Shows a teaser + blur + login CTA when unauthenticated.
export default function GatedContent({ teaser, fullContent }: GatedContentProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => {
        if (r.ok) setAuthenticated(true);
      })
      .finally(() => setChecking(false));
  }, []);

  if (checking) return null;

  if (authenticated) {
    return (
      <div
        className="prose mx-auto dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: fullContent }}
      />
    );
  }

  return (
    <>
      {/* Teaser with fade/blur at bottom */}
      <div className="relative">
        <div
          className="prose mx-auto dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: teaser }}
        />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white dark:from-gray-950" />
      </div>

      {/* Subscriber CTA */}
      <div className="mx-auto mt-4 max-w-md rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-800 dark:bg-gray-900">
        <span className="mb-3 block text-2xl">🔒</span>
        <h3 className="mb-2 text-lg font-semibold dark:text-white">
          This article is for subscribers only
        </h3>
        <p className="mb-6 text-sm text-gray-500">
          Sign in to your account to read the full article.
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-full bg-blue-600 px-8 py-3 text-sm font-medium text-white hover:bg-blue-700">
          Sign In to Read
        </button>
      </div>

      {showModal && (
        <LoginModal
          onClose={() => setShowModal(false)}
          onSuccess={() => setAuthenticated(true)}
        />
      )}
    </>
  );
}
