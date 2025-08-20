
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const sessionCookie = req.cookies.get('__session')?.value;

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/pricing', '/faq', '/blog', '/', '/terms', '/privacy', '/contact'];

  // Define admin routes
  const adminRoutes = ['/admin'];

  const isPublicRoute = publicRoutes.some(route => pathname === route || (route.length > 1 && pathname.startsWith(route + '/')));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  // Allow access to API routes, static files, and images without authentication
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('favicon.ico')) {
      return NextResponse.next();
  }
  
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
    // Persist the original path and query params as 'next'
    url.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  try {
    // In a real production app, you would have an API endpoint to verify the session cookie.
    // For this prototype, we'll assume a present cookie is a valid one for route protection.
    // The client-side `useAuth` hook will handle state changes if the cookie is actually invalid.
    
    return NextResponse.next();

  } catch (error) {
    // This catch block would be more relevant if we were verifying the cookie server-side.
    console.error('Middleware auth error:', error);
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', `${pathname}${search}`);
    
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
