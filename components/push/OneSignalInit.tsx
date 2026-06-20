"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function OneSignalInit() {
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!appId) return null;

  return (
    <>
      <Script
        id="onesignal-sdk"
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="lazyOnload"
        defer
      />
      <Script
        id="onesignal-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function(OneSignal) {
              await OneSignal.init({
                appId: "${appId}",
                notifyButton: { enable: false }, // using custom NotificationBell instead
                promptOptions: {
                  slidedown: {
                    prompts: [{
                      type: "push",
                      autoPrompt: true,
                      delay: { timeDelay: 30 }
                    }]
                  }
                }
              });
            });
          `,
        }}
      />
    </>
  );
}
