/** @type {import('next').NextConfig} */

const WP_HOSTNAME = process.env.WP_SITE_URL
  ? new URL(process.env.WP_SITE_URL).hostname
  : "yourdomain.com";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.googletagservices.com https://adservice.google.com https://cdn.onesignal.com https://onesignal.com https://cdn.webpushr.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://${WP_HOSTNAME} https://secure.gravatar.com https://lh3.googleusercontent.com https://pagead2.googlesyndication.com https://www.google-analytics.com;
  frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com;
  connect-src 'self' https://${WP_HOSTNAME} https://pagead2.googlesyndication.com https://onesignal.com https://www.google-analytics.com https://stats.g.doubleclick.net;
  media-src 'self';
  worker-src 'self' blob: https://cdn.onesignal.com https://cdn.webpushr.com;
`.replace(/\n/g, " ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.trim(),
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    remotePatterns: [
      // WordPress media
      {
        protocol: "https",
        hostname: WP_HOSTNAME,
        pathname: "/wp-content/uploads/**",
      },
      // Gravatar avatars
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
      // Google user profile photos (for OAuth avatars if added later)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: process.env.VERCEL_ENV === "production",
  },

  eslint: {
    ignoreDuringBuilds: process.env.VERCEL_ENV === "production",
  },
};

module.exports = nextConfig;
