
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('__session')?.value;

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/pricing', '/faq', '/blog', '/', '/terms', '/privacy'];

  // Define admin routes
  const adminRoutes = ['/admin'];

  const isPublicRoute = publicRoutes.some(route => pathname === route || (route.length > 1 && pathname.startsWith(route + '/')));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    // If user is logged in and trying to access login/signup, redirect to dashboard
    if (sessionCookie && (pathname === '/login' || pathname === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // For all other routes, they are protected
  if (!sessionCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  try {
    // We need a server-side way to verify the cookie.
    // This requires a call to an API route or using the Admin SDK if available in middleware.
    // For this example, we'll assume the cookie's presence implies a valid session for route access,
    // and rely on client-side checks for fine-grained access control.
    // A more secure implementation would verify the cookie here.

    // If it's an admin route, we should ideally verify the admin role here.
    // This would require a call to an API that can decode the session cookie and check claims.
    if (isAdminRoute) {
        // Placeholder for admin check. In a real app, verify the user's role.
        // For now, we'll allow access if they have a session cookie.
    }
    
    return NextResponse.next();

  } catch (error) {
    // Session cookie is invalid or expired.
    console.error('Middleware auth error:', error);
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    
    const response = NextResponse.redirect(url);
    response.cookies.delete('__session');
    return response;
  }
}

// Apply the middleware to all routes except for static assets and API routes.
export const config = { 
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons).*)'
  ],
};
