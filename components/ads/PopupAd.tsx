"use client";

import { useEffect, useState, useCallback } from "react";
import AdUnit from "./AdUnit";

interface PopupAdProps {
  slot: string;
  scrollDepth?: number;  // % of page scroll to trigger (default 70)
  delayMs?: number;      // ms delay fallback trigger (default 30000)
  cooldownHours?: number; // hours before showing again (default 24)
}

// Full-page interstitial popup ad.
// Triggered by whichever comes first: scroll depth OR time delay.
// Respects Google policy: close button is always immediately visible.
// 24-hour localStorage cooldown prevents repeat annoyance.
export default function PopupAd({
  slot,
  scrollDepth = 70,
  delayMs = 30_000,
  cooldownHours = 24,
}: PopupAdProps) {
  const [open, setOpen] = useState(false);

  const tryShow = useCallback(() => {
    const lastShown = localStorage.getItem("popup_ad_last");
    if (lastShown) {
      const elapsed = Date.now() - parseInt(lastShown, 10);
      if (elapsed < cooldownHours * 60 * 60 * 1000) return;
    }
    setOpen(true);
    localStorage.setItem("popup_ad_last", String(Date.now()));
  }, [cooldownHours]);

  useEffect(() => {
    let triggered = false;

    const handleScroll = () => {
      if (triggered) return;
      const scrolled =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100;
      if (scrolled >= scrollDepth) {
        triggered = true;
        tryShow();
        window.removeEventListener("scroll", handleScroll);
      }
    };

    const timer = setTimeout(() => {
      if (!triggered) {
        triggered = true;
        tryShow();
        window.removeEventListener("scroll", handleScroll);
      }
    }, delayMs);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [tryShow, scrollDepth, delayMs]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Advertisement">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        {/* Close button always visible per Google policy */}
        <button
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          aria-label="Close advertisement">
          ✕
        </button>
        <p className="mb-3 text-xs uppercase tracking-wide text-gray-400">
          Advertisement
        </p>
        <div style={{ minHeight: 250 }}>
          <AdUnit
            slot={slot}
            format="rectangle"
            style={{ display: "block", minHeight: 250 }}
          />
        </div>
      </div>
    </div>
  );
}
