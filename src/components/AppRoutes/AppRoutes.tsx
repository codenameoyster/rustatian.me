import { RouteTransitionOverlay } from '@components/Loaders/RouteTransitionOverlay';
import { NotFound } from '@pages/_404';
import { About } from '@pages/About';
import { Contact } from '@pages/Contact';
import { Home } from '@pages/Home';
import { Projects } from '@pages/Projects';
import { useCallback, useState } from 'preact/hooks';
import { Route, Router } from 'preact-iso';

// All four pages are tiny; no lazy loading. This also keeps the prerender
// output identical to what the client hydrates to.
export const AppRoutes = () => {
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const handleRouteLoadStart = useCallback(() => setIsRouteLoading(true), []);
  const handleRouteLoadEnd = useCallback(() => setIsRouteLoading(false), []);

  return (
    <>
      <Router onLoadStart={handleRouteLoadStart} onLoadEnd={handleRouteLoadEnd}>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/projects" component={Projects} />
        <Route path="/contact" component={Contact} />
        <Route default component={NotFound} />
      </Router>
      <RouteTransitionOverlay loading={isRouteLoading} delay={150} />
    </>
  );
};
