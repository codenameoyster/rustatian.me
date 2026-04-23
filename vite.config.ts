import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import path from 'path';
import preact from '@preact/preset-vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const plugins: Plugin[] = [
    preact({
      prerender: {
        enabled: true,
        renderTarget: '#app',
        additionalPrerenderRoutes: ['/about', '/contact', '/404'],
        previewMiddlewareEnabled: true,
        previewMiddlewareFallback: '/404',
      },
    }) as unknown as Plugin,
  ];

  if (env.ANALYZE) {
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
      }) as unknown as Plugin,
    );
  }

  return {
    plugins,
    build: {
      // Ensure proper output for Cloudflare Workers
      target: 'esnext',
      minify: mode === 'production',
      // Emit source maps that stack-trace resolvers can pick up without
      // actually serving the `.map` files next to the production bundles.
      // For dev builds keep inline-ish maps for DX.
      sourcemap: mode === 'production' ? 'hidden' : true,
      chunkSizeWarningLimit: 500,
    },
    resolve: {
      // Exclude 'browser' from conditions so the client bundle picks universal
      // ESM exports that have runtime isBrowser guards (e.g. @emotion/cache).
      // vite-prerender-plugin re-executes the client bundle in Node for SSG,
      // so browser-only exports that unconditionally touch `document` crash.
      // 'production' and 'development' are mutually exclusive — pick one so
      // packages with both export conditions (react, etc.) resolve correctly.
      conditions: mode === 'production' ? ['module', 'production'] : ['module', 'development'],
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@state': path.resolve(__dirname, './src/state'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@api': path.resolve(__dirname, './src/api'),
        '@constants': path.resolve(__dirname, './src/constants'),
        'react': 'preact/compat',
        'react-dom': 'preact/compat',
      },
    },
  }
});
