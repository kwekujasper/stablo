"use client";

import AdUnit from "./AdUnit";

interface LeaderboardAdProps {
  slot: string;
}

// 728×90 responsive banner for header/footer.
export default function LeaderboardAd({ slot }: LeaderboardAdProps) {
  return (
    <div
      className="mx-auto w-full max-w-4xl px-4 py-2"
      style={{ minHeight: 90 }}>
      <AdUnit
        slot={slot}
        format="horizontal"
        responsive
        style={{ display: "block" }}
      />
    </div>
  );
}
