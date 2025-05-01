import { LocationProvider, hydrate, prerender as ssr } from 'preact-iso';
import { Header } from './components/Header';
import { CssBaseline } from '@mui/material';
import { AppRoutes } from './components/AppRoutes/AppRoutes';
import { CustomThemeProvider } from './components/CustomThemeProvider/CustomThemeProvider';

import './style.css';

export function App() {
	return (
    <LocationProvider>
      <CustomThemeProvider>
        <CssBaseline />
        <Header />
        <main>
          <AppRoutes />
        </main>
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
