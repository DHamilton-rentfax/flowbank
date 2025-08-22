
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Optional: avoid flaky FS cache warnings in dev
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid filesystem cache in flaky dev environments
      config.cache = { type: 'memory' };
    }
    return config;
  },
  reactStrictMode: true,

  // If you use external images like placehold.co or Unsplash:
  images: {
    domains: ['placehold.co', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;
