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

export function App() {
  const queryClient = new QueryClient();

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
  hydrate(<App />, document.getElementById('app'));
}

export async function prerender(data) {
  return await ssr(<App {...data} />);
}
