import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { hydrate, LocationProvider, prerender as ssr } from 'preact-iso';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { AppRoutes } from './components/AppRoutes/AppRoutes';
import { Layout } from './components/Layout/Layout';
import { ErrorNotification } from './components/Notifications/ErrorNotification';
import { AppContextProvider } from './state/appContext/appContext';
import './styles/tokens.css';
import './styles/base.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      // Retain cached results for 24h past the active observer, matching the
      // worker's daily refresh cadence so tab-switches don't refetch.
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
    },
  },
});

type HelmetContext = { helmet?: HelmetServerState | null };

interface AppProps {
  helmetContext?: HelmetContext;
}

export function App({ helmetContext }: AppProps = {}) {
  // HelmetProvider's `context` prop can't accept `undefined` under
  // `exactOptionalPropertyTypes: true` (react-helmet-async types the field as
  // required), so conditionally spread instead of passing the prop always.
  const providerProps = helmetContext ? { context: helmetContext } : {};
  return (
    <HelmetProvider {...providerProps}>
      <QueryClientProvider client={queryClient}>
        <LocationProvider>
          <AppContextProvider>
            <Layout>
              <AppRoutes />
            </Layout>
            <ErrorNotification />
          </AppContextProvider>
        </LocationProvider>
      </QueryClientProvider>
    </HelmetProvider>
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
  try {
    const result = await ssr(<App {...dataProps} helmetContext={helmetContext} />);
    const { helmet } = helmetContext;
    return {
      ...result,
      head: {
        title: extractHelmetTitle(helmet),
        elements: collectHelmetElements(helmet),
      },
    };
  } catch (error) {
    // preact-iso runs prerender once per route; without this breadcrumb the
    // build stack trace doesn't say which URL broke the SSG pass. Re-throw so
    // the build still fails.
    console.error('prerender failed', {
      dataProps,
      error: error instanceof Error ? { name: error.name, message: error.message } : error,
    });
    throw error;
  }
}
