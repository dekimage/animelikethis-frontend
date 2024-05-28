module.exports = {
  siteUrl: "https://animelikethis.com", // Replace with your domain
  generateRobotsTxt: true, // (optional)
  sitemapSize: 5000,
  changefreq: "daily",
  priority: 0.7,
  transform: async (config, path) => {
    // Example transformation, you can customize it
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
