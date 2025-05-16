/**
 * Error tracking utilities for monitoring and reporting errors
 */

// Check if window is available
const isClient = typeof window !== 'undefined';

// Throttling mechanism to prevent too many error reports
let lastErrorTime = 0;
const ERROR_THROTTLE_MS = 1000; // Minimum time between similar errors
const errorCache = new Set<string>(); // Cache to prevent duplicate errors
const MAX_CACHED_ERRORS = 100; // Maximum number of cached error signatures

/**
 * Log an error to the server
 * @param error The error object
 * @param context Additional context for the error
 * @param severity Error severity (default: 'error')
 */
export const logError = async (
  error: Error | string,
  context: Record<string, any> = {},
  severity: 'error' | 'warning' | 'info' = 'error'
): Promise<void> => {
  try {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    // Create an error signature to prevent duplicate reports
    const errorSignature = `${errorMessage}|${JSON.stringify(context)}|${severity}`;

    // Check if this is a duplicate error within the throttle window
    const now = Date.now();
    if (errorCache.has(errorSignature) && now - lastErrorTime < ERROR_THROTTLE_MS) {
      // Skip duplicate errors that happen too frequently
      return;
    }

    // Update throttling state
    lastErrorTime = now;

    // Add to error cache and manage cache size
    errorCache.add(errorSignature);
    if (errorCache.size > MAX_CACHED_ERRORS) {
      // Remove the first item if cache is too large
      errorCache.delete(Array.from(errorCache)[0]);
    }

    const payload = {
      message: errorMessage,
      stack: errorStack,
      context: JSON.stringify(context),
      severity,
      url: isClient ? window.location.href : undefined,
      userAgent: isClient ? navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('Error Tracked:');
      console.error(errorMessage);
      if (errorStack) console.error(errorStack);
      console.log('Context:', context);
      console.log('Severity:', severity);
      console.groupEnd();
    }

    // Send to API endpoint with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Error logging timeout')), 3000);
    });

    const fetchPromise = fetch('/api/error/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // Use keepalive to ensure the request completes even if the page is unloading
      keepalive: true,
    });

    await Promise.race([fetchPromise, timeoutPromise]);
  } catch (loggingError) {
    // Fallback to console if API call fails
    console.error('Failed to log error to server:', loggingError);
    console.error('Original error:', error);
  }
};

/**
 * Initialize global error tracking
 */
export const initErrorTracking = (): void => {
  if (!isClient) return;

  // Prevent multiple initializations
  if ((window as any).__errorTrackingInitialized) return;
  (window as any).__errorTrackingInitialized = true;

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logError(
      event.reason || 'Unhandled Promise Rejection',
      {
        type: 'unhandledrejection',
        url: window.location.href,
        timestamp: new Date().toISOString()
      },
      'error'
    );
  });

  // Track global errors
  window.addEventListener('error', (event) => {
    // Skip errors from extensions or third-party scripts
    if (event.filename && !event.filename.includes(window.location.origin) &&
        !event.filename.includes('localhost') && !event.filename.includes('127.0.0.1')) {
      return;
    }

    logError(
      event.error || event.message,
      {
        type: 'global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: window.location.href,
        timestamp: new Date().toISOString()
      },
      'error'
    );
  });

  // Track React errors
  if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__) {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Call the original console.error
      originalConsoleError.apply(console, args);

      // Check if this is a React error
      const errorString = args.join(' ');
      if (
        errorString.includes('React') ||
        errorString.includes('Warning:') ||
        errorString.includes('Error:')
      ) {
        // Only log actual errors, not warnings in development
        if (process.env.NODE_ENV !== 'development' ||
            (errorString.includes('Error:') && !errorString.includes('Warning:'))) {

          // Log the error
          const error = args[0];
          if (error instanceof Error || typeof error === 'string') {
            logError(error, {
              source: 'react-error',
              url: window.location.href,
              timestamp: new Date().toISOString()
            }, 'error');
          } else {
            logError(errorString, {
              source: 'react-error',
              url: window.location.href,
              timestamp: new Date().toISOString()
            }, 'error');
          }
        }
      }
    };
  }

  // Track network errors
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    try {
      const response = await originalFetch(input, init);

      // Track API errors (4xx and 5xx responses)
      if (!response.ok && (response.status >= 400)) {
        const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
        logError(
          `API Error: ${response.status} ${response.statusText}`,
          {
            type: 'api',
            url,
            status: response.status,
            statusText: response.statusText,
            timestamp: new Date().toISOString()
          },
          response.status >= 500 ? 'error' : 'warning'
        );
      }

      return response;
    } catch (error) {
      // Track network failures
      const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
      logError(
        error as Error,
        {
          type: 'network',
          url,
          timestamp: new Date().toISOString()
        },
        'error'
      );
      throw error;
    }
  };
};
