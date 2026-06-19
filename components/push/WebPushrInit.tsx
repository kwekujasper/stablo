"use client";

import Script from "next/script";

export default function WebPushrInit() {
  const key = process.env.NEXT_PUBLIC_WEBPUSHR_KEY;
  if (!key) return null;

  return (
    <Script
      id="webpushr-init"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          !function(e,t,n,s,u,a){
            e[s]=e[s]||function(){(e[s].q=e[s].q||[]).push(arguments)};
            a=t.createElement(n);
            u=t.getElementsByTagName(n)[0];
            a.async=1;
            a.src="https://cdn.webpushr.com/sw-server.min.js";
            u.parentNode.insertBefore(a,u)
          }(window,document,'script','webpushr');
          webpushr('setup',{'key':'${key}'});
        `,
      }}
    />
  );
}
