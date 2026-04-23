import { RouteTransitionOverlay } from '@components/Loaders/RouteTransitionOverlay';
import { NotFound } from '@pages/_404';
import { About } from '@pages/About';
import { Contact } from '@pages/Contact';
import { Home } from '@pages/Home';
import { useState } from 'preact/hooks';
import { Route, Router } from 'preact-iso';

// No lazy loading — keeps the prerender output byte-identical to what
// the client hydrates, avoiding Suspense fallbacks in SSG HTML.
export const AppRoutes = () => {
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  return (
    <>
      <Router
        onLoadStart={() => setIsRouteLoading(true)}
        onLoadEnd={() => setIsRouteLoading(false)}
      >
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route default component={NotFound} />
      </Router>
      <RouteTransitionOverlay loading={isRouteLoading} delay={150} />
    </>
  );
};
