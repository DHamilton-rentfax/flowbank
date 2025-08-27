/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const allowedFromEnv = (process.env.CLOUD_WORKSTATION_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Add every origin that loads your dev app/assets (/_next/*).
    // Put your exact Workstations origins here. Example values below:
    allowedDevOrigins: [
      'https://3000-firebase-flow-bank-app-1754572016440.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev',
      'https://6000-firebase-flow-bank-app-1754572016440.cluster-joak5ukfbnbyqspg4tewa33d24.cloudworkstations.dev',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      ...allowedFromEnv, // optional: supply additional origins via env
    ],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'api.qrserver.com', pathname: '/**' },
      // add others you actually use (e.g., Firebase Storage):
      // { protocol: 'https', hostname: 'firebasestorage.googleapis.com', pathname: '/**' },
    ],
  },
  // Optional while debugging duplicated effects / noisy network in dev:
  // reactStrictMode: false,
};

module.exports = withBundleAnalyzer(nextConfig);
