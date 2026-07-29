import { NotFound } from '@pages/_404';
import { About } from '@pages/About';
import { Contact } from '@pages/Contact';
import { Home } from '@pages/Home';
import { Route, Router } from 'preact-iso';

// No lazy loading — keeps the prerender output byte-identical to what
// the client hydrates, avoiding Suspense fallbacks in SSG HTML.
//
// That also means preact-iso's onLoadStart/onLoadEnd never fire: it invokes them
// only from its suspend hook, and nothing here suspends. A route-transition
// overlay wired to those callbacks was therefore dead and has been removed.
export const AppRoutes = () => (
  <Router>
    <Route path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/contact" component={Contact} />
    <Route default component={NotFound} />
  </Router>
);
