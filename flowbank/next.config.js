
/** @type {import('next').NextConfig} */

const csp = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://www.gstatic.com https://www.recaptcha.net https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com;
  connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://apis.google.com https://www.recaptcha.net https://www.gstatic.com https://js.stripe.com https://api.stripe.com https://us-central1-flowbank-ai.cloudfunctions.net;
  img-src 'self' data: blob: https: *.googleusercontent.com https://www.google-analytics.com https://placehold.co;
  frame-src 'self' https://accounts.google.com https://js.stripe.com https://pay.google.com;
  style-src 'self' 'unsafe-inline';
  font-src 'self' data: https://fonts.gstatic.com;
`.replace(/\s{2,}/g, ' ').trim();


const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['placehold.co'], 
    remotePatterns: [
        { protocol: 'https', hostname: 'placehold.co' },
        { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
        { protocol: 'https', hostname: 'storage.googleapis.com' }
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), microphone=()"
          }
        ]
      },
    ];
  },
};

module.exports = nextConfig;
