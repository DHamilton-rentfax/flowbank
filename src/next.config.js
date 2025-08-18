/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');


const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
       {
        protocol: 'https',
        hostname: 'api.qrserver.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
   webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: require.resolve('buffer/'),
    };
    
    if (!isServer) {
        config.plugins.push(new NodePolyfillPlugin());
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
