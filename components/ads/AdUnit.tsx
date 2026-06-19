"use client";

import { useEffect, useRef } from "react";

interface AdUnitProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Generic manual ad unit. Initialised once per mount via adsbygoogle.push.
export default function AdUnit({
  slot,
  format = "auto",
  responsive = true,
  className = "",
  style,
}: AdUnitProps) {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!pubId || pushed.current) return;
    try {
      // @ts-expect-error adsbygoogle is injected by the AdSense script
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not ready yet — ignore
    }
  }, [pubId]);

  if (!pubId) return null;

  return (
    <div className={`ad-unit overflow-hidden ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...(style ?? {}) }}
        data-ad-client={pubId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
