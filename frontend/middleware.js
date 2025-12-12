import { NextResponse } from 'next/server';

export function middleware(request) {
  // This is a placeholder - Next.js middleware runs on the edge
  // For client-side auth checks, we handle it in the components
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/schedule/:path*',
    '/appointments/:path*',
    '/care-team/:path*',
    '/events/:path*',
  ],
};

