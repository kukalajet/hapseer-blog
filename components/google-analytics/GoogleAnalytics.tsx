"use client";

import Script from "next/script";

const GoogleAnalytics = () => {
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;

  if (!googleAnalyticsId) {
    return null;
  }

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAnalyticsId}');
        `}
      </Script>
    </>
  );
};

export { GoogleAnalytics };
