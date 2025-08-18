
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes are protected and require authentication
const PROTECTED_ROUTES = [
    '/dashboard',
    '/rules',
    '/onboarding',
    '/invite',
    '/dashboard/team',
    '/dashboard/team/audit-log'
];

// Define which routes are only for admins
const ADMIN_ROUTES = [
    '/admin',
    '/admin/audit-log',
    '/admin/blog',
    '/admin/checkout-test',
    '/admin/enterprise-onboard',
    '/admin/letters',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // In a real production app, you would verify a session cookie here that's set upon login.
  // For this prototype, we'll assume this cookie (`__session`) is managed by a server-side auth helper.
  // The client-side Firebase SDK manages state, but middleware runs on the server edge.
  const sessionToken = req.cookies.get('__session')?.value;
  
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  // If trying to access a protected or admin route without a session, redirect to login
  if (!sessionToken && (isProtectedRoute || isAdminRoute)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname); // Pass the original path to redirect back after login
    return NextResponse.redirect(url);
  }
  
  // NOTE: A full implementation would decode the sessionToken to check for an admin role.
  // For now, we'll keep this simple and focus on the authentication check.

  return NextResponse.next();
}

// Apply the middleware to all protected and admin routes
export const config = { 
  matcher: [
    '/dashboard/:path*',
    '/rules/:path*',
    '/onboarding/:path*',
    '/invite/:path*',
    '/admin/:path*',
  ] 
};
