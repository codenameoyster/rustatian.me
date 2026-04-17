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
        additionalPrerenderRoutes: ['/404', '/blog'],
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
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    },
    build: {
      // Ensure proper output for Cloudflare Workers
      target: 'esnext',
      minify: mode === 'production',
      sourcemap: true,
      chunkSizeWarningLimit: 500,
    },
    resolve: {
      // Exclude 'browser' from conditions so the client bundle picks universal
      // ESM exports that have runtime isBrowser guards (e.g. @emotion/cache).
      // vite-prerender-plugin re-executes the client bundle in Node for SSG,
      // so browser-only exports that unconditionally touch `document` crash.
      conditions: ['module', 'production', 'development'],
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
