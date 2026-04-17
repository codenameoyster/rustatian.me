import createCache, { type Options as EmotionCacheOptions } from '@emotion/cache';
import { CacheProvider, type EmotionCache } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ComponentChildren } from 'preact';
import { hydrate, LocationProvider, prerender as ssr } from 'preact-iso';
import { HelmetProvider } from 'react-helmet-async';
import { AppRoutes } from './components/AppRoutes/AppRoutes';
import { CustomScrollbarStyles } from './components/CustomScrollbarStyles/CustomScrollbarStyles';
import { CustomThemeProvider } from './components/CustomThemeProvider/CustomThemeProvider';
import { LayoutContainer } from './components/Layout/LayoutContainer';
import { ErrorNotification } from './components/Notifications/ErrorNotification';
import { AppContextProvider } from './state/appContext/appContext';
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

const emotionCache = buildEmotionCache(readNonceFromDom());

export function App() {
  return (
    <MaybeCacheProvider cache={emotionCache}>
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
