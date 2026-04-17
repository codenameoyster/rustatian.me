import { LocationProvider, hydrate, prerender as ssr } from 'preact-iso';
import { CssBaseline } from '@mui/material';
import { CacheProvider, type EmotionCache } from '@emotion/react';
import createCache, { type Options as EmotionCacheOptions } from '@emotion/cache';
import type { ComponentChildren } from 'preact';
import { AppRoutes } from './components/AppRoutes/AppRoutes';
import { CustomThemeProvider } from './components/CustomThemeProvider/CustomThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppContextProvider } from './state/appContext/appContext';
import { ErrorNotification } from './components/Notifications/ErrorNotification';
import { LayoutContainer } from './components/Layout/LayoutContainer';
import { CustomScrollbarStyles } from './components/CustomScrollbarStyles/CustomScrollbarStyles';
import { HelmetProvider } from 'react-helmet-async';
import { CSP_NONCE_PLACEHOLDER } from './utils/cspNonce';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const readNonceFromDom = (): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="csp-nonce"]');
  const value = meta?.content;
  if (!value || value === CSP_NONCE_PLACEHOLDER) return undefined;
  return value;
};

const buildEmotionCache = (nonce: string | undefined): EmotionCache | undefined => {
  if (typeof document === 'undefined') return undefined;
  const options: EmotionCacheOptions = { key: 'rustatian' };
  if (nonce) options.nonce = nonce;
  return createCache(options);
};

const MaybeCacheProvider = ({
  cache,
  children,
}: {
  cache: EmotionCache | undefined;
  children: ComponentChildren;
}) => {
  if (!cache) return <>{children}</>;
  return <CacheProvider value={cache}>{children}</CacheProvider>;
};

export function App() {
  const cache = buildEmotionCache(readNonceFromDom());

  return (
    <MaybeCacheProvider cache={cache}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <LocationProvider>
            <CustomThemeProvider>
              <AppContextProvider>
                <CssBaseline />
                <CustomScrollbarStyles />
                <ErrorNotification />
                <LayoutContainer>
                  <AppRoutes />
                </LayoutContainer>
              </AppContextProvider>
            </CustomThemeProvider>
          </LocationProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </MaybeCacheProvider>
  );
}

if (typeof window !== 'undefined') {
  const appElement = document.getElementById('app');
  if (appElement) {
    hydrate(<App />, appElement);
  }
}

export async function prerender(data: unknown) {
  return await ssr(<App {...(data as Record<string, unknown>)} />);
}
