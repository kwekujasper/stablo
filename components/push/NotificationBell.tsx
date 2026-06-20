"use client";

import { useEffect, useState } from "react";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

export default function NotificationBell() {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(false);

  const hasOneSignal = !!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  const hasWebPushr = !!process.env.NEXT_PUBLIC_WEBPUSHR_KEY;

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);

    // Show bell after 8 seconds if not already subscribed
    const timer = setTimeout(() => {
      if (Notification.permission !== "granted") {
        setVisible(true);
        setPulse(true);
        setTimeout(() => setPulse(false), 3000);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  async function handleSubscribe() {
    if (permission === "denied" || permission === "unsupported") return;

    try {
      if (hasOneSignal && typeof window !== "undefined" && (window as any).OneSignal) {
        await (window as any).OneSignal.User.PushSubscription.optIn();
        setPermission("granted");
        return;
      }

      // Fallback: native Notification API to trigger browser prompt
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      // If WebPushr is loaded, register subscription
      if (result === "granted" && hasWebPushr && (window as any).webpushr) {
        (window as any).webpushr("subscribe", {});
      }
    } catch {
      // Permission prompt dismissed or blocked
    }
  }

  // Don't render if push isn't configured or permission already denied
  if (!hasOneSignal && !hasWebPushr) return null;
  if (permission === "unsupported" || permission === "denied") return null;
  if (!visible && permission !== "granted") return null;

  const subscribed = permission === "granted";

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Tooltip shown when pulsing */}
      {pulse && !subscribed && (
        <div className="animate-fade-in rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg dark:bg-gray-700">
          Get notified of new articles
          <div className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-700" />
        </div>
      )}

      <button
        onClick={subscribed ? () => setVisible(false) : handleSubscribe}
        title={subscribed ? "Notifications enabled" : "Enable push notifications"}
        aria-label={subscribed ? "Notifications enabled" : "Enable push notifications"}
        className={[
          "relative flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          subscribed
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
        ].join(" ")}>
        {/* Pulse ring when drawing attention */}
        {pulse && !subscribed && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40" />
        )}

        {subscribed ? (
          /* Bell with check */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5">
            <path d="M5.85 3.5a.75.75 0 00-1.117-1 9.719 9.719 0 00-2.348 4.876.75.75 0 001.479.248A8.219 8.219 0 015.85 3.5zM19.267 2.5a.75.75 0 10-1.118 1 8.22 8.22 0 011.987 4.124.75.75 0 001.48-.248A9.72 9.72 0 0019.266 2.5z" />
            <path
              fillRule="evenodd"
              d="M12 2.25A6.75 6.75 0 005.25 9v.75a8.217 8.217 0 01-2.119 5.52.75.75 0 00.298 1.206c1.544.57 3.16.99 4.831 1.243a3.75 3.75 0 107.48 0 24.583 24.583 0 004.83-1.244.75.75 0 00.298-1.205 8.217 8.217 0 01-2.118-5.52V9A6.75 6.75 0 0012 2.25zM9.75 18c0-.034 0-.067.002-.1a25.05 25.05 0 004.496 0l.002.1a2.25 2.25 0 11-4.5 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          /* Bell without slash */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
