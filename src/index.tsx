import { LocationProvider, hydrate, prerender as ssr } from 'preact-iso';
import { CssBaseline } from '@mui/material';
import { AppRoutes } from './components/AppRoutes/AppRoutes';
import { CustomThemeProvider } from './components/CustomThemeProvider/CustomThemeProvider';

import './style.css';
import { Layout } from '@components/Layout/Layout';

export function App() {
	return (
    <LocationProvider>
      <CustomThemeProvider>
        <CssBaseline />
        <Layout>
          <AppRoutes />
        </Layout>
      </CustomThemeProvider>
    </LocationProvider>
	);
}

if (typeof window !== 'undefined') {
	hydrate(<App />, document.getElementById('app'));
}

export async function prerender(data) {
	return await ssr(<App {...data} />);
}
