'use client'

import Head from 'next/head'
import { usePathname } from 'next/navigation'
import { Suspense } from 'react'

interface MetaTagsProps {
  title?: string
  description?: string
  image?: string
  type?: string
  twitterCard?: string
  canonicalUrl?: string
}

/**
 * Enhanced SEO component for Aura Personality Test
 * Provides comprehensive meta tags for better SEO and social sharing
 */
function MetaTagsInner({
  title = 'Aura Personality Test',
  description = 'Discover your personality through AI-powered assessment and visualize your unique aura.',
  image = '/images/aura-social-share.jpg', // Default social sharing image
  type = 'website',
  twitterCard = 'summary_large_image',
  canonicalUrl,
}: MetaTagsProps) {
  const pathname = usePathname()

  // Construct the full URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aura-edm1922.vercel.app'
  const currentUrl = canonicalUrl || `${baseUrl}${pathname}`

  // Construct the full image URL if it's a relative path
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`

  // Construct the full title with site name
  const fullTitle = `${title} | Aura Personality Test`

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Aura Personality Test" />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />

      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="theme-color" content="#EAE6F8" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
    </Head>
  )
}

// Wrapper component with Suspense boundary
export default function MetaTags(props: MetaTagsProps) {
  return (
    <Suspense fallback={null}>
      <MetaTagsInner {...props} />
    </Suspense>
  )
}
