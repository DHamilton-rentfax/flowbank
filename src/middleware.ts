
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
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // NOTE: Firebase Auth tokens are typically sent in the Authorization header for server-side
  // validation or managed client-side. A simple session cookie check is a common pattern for middleware.
  // In a real app with server-side rendering and Firebase, you might use a custom session cookie
  // that is verified here. For this prototype, we check for a hypothetical cookie `fb-token`.
  // In a client-rendered app, route protection is often handled in a layout component.
  // This middleware provides server-level protection.
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

  // If trying to access an admin route with a session but without an admin role, redirect to dashboard
  if (sessionToken && isAdminRoute) {
    // In a real app, the role would be decoded from the session token.
    // Here we simulate it with a cookie for simplicity.
    const userRole = req.cookies.get('role')?.value;
    if (userRole !== 'admin') {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard'; 
        return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Apply the middleware to the specified routes
export const config = { 
  matcher: [
    '/dashboard/:path*',
    '/rules/:path*',
    '/onboarding/:path*',
    '/invite/:path*',
    '/admin/:path*',
  ] 
};
