"use client";

import AdUnit from "./AdUnit";

interface InArticleAdProps {
  slot: string;
}

// Placed between paragraphs inside post body.
// CSS min-height reserves space to prevent CLS.
export default function InArticleAd({ slot }: InArticleAdProps) {
  return (
    <div className="my-6" style={{ minHeight: 280 }}>
      <AdUnit
        slot={slot}
        format="auto"
        responsive
        style={{ display: "block", textAlign: "center" }}
      />
    </div>
  );
}
