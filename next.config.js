/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  experimental: {
    // OK to keep on Next 15; remove if you're on 14.
    // Add your Cloud Workstations origins if you want to silence the warning proactively.
    // allowedDevOrigins: [
    //   'https://3000-firebase-flow-bank-app-1754572016440.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev',
    //   'https://6000-firebase-flow-bank-app-1754572016440.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev',
    //   'http://localhost:3000',
    //   'http://127.0.0.1:3000',
    // ],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'api.qrserver.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },   // <-- required
      // Uncomment if you actually load from these:
      // { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/**' },
      // { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      // { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
