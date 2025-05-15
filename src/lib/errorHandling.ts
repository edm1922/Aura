/**
 * Handles API response errors and extracts error messages
 */
export async function handleApiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error || `Error: ${response.status} ${response.statusText}`;
  } catch (error) {
    return `Error: ${response.status} ${response.statusText}`;
  }
}

/**
 * Formats error objects into readable messages
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Common error messages
 */
export const ErrorMessages = {
  NETWORK: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You must be signed in to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  DEFAULT: 'Something went wrong. Please try again.'
};
