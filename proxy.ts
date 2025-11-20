import { auth } from '@/lib/auth-config';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register', '/terms', '/privacy'];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Define auth paths
  const authPaths = ['/login', '/register'];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // If user is logged in and trying to access auth pages, redirect to portal
  if (isLoggedIn && isAuthPath) {
    return NextResponse.redirect(new URL('/portal', req.url));
  }

  // If user is not logged in and trying to access protected routes
  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
