// This file configures route segment config for the API routes
// See: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config

// Mark all API routes as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';

// Disable static generation
export const generateStaticParams = false;

// Disable static rendering
export const revalidate = 0;

// Disable caching
export const fetchCache = 'force-no-store';

// Disable static optimization
export const dynamicParams = true;
