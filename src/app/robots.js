export default function robots() {
  const baseUrl = "https://animelikethis.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
