import { Router, Route, lazy } from 'preact-iso';
import { Home } from '@pages/Home';
import { NotFound } from '@pages/_404';
import { ComponentType } from 'preact';
import { BLOG_SUBDIRECTORY } from '@/constants';
import { useCallback, useState } from 'preact/hooks';
import { RouteTransitionOverlay } from '@components/Loaders/RouteTransitionOverlay';

const Blog = lazy(async () => {
  const module = await import('@pages/Blog');
  return { default: module.Blog };
});

const LazyExternalPost = lazy(async () => {
  const module = await import('@components/ExternalPost/ExternalPost');
  return { default: module.ExternalPost };
});

interface ISlug {
  slug?: string;
}
interface IRoute {
  path: string;
  component: ComponentType<ISlug>;
}

const routes: IRoute[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: `/${BLOG_SUBDIRECTORY}`,
    component: Blog,
  },
  {
    path: `/${BLOG_SUBDIRECTORY}/*`,
    component: LazyExternalPost,
  },
];

const notFoundRoute: IRoute = {
  path: '*',
  component: NotFound,
};

const allRoutes: IRoute[] = [...routes, notFoundRoute];

export const AppRoutes = () => {
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const handleRouteLoadStart = useCallback(() => {
    setIsRouteLoading(true);
  }, []);

  const handleRouteLoadEnd = useCallback(() => {
    setIsRouteLoading(false);
  }, []);

  return (
    <>
      <Router onLoadStart={handleRouteLoadStart} onLoadEnd={handleRouteLoadEnd}>
        {allRoutes.map(route => (
          <Route key={route.path} path={route.path} component={route.component} />
        ))}
      </Router>
      <RouteTransitionOverlay loading={isRouteLoading} delay={150} />
    </>
  );
};
