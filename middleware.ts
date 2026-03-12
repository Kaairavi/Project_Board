import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  // Define protected routes and their required roles
  const protectedRoutes = {
    '/admin': 'Admin',
    '/manager': 'Manager',
    '/team_member': 'Team_Member',
  };

  // Check if the current path is a protected route (or a subpath)
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    if (!sessionCookie) {
      // Redirect to login if no session exists for protected routes
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    try {
      const session = JSON.parse(sessionCookie.value);
      const requiredRole = protectedRoutes[matchedRoute as keyof typeof protectedRoutes];

      if (session.role !== requiredRole) {
        // Redirect if user role doesn't match the required role for the path
        if (session.role === 'Admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else if (session.role === 'Manager') {
          return NextResponse.redirect(new URL('/manager/dashboard', request.url));
        } else if (session.role === 'Team_Member') {
          return NextResponse.redirect(new URL('/team_member/dashboard', request.url));
        }
        
        return NextResponse.redirect(new URL('/auth', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // Handle root and auth page redirects
  if (pathname === '/' || pathname === '/auth') {
    if (sessionCookie) {
      try {
        const session = JSON.parse(sessionCookie.value);
        if (session.role === 'Admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        } else if (session.role === 'Manager') {
          return NextResponse.redirect(new URL('/manager/dashboard', request.url));
        } else if (session.role === 'Team_Member') {
          return NextResponse.redirect(new URL('/team_member/dashboard', request.url));
        }
      } catch (error) {
        // parsing error fixes itself on next redirect to auth
      }
    } else if (pathname === '/') {
      // If at root and not logged in, go to auth
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  return NextResponse.next();
}

// Config for the middleware to match only relevant paths
export const config = {
  matcher: [
    '/admin/:path*',
    '/manager/:path*',
    '/team_member/:path*',
    '/auth',
    '/',
  ],
};
