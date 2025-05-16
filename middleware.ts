import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware ensures all API routes are treated as dynamic
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For API routes, ensure they're treated as dynamic
  if (pathname.startsWith('/api/')) {
    // Create a response with appropriate headers
    const response = NextResponse.next();

    // Add headers to prevent caching and ensure dynamic behavior
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Middleware-Cache', 'no-cache');

    return response;
  }

  // For all other routes, just continue normal processing
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match all pages that need dynamic behavior
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
