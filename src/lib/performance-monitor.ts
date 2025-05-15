/**
 * Performance monitoring utilities for tracking and reporting performance issues
 */

// Track slow operations
interface PerformanceEntry {
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Keep a local cache of performance entries to avoid excessive API calls
const performanceEntries: PerformanceEntry[] = [];
const MAX_CACHED_ENTRIES = 20;
const SLOW_THRESHOLD_MS = 1000; // 1 second is considered slow

// Flag to prevent sending too many reports
let isReportingInProgress = false;

/**
 * Track the performance of an operation
 * @param operation Name of the operation being tracked
 * @param metadata Additional context about the operation
 * @returns A function to call when the operation is complete
 */
export function trackPerformance(operation: string, metadata?: Record<string, any>) {
  const startTime = performance.now();
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Only track operations that exceed the threshold
      if (duration > SLOW_THRESHOLD_MS) {
        recordPerformanceEntry(operation, duration, metadata);
      }
      
      return duration;
    }
  };
}

/**
 * Record a performance entry and potentially report it
 */
function recordPerformanceEntry(operation: string, duration: number, metadata?: Record<string, any>) {
  const entry: PerformanceEntry = {
    operation,
    duration,
    timestamp: Date.now(),
    metadata
  };
  
  // Add to local cache
  performanceEntries.push(entry);
  
  // Trim cache if it gets too large
  if (performanceEntries.length > MAX_CACHED_ENTRIES) {
    performanceEntries.shift();
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    if (metadata) {
      console.warn('Context:', metadata);
    }
  }
  
  // Report to server if we have enough entries and not already reporting
  if (performanceEntries.length >= 5 && !isReportingInProgress) {
    reportPerformanceEntries();
  }
}

/**
 * Send performance entries to the server
 */
async function reportPerformanceEntries() {
  if (isReportingInProgress || performanceEntries.length === 0) return;
  
  try {
    isReportingInProgress = true;
    
    // Clone the entries we're about to send
    const entriesToSend = [...performanceEntries];
    
    // Clear the local cache
    performanceEntries.length = 0;
    
    // Only send in client
    if (typeof window !== 'undefined') {
      // Send entries to server with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Performance reporting timeout')), 3000);
      });
      
      const fetchPromise = fetch('/api/analytics/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'performance_entries',
          value: entriesToSend.length,
          tags: {
            entries: JSON.stringify(entriesToSend)
          },
          timestamp: Date.now()
        }),
      });
      
      await Promise.race([fetchPromise, timeoutPromise]);
    }
  } catch (error) {
    console.error('Failed to report performance entries:', error);
  } finally {
    isReportingInProgress = false;
  }
}

/**
 * Wrap a function with performance tracking
 * @param fn Function to wrap
 * @param operationName Name of the operation
 * @param metadata Additional context
 * @returns Wrapped function
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string,
  metadata?: Record<string, any>
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const tracker = trackPerformance(operationName, metadata);
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result instanceof Promise) {
        return result
          .then(value => {
            tracker.end();
            return value;
          })
          .catch(error => {
            tracker.end();
            throw error;
          }) as ReturnType<T>;
      }
      
      tracker.end();
      return result;
    } catch (error) {
      tracker.end();
      throw error;
    }
  };
}
