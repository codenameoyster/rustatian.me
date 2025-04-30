import { LocationProvider, Router, Route, hydrate, prerender as ssr } from 'preact-iso';
import { Header } from './components/Header';
import { Home } from './pages/Home/index';
import { NotFound } from './pages/_404';
import './style.css';
import { ThemeProviderWrapper } from './state/AppContext/ThemeContext';
import { CssBaseline } from '@mui/material';


export function App() {
	return (
    <LocationProvider>
      <ThemeProviderWrapper>
        <CssBaseline />
        <Header />
        <main>
          <Router>
            <Route path="/" component={Home} />
            <Route default component={NotFound} />
          </Router>
        </main>
      </ThemeProviderWrapper>
    </LocationProvider>
	);
}

if (typeof window !== 'undefined') {
	hydrate(<App />, document.getElementById('app'));
}

export async function prerender(data) {
	return await ssr(<App {...data} />);
}
