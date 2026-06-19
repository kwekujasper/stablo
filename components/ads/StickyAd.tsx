"use client";

import { useEffect, useRef, useState } from "react";
import AdUnit from "./AdUnit";

interface StickyAdProps {
  slot: string;
}

// Sticky sidebar ad — only shown on md+ screens; uses IntersectionObserver
// to defer initialisation until the container is visible (saves ad impressions).
export default function StickyAd({ slot }: StickyAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="hidden md:block"
      style={{ position: "sticky", top: 80, minHeight: 600 }}>
      {visible && (
        <AdUnit
          slot={slot}
          format="vertical"
          style={{ display: "block", minWidth: 160, minHeight: 600 }}
        />
      )}
    </div>
  );
}
