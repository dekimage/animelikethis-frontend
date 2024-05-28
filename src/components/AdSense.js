import Script from "next/script";

export const AdSense = ({ pid }) => {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${pid}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};
