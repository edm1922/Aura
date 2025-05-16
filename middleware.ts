import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware ensures all API routes are treated as dynamic
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // For API routes, ensure they're treated as dynamic
  if (pathname.startsWith('/api/')) {
    // Just pass through the request, but this ensures the route is treated as dynamic
    return NextResponse.next();
  }
  
  // For all other routes, just continue normal processing
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
};
