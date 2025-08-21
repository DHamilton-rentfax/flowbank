
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
 ,
  images: {
    domains: ['placehold.co'], // ✅ Allow external image domain
    remotePatterns: [{
 protocol: 'https',
 hostname: 'placehold.co'
 }, { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }, { protocol: 'https', hostname: 'storage.googleapis.com' }],
 },
  async headers() {
 return [
 {
 source: "/:path*",
 headers: [
 {
 key: "Content-Security-Policy",
 value: "default-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseio.com https://www.gstatic.com https://www.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.recaptcha.net https://www.gstatic.com https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com; frame-src 'self' https://*.firebaseio.com https://*.auth.firebaseui.com https://js.stripe.com https://fireship.stripe.network https://www.recaptcha.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.gstatic.com https://*.firebaseio.com https://firebasestorage.googleapis.com https://www.google-analytics.com https://q.stripe.com https://r.stripe.com; connect-src 'self' https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.recaptcha.net https://www.gstatic.com https://firestore.googleapis.com https://*.algolia.net https://*.algolianet.com https://stripe.com https://api.stripe.com https://gc.stripe.com https://cognito-identity.us-east-1.amazonaws.com https://firebaseinstallations.googleapis.com https://fcmregistrations.googleapis.com https://*.cloudfunctions.net YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net https://*.firebaseapp.com YOUR_PROJECT_ID.firebaseapp.com https://www.google-analytics.com; object-src 'none'; base-uri 'none'; form-action 'self'; upgrade-insecure-requests;"
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

    