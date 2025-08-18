
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = [
    '/dashboard',
    '/rules',
    '/onboarding',
    '/invite',
];

const ADMIN_ROUTES = [
    '/admin',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get('__session')?.value; // Example session cookie name
  const userRole = req.cookies.get('role')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));

  if (!sessionToken && (isProtectedRoute || isAdminRoute)) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (sessionToken && isAdminRoute && userRole !== 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard'; // Redirect non-admins away from admin routes
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { 
  matcher: [
    '/dashboard/:path*',
    '/rules/:path*',
    '/onboarding/:path*',
    '/invite/:path*',
    '/admin/:path*',
  ] 
};
