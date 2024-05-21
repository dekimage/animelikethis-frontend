/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "localhost",
      "media.discordapp.net",
      "assets.openai.com",
      "cdn.midjourney.com",
      "images.unsplash.com",
      "firebasestorage.googleapis.com",
      "static0.gamerantimages.com",
      "cdn.myanimelist.net",
    ],
  },
};

module.exports = nextConfig;
