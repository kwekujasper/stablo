/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://yourdomain.com",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  sitemapSize: 5000,

  // Exclude admin and API routes
  exclude: [
    "/api/*",
    "/studio",
    "/studio/*",
    "/404",
    "/500",
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/studio/"],
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || "https://yourdomain.com"}/sitemap.xml`,
    ],
  },

  // Dynamically add WordPress posts/categories/authors at build time.
  // Requires WP_GRAPHQL_URL to be set.
  additionalPaths: async config => {
    const results = [];
    const endpoint = process.env.WP_GRAPHQL_URL;
    if (!endpoint) return results;

    try {
      // Posts
      const postsRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{
            posts(first: 9999, where: { status: PUBLISH }) {
              edges { node { slug modified } }
            }
          }`,
        }),
      });
      const postsData = await postsRes.json();
      for (const { node } of postsData?.data?.posts?.edges ?? []) {
        results.push(
          await config.transform(config, `/post/${node.slug}`)
        );
      }

      // Categories
      const catsRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ categories(first: 500) { nodes { slug } } }`,
        }),
      });
      const catsData = await catsRes.json();
      for (const node of catsData?.data?.categories?.nodes ?? []) {
        results.push(
          await config.transform(config, `/category/${node.slug}`)
        );
      }

      // Authors
      const authorsRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `{ users(first: 100, where: { hasPublishedPosts: POST }) { nodes { slug } } }`,
        }),
      });
      const authorsData = await authorsRes.json();
      for (const node of authorsData?.data?.users?.nodes ?? []) {
        results.push(
          await config.transform(config, `/author/${node.slug}`)
        );
      }
    } catch (err) {
      console.error("[sitemap] Error fetching WP data:", err.message);
    }

    return results;
  },
};
