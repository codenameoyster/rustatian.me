/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
  APP_ENV?: string;
}

/**
 * Content Security Policy (CSP) Configuration
 *
 * Security considerations for this CSP:
 *
 * 1. 'unsafe-inline' for scripts and styles:
 *    - Required for Emotion/MUI CSS-in-JS which injects styles at runtime
 *    - Required for Vite's development mode and some inline scripts
 *    - Trade-off: Slightly weakens XSS protection but necessary for the tech stack
 *    - Mitigation: All user content is sanitized via DOMPurify before rendering
 *
 * 2. External resources:
 *    - fonts.googleapis.com / fonts.gstatic.com: Google Fonts for typography
 *    - api.github.com / raw.githubusercontent.com: GitHub API for profile/blog data
 *    - Images allow 'data:' for inline SVGs and base64 images from markdown
 *
 * 3. frame-ancestors 'none': Prevents clickjacking by disallowing embedding
 *
 * Future improvements:
 * - Consider nonce-based CSP if moving away from CSS-in-JS
 * - Evaluate Trusted Types API when browser support improves
 */
const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https: raw.githubusercontent.com",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://api.github.com https://raw.githubusercontent.com",
  "frame-ancestors 'none'",
].join('; ');

/**
 * Apply security headers to a response
 */
const applySecurityHeaders = (headers: Headers, includeCSP = false): void => {
  if (includeCSP) {
    headers.set('content-security-policy', CSP_POLICY);
  }
  headers.set('x-frame-options', 'DENY');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  headers.set('permissions-policy', 'geolocation=(), microphone=(), camera=()');
  headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains; preload');
  headers.set('cross-origin-opener-policy', 'same-origin');
  headers.set('cross-origin-resource-policy', 'same-origin');
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Serve static assets directly from the ASSETS binding
    // This includes JS, CSS, images, fonts, etc.
    if (
      url.pathname.startsWith('/assets/') ||
      url.pathname.startsWith('/src/') ||
      url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json)$/)
    ) {
      const assetResponse = await env.ASSETS.fetch(request);
      const headers = new Headers(assetResponse.headers);
      applySecurityHeaders(headers, false);

      return new Response(assetResponse.body, {
        status: assetResponse.status,
        headers,
      });
    }

    // For HTML navigation requests, perform SSR
    if (request.method === 'GET' && request.headers.get('accept')?.includes('text/html')) {
      try {
        // Try to fetch the prerendered HTML from assets first
        const assetResponse = await env.ASSETS.fetch(request);

        if (assetResponse.ok) {
          const headers = new Headers(assetResponse.headers);
          applySecurityHeaders(headers, true);

          return new Response(assetResponse.body, {
            status: assetResponse.status,
            headers,
          });
        }

        // If no prerendered asset exists, fall back to index.html
        // This handles client-side routing
        const indexRequest = new Request(new URL('/', url.origin), request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);

        if (indexResponse.ok) {
          const headers = new Headers(indexResponse.headers);
          headers.set('content-type', 'text/html;charset=UTF-8');
          applySecurityHeaders(headers, true);

          return new Response(indexResponse.body, {
            status: 200,
            headers,
          });
        }

        return new Response('Not Found', { status: 404 });
      } catch (error) {
        console.error('SSR Error:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    // For all other requests, try to fetch from assets
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    applySecurityHeaders(headers, false);

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  },
};
