/**
 * Test utilities for handling environment-specific configurations
 */

/**
 * Get the base URL for API calls
 * In test environment, returns absolute URL for MSW
 * In production, returns empty string for relative URLs
 */
export function getApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return 'http://localhost:3000';
  }
  return '';
}

/**
 * Build an API URL that works in both test and production environments
 */
export function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path}`;
}
