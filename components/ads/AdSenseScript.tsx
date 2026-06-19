"use client";

import Script from "next/script";

// Loaded once in the root layout. Enables Auto Ads globally.
export default function AdSenseScript() {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;
  if (!pubId) return null;

  return (
    <Script
      id="adsense-init"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pubId}`}
      crossOrigin="anonymous"
    />
  );
}
