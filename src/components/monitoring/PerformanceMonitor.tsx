'use client'

import { useEffect, useRef } from 'react'
import { initErrorTracking } from '@/lib/error-tracking'

/**
 * Performance monitoring component that tracks various performance metrics
 * and reports them to the server.
 */
export default function PerformanceMonitor() {
  const isInitialized = useRef(false)

  useEffect(() => {
    // Only initialize once
    if (isInitialized.current) return
    isInitialized.current = true

    // Initialize error tracking
    initErrorTracking()

    // Track page load performance
    trackPageLoadPerformance()

    // Track long tasks
    observeLongTasks()

    // Track memory usage periodically
    const memoryInterval = setInterval(trackMemoryUsage, 30000) // Every 30 seconds

    // Track client-side navigation performance
    trackNavigationPerformance()

    return () => {
      clearInterval(memoryInterval)
    }
  }, [])

  // Track page load performance metrics
  const trackPageLoadPerformance = () => {
    if (typeof window === 'undefined' || !window.performance) return

    // Wait for the page to fully load
    window.addEventListener('load', () => {
      setTimeout(() => {
        try {
          const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          if (!perfEntries) return

          const metrics = {
            // DNS lookup time
            dns: perfEntries.domainLookupEnd - perfEntries.domainLookupStart,
            // TCP connection time
            tcp: perfEntries.connectEnd - perfEntries.connectStart,
            // Time to first byte
            ttfb: perfEntries.responseStart - perfEntries.requestStart,
            // DOM processing time
            domProcessing: perfEntries.domComplete - perfEntries.responseEnd,
            // Total page load time
            pageLoad: perfEntries.loadEventEnd - perfEntries.startTime,
          }

          // Report metrics to server
          reportPerformanceMetric('page_load', metrics.pageLoad, {
            dns: metrics.dns,
            tcp: metrics.tcp,
            ttfb: metrics.ttfb,
            domProcessing: metrics.domProcessing,
            url: window.location.pathname,
          })

          // Log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('Page Load Performance:', metrics)
          }
        } catch (error) {
          console.error('Error tracking page load performance:', error)
        }
      }, 0)
    })
  }

  // Track long tasks that might cause UI jank
  const observeLongTasks = () => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return

    try {
      // Create a performance observer to monitor long tasks
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          // Report long tasks (tasks that block the main thread for more than 50ms)
          if (entry.duration > 50) {
            reportPerformanceMetric('long_task', entry.duration, {
              url: window.location.pathname,
            })

            // Log in development
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`)
            }
          }
        })
      })

      // Start observing long tasks
      observer.observe({ entryTypes: ['longtask'] })
    } catch (error) {
      console.error('Error setting up long task observer:', error)
    }
  }

  // Define the Chrome Performance interface extension
  interface ChromePerformance extends Performance {
    memory?: {
      totalJSHeapSize: number;
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }

  // Track memory usage
  const trackMemoryUsage = () => {
    if (typeof window === 'undefined') return

    // Cast performance to ChromePerformance
    const chromePerformance = performance as ChromePerformance
    if (!chromePerformance.memory) return

    try {
      const memory = chromePerformance.memory

      if (memory) {
        const memoryUsage = {
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        }

        // Report if memory usage is high (over 80% of limit)
        if (memoryUsage.usedJSHeapSize > 0.8 * memoryUsage.jsHeapSizeLimit) {
          reportPerformanceMetric('high_memory_usage', memoryUsage.usedJSHeapSize, {
            totalHeap: memoryUsage.totalJSHeapSize,
            heapLimit: memoryUsage.jsHeapSizeLimit,
            url: window.location.pathname,
          })

          // Log in development
          if (process.env.NODE_ENV === 'development') {
            console.warn('High memory usage detected:', memoryUsage)
          }
        }
      }
    } catch (error) {
      // Memory API might not be available in all browsers
      console.error('Error tracking memory usage:', error)
    }
  }

  // Track client-side navigation performance
  const trackNavigationPerformance = () => {
    if (typeof window === 'undefined') return

    // Listen for route changes in Next.js
    const handleRouteChangeStart = () => {
      if (window.performance) {
        window.performance.mark('routeChangeStart')
      }
    }

    const handleRouteChangeComplete = () => {
      if (window.performance) {
        window.performance.mark('routeChangeComplete')
        try {
          window.performance.measure(
            'routeChange',
            'routeChangeStart',
            'routeChangeComplete'
          )

          const measures = window.performance.getEntriesByName('routeChange')
          if (measures.length > 0) {
            const navigationTime = measures[0].duration

            // Report navigation time
            reportPerformanceMetric('navigation_time', navigationTime, {
              url: window.location.pathname,
            })

            // Log in development
            if (process.env.NODE_ENV === 'development') {
              console.log(`Navigation time: ${navigationTime.toFixed(2)}ms`)
            }
          }
        } catch (error) {
          console.error('Error measuring navigation time:', error)
        }
      }
    }

    // Add event listeners for Next.js router events
    document.addEventListener('nextjs:route-change-start', handleRouteChangeStart)
    document.addEventListener('nextjs:route-change-complete', handleRouteChangeComplete)

    return () => {
      document.removeEventListener('nextjs:route-change-start', handleRouteChangeStart)
      document.removeEventListener('nextjs:route-change-complete', handleRouteChangeComplete)
    }
  }

  // Report performance metric to the server
  const reportPerformanceMetric = (name: string, value: number, tags?: Record<string, any>) => {
    try {
      // Only send in production or if explicitly enabled in development
      if (process.env.NODE_ENV !== 'development' || process.env.NEXT_PUBLIC_ENABLE_DEV_METRICS === 'true') {
        fetch('/api/analytics/metrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            value,
            tags,
            timestamp: Date.now(),
          }),
          // Use keepalive to ensure the request completes even if the page is unloading
          keepalive: true,
        }).catch(error => {
          console.error('Error reporting performance metric:', error)
        })
      }
    } catch (error) {
      console.error('Error reporting performance metric:', error)
    }
  }

  // This component doesn't render anything visible
  return null
}
