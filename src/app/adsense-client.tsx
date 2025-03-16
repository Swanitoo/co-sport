"use client";

import Script from "next/script";

export function GoogleAdsenseScript() {
  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9578850534114306"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

export function AdPlaceholder() {
  return (
    <div className="my-6 flex justify-center">
      <div className="h-[90px] w-full max-w-[728px] overflow-hidden rounded-md bg-slate-100 text-center dark:bg-slate-800">
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "90px" }}
          data-ad-client="ca-pub-9578850534114306"
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (adsbygoogle = window.adsbygoogle || []).push({});
            `,
          }}
        />
      </div>
    </div>
  );
}
