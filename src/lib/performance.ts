/**
 * Performance monitoring utilities
 */

// Check if window and performance API are available
const isPerformanceSupported = () =>
  typeof window !== 'undefined' &&
  typeof window.performance !== 'undefined' &&
  typeof window.performance.mark === 'function' &&
  typeof window.performance.measure === 'function';

/**
 * Mark the start of a performance measurement
 * @param markName Name of the performance mark
 */
export const startMeasure = (markName: string): void => {
  if (!isPerformanceSupported()) return;

  try {
    performance.mark(`${markName}-start`);
  } catch (error) {
    console.error(`Error creating performance mark ${markName}-start:`, error);
  }
};

/**
 * End a performance measurement and log the result
 * @param markName Name of the performance mark
 * @param logToConsole Whether to log the result to console
 * @returns The duration of the measurement in milliseconds
 */
export const endMeasure = (markName: string, logToConsole = false): number | undefined => {
  if (!isPerformanceSupported()) return;

  try {
    performance.mark(`${markName}-end`);
    performance.measure(markName, `${markName}-start`, `${markName}-end`);

    const entries = performance.getEntriesByName(markName);
    const duration = entries[0]?.duration;

    if (logToConsole && duration) {
      console.log(`⏱️ ${markName}: ${duration.toFixed(2)}ms`);
    }

    // Clean up marks and measures
    performance.clearMarks(`${markName}-start`);
    performance.clearMarks(`${markName}-end`);
    performance.clearMeasures(markName);

    return duration;
  } catch (error) {
    console.error(`Error measuring performance for ${markName}:`, error);
    return undefined;
  }
};

/**
 * Track a custom performance metric and send it to the analytics endpoint
 * @param metricName Name of the metric
 * @param value Value of the metric
 * @param tags Additional tags for the metric
 */
export const trackMetric = async (
  metricName: string,
  value: number,
  tags: Record<string, string> = {}
): Promise<void> => {
  try {
    await fetch('/api/analytics/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metricName,
        value,
        tags,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.error(`Error tracking metric ${metricName}:`, error);
  }
};

/**
 * Track page load performance metrics
 */
export const trackPageLoadMetrics = (): void => {
  if (!isPerformanceSupported()) return;

  try {
    // Wait for the page to be fully loaded
    if (document.readyState === 'complete') {
      capturePageLoadMetrics();
    } else {
      window.addEventListener('load', capturePageLoadMetrics);
    }
  } catch (error) {
    console.error('Error setting up page load metrics tracking:', error);
  }
};

/**
 * Capture and send page load performance metrics
 */
const capturePageLoadMetrics = (): void => {
  try {
    // Use the Performance API to get timing metrics
    const perfEntries = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (!perfEntries) return;

    // Calculate key metrics
    // PerformanceNavigationTiming doesn't have navigationStart, use startTime instead
    const pageLoadTime = perfEntries.loadEventEnd - perfEntries.startTime;
    const ttfb = perfEntries.responseStart - perfEntries.requestStart;
    const domContentLoaded = perfEntries.domContentLoadedEventEnd - perfEntries.startTime;
    const firstPaint = getFirstPaint();

    // Track metrics
    trackMetric('page_load_time', pageLoadTime);
    trackMetric('ttfb', ttfb);
    trackMetric('dom_content_loaded', domContentLoaded);

    if (firstPaint) {
      trackMetric('first_paint', firstPaint);
    }

    // Track current page
    const currentPage = window.location.pathname;
    trackMetric('page_view', 1, { page: currentPage });
  } catch (error) {
    console.error('Error capturing page load metrics:', error);
  }
};

/**
 * Get the first paint time
 * @returns The first paint time in milliseconds
 */
const getFirstPaint = (): number | undefined => {
  const paintEntries = performance.getEntriesByType('paint');
  const firstPaintEntry = paintEntries.find(entry => entry.name === 'first-paint');
  return firstPaintEntry?.startTime;
};

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = (): void => {
  if (typeof window === 'undefined') return;

  // Track page load metrics
  trackPageLoadMetrics();

  // Track client-side navigation performance
  if (typeof window.history !== 'undefined') {
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      // Call the original function
      const result = originalPushState.apply(this, args);

      // Track the navigation
      trackPageLoadMetrics();

      return result;
    };
  }
};
