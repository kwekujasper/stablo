import Container from "@/components/container";
import ThemeSwitch from "@/components/themeSwitch";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getSettings, getTopCategories } from "@/lib/wordpress/api";
import LeaderboardAd from "@/components/ads/LeaderboardAd";

const NewsletterForm = dynamic(
  () => import("@/components/blog/NewsletterForm"),
  { ssr: false }
);

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Archive", href: "/archive" },
  { label: "Search", href: "/search" },
];

// Update these with your actual social profile URLs
const socialLinks = [
  {
    label: "Twitter / X",
    href: process.env.NEXT_PUBLIC_TWITTER_URL || "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: process.env.NEXT_PUBLIC_YOUTUBE_URL || "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

export default async function Footer() {
  const [settings, categories] = await Promise.all([
    getSettings(),
    getTopCategories(6),
  ]);

  const footerAdSlot = process.env.NEXT_PUBLIC_FOOTER_AD_SLOT;

  return (
    <footer className="mt-16">
      {/* Footer leaderboard ad */}
      {footerAdSlot && (
        <div className="border-t border-gray-100 py-3 dark:border-gray-800">
          <LeaderboardAd slot={footerAdSlot} />
        </div>
      )}

      {/* Main footer grid */}
      <div className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
        <Container>
          <div className="grid grid-cols-1 gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand column */}
            <div className="space-y-4">
              <Link
                href="/"
                className="text-xl font-bold text-gray-900 dark:text-white">
                {settings?.title || "Blog"}
              </Link>
              {settings?.description && (
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {settings.description}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-gray-400 transition-colors hover:text-blue-500 dark:hover:text-blue-400">
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation column */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Navigation
              </h3>
              <ul className="space-y-2">
                {navLinks.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Topics / Categories column */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Topics
              </h3>
              {categories.length > 0 ? (
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="text-sm text-gray-600 transition-colors hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                        {cat.name}
                        {cat.count != null && (
                          <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-600">
                            ({cat.count})
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No categories yet.</p>
              )}
            </div>

            {/* Newsletter column */}
            <div>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Newsletter
              </h3>
              <NewsletterForm
                compact
                heading="Stay updated"
                subheading="New articles in your inbox. No spam."
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <Container>
          <div className="flex items-center justify-between py-5 text-sm text-gray-500 dark:text-gray-500">
            <span>
              © {new Date().getFullYear()} {settings?.title || "Blog"}. All
              rights reserved.
            </span>
            <ThemeSwitch />
          </div>
        </Container>
      </div>
    </footer>
  );
}
