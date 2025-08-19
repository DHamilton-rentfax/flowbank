
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminAuth } from './firebase/server';

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
    '/admin/analytics',
    '/admin/audit-log',
    '/admin/blog',
    '/admin/checkout-test',
    '/admin/enterprise-onboard',
    '/admin/letters',
    '/admin/ai-campaign',
    '/admin/cron-config',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('__session')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  if (!isProtectedRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  if (!sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  try {
    const decodedToken = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    
    // Example of admin role check. Assumes a 'role' custom claim is set on the user.
    if (isAdminRoute && decodedToken.role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard'; // Redirect non-admins away from admin routes
      return NextResponse.redirect(url);
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-decoded-token', JSON.stringify(decodedToken));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    // Session cookie is invalid or expired.
    console.error('Middleware auth error:', error);
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    
    // Clear the invalid cookie
    const response = NextResponse.redirect(url);
    response.cookies.delete('__session');
    return response;
  }
}

// Apply the middleware to all relevant routes
export const config = { 
  matcher: [
    '/dashboard/:path*',
    '/rules/:path*',
    '/onboarding/:path*',
    '/invite/:path*',
    '/admin/:path*',
  ],
  runtime: 'nodejs', // Force Node.js runtime to avoid Edge Runtime conflicts
};
