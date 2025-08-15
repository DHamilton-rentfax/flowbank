
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin')) {
    // This is a basic check. For production, you'd use a more robust session management.
    // This assumes you set a 'role' cookie on login for admin users.
    const role = req.cookies.get('role')?.value;
    const hasSession = req.cookies.has('__session'); // Example session cookie name

    if (!hasSession) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (role !== 'admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/'; // Redirect to home if not admin
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
