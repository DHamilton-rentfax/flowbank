
/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

function buildCsp() {
  const scriptSrc = [
    "'self'",
    ...(isProd ? [] : ["'unsafe-eval'"]),           // dev-only for HMR
    "https://www.gstatic.com",
    "https://apis.google.com",                      // Required for Google Sign-In
    "https://www.googleapis.com",
    "https://accounts.google.com",                  // GSI flows
    "https://www.recaptcha.net",
 "'unsafe-inline'",
 'https://js.stripe.com',
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
  ].join(' ');

  const connectSrc = [
    "'self'",
    "https://firestore.googleapis.com",
    "https://www.googleapis.com",
    "https://apis.google.com",
    "https://accounts.google.com",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://firebaseinstallations.googleapis.com",
    "https://www.google-analytics.com",
    "https://js.stripe.com",
    "https://api.stripe.com",
    "https://m.stripe.network",
    "https://r.stripe.com",
    "https://www.recaptcha.net",
 'https://www.gstatic.com/recaptcha/',
 '*.firebaseio.com', // Allow realtime database
    "wss://*.firebaseio.com", // Allow realtime database websockets
  ].join(' ');
  
  const frameSrc = [
    "'self'",
    "https://accounts.google.com",
    "https://js.stripe.com",
    "https://hooks.stripe.com",
    "https://checkout.stripe.com",
    "https://www.recaptcha.net",
 'https://www.gstatic.com/recaptcha/',
    "*.firebaseio.com",
  ].join(' ');

  const csp = `
    default-src 'self';
    base-uri 'self';
    object-src 'none';
    form-action 'self' https://checkout.stripe.com;
    script-src ${scriptSrc};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https://*.googleusercontent.com https://firebasestorage.googleapis.com https://storage.googleapis.com https://placehold.co https://q.stripe.com;
    font-src 'self' https://fonts.gstatic.com data:;
    connect-src ${connectSrc};
    frame-src ${frameSrc};
  `.replace(/\s{2,}/g, ' ').trim();

  return csp;
}


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
            value: buildCsp()
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
            value: "accelerometer=(), camera=(), microphone=(), geolocation=(), usb=(), serial=(), hid=(), payment=(), autoplay=(self)"
          }
        ]
      },
    ];
  },
};

module.exports = nextConfig;
