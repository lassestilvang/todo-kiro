/**
 * Global test setup - runs before all tests
 * Must be imported before MSW server setup
 */

// Polyfill for relative URLs in Node.js environment
if (typeof globalThis.location === 'undefined') {
  (globalThis as any).location = {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000/',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: ''
  };
}

// Store original fetch for MSW tests
export const originalFetch = globalThis.fetch;

// Function to enable fetch URL conversion for MSW tests
export function enableFetchUrlConversion() {
  globalThis.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Convert relative URLs to absolute URLs for MSW
    if (typeof input === 'string' && input.startsWith('/')) {
      input = `http://localhost:3000${input}`;
    } else if (input instanceof Request && input.url.startsWith('/')) {
      input = new Request(`http://localhost:3000${input.url}`, input);
    }
    
    return originalFetch(input, init);
  } as typeof fetch;
}

// Function to restore original fetch
export function disableFetchUrlConversion() {
  globalThis.fetch = originalFetch;
}

export {};
