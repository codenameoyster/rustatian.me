import createCache, { type Options as EmotionCacheOptions } from '@emotion/cache';
import { CacheProvider, type EmotionCache } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { hydrate, LocationProvider, prerender as ssr } from 'preact-iso';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
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

const buildEmotionCache = (nonce: string | undefined): EmotionCache => {
  const options: EmotionCacheOptions = { key: 'rustatian' };
  if (nonce) options.nonce = nonce;
  return createCache(options);
};

const emotionCache = buildEmotionCache(readNonceFromDom());

type HelmetContext = { helmet?: HelmetServerState | null };

interface AppProps {
  helmetContext?: HelmetContext;
}

export function App({ helmetContext }: AppProps = {}) {
  const providerProps = helmetContext ? { context: helmetContext } : {};
  return (
    <CacheProvider value={emotionCache}>
      <HelmetProvider {...providerProps}>
        <QueryClientProvider client={queryClient}>
          <LocationProvider>
            <InitColorSchemeScript defaultMode="system" nonce={CSP_NONCE_PLACEHOLDER} />
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
    </CacheProvider>
  );
}

if (typeof window !== 'undefined') {
  const appElement = document.getElementById('app');
  if (appElement) {
    hydrate(<App />, appElement);
  }
}

interface HelmetVNode {
  type: unknown;
  props?: Record<string, unknown>;
}

const extractHelmetTitle = (helmet: HelmetServerState | null | undefined): string | undefined => {
  if (!helmet) return undefined;
  const components = helmet.title.toComponent() as unknown as HelmetVNode[];
  for (const component of components) {
    const children = component.props?.children;
    if (typeof children === 'string' && children.length > 0) return children;
  }
  return undefined;
};

const stringifyHelmetProps = (props: Record<string, unknown>): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'children' || key === 'textContent') continue;
    result[key] = typeof value === 'string' ? value : String(value);
  }
  return result;
};

const collectHelmetElements = (
  helmet: HelmetServerState | null | undefined,
): Set<{ type: string; props: Record<string, string> }> => {
  const elements = new Set<{ type: string; props: Record<string, string> }>();
  if (!helmet) return elements;
  for (const datum of [helmet.meta, helmet.link]) {
    const components = datum.toComponent() as unknown as HelmetVNode[];
    for (const component of components) {
      if (typeof component.type !== 'string') continue;
      elements.add({ type: component.type, props: stringifyHelmetProps(component.props ?? {}) });
    }
  }
  return elements;
};

export async function prerender(data: unknown) {
  const helmetContext: HelmetContext = {};
  const dataProps = (data ?? {}) as Record<string, unknown>;
  const result = await ssr(<App {...dataProps} helmetContext={helmetContext} />);
  const { helmet } = helmetContext;
  return {
    ...result,
    head: {
      title: extractHelmetTitle(helmet),
      elements: collectHelmetElements(helmet),
    },
  };
}
