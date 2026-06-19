import { getSettings } from "@/lib/wordpress/api";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { WebSiteSchema, OrganizationSchema } from "@/components/seo/JsonLd";
import AdSenseScript from "@/components/ads/AdSenseScript";
import OneSignalInit from "@/components/push/OneSignalInit";
import WebPushrInit from "@/components/push/WebPushrInit";

async function sharedMetaData() {
  const settings = await getSettings();

  return {
    title: {
      default: settings?.title || "Blog",
      template: `%s | ${settings?.title || "Blog"}`,
    },
    description: settings?.description || "",
    keywords: [],
    metadataBase: settings?.url ? new URL(settings.url) : undefined,
    alternates: {
      canonical: settings?.url,
    },
    openGraph: {
      siteName: settings?.title,
      type: "website",
      images: [{ url: "/img/opengraph.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      title: settings?.title || "Blog",
      card: "summary_large_image" as const,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export async function generateMetadata() {
  return await sharedMetaData();
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <AdSenseScript />
      <OneSignalInit />
      <WebPushrInit />
      <WebSiteSchema settings={settings} />
      <OrganizationSchema settings={settings} />
      <Navbar {...settings} />
      <div>{children}</div>
      <Footer {...settings} />
    </>
  );
}

export const revalidate = 3600;
