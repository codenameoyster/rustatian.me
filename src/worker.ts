/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
  APP_ENV?: string;
}

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
      return env.ASSETS.fetch(request);
    }

    // For HTML navigation requests, perform SSR
    if (request.method === 'GET' && request.headers.get('accept')?.includes('text/html')) {
      try {
        // Try to fetch the prerendered HTML from assets first
        const assetResponse = await env.ASSETS.fetch(request);

        if (assetResponse.ok) {
          // Add security headers to prerendered HTML
          return new Response(assetResponse.body, {
            status: assetResponse.status,
            headers: {
              ...Object.fromEntries(assetResponse.headers),
              'content-security-policy':
                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: raw.githubusercontent.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://raw.githubusercontent.com; frame-ancestors 'none'",
              'x-frame-options': 'DENY',
              'x-content-type-options': 'nosniff',
              'referrer-policy': 'strict-origin-when-cross-origin',
              'permissions-policy': 'geolocation=(), microphone=(), camera=()',
            },
          });
        }

        // If no prerendered asset exists, fall back to index.html
        // This handles client-side routing
        const indexRequest = new Request(new URL('/', url.origin), request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);

        if (indexResponse.ok) {
          // Return the index.html with the correct URL path and security headers
          return new Response(indexResponse.body, {
            status: 200,
            headers: {
              ...Object.fromEntries(indexResponse.headers),
              'content-type': 'text/html;charset=UTF-8',
              'content-security-policy':
                "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: raw.githubusercontent.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.github.com https://raw.githubusercontent.com; frame-ancestors 'none'",
              'x-frame-options': 'DENY',
              'x-content-type-options': 'nosniff',
              'referrer-policy': 'strict-origin-when-cross-origin',
              'permissions-policy': 'geolocation=(), microphone=(), camera=()',
            },
          });
        }

        return new Response('Not Found', { status: 404 });
      } catch (error) {
        console.error('SSR Error:', error);
        return new Response('Internal Server Error', { status: 500 });
      }
    }

    // For all other requests, try to fetch from assets
    return env.ASSETS.fetch(request);
  },
};
