import { LocationProvider, hydrate, prerender as ssr } from 'preact-iso';
import { CssBaseline } from '@mui/material';
import { AppRoutes } from './components/AppRoutes/AppRoutes';
import { CustomThemeProvider } from './components/CustomThemeProvider/CustomThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppContextProvider } from './state/appContext/appContext';
import { ErrorNotification } from './components/Notifications/ErrorNotification';
import { LayoutContainer } from './components/Layout/LayoutContainer';
import { CustomScrollbarStyles } from './components/CustomScrollbarStyles/CustomScrollbarStyles';
import { HelmetProvider } from 'react-helmet-async';

// Create QueryClient outside component to prevent recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export function App() {
  return (
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
