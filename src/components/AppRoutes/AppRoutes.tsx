import { Router, Route } from 'preact-iso';
import { Home } from '@pages/Home';
import { NotFound } from '@pages/_404';
import { Blog } from '@pages/Blog';
import { CV } from '@pages/CV';
import { FunctionalComponent } from 'preact';
import { ExternalPost } from '@components/ExternalPost/ExternalPost';
import { BLOG_SUBDIRECTORY, CV_SUBDIRECTORY } from '@/constants';

interface ISlug {
  slug?: string;
}
interface IRoute {
  path: string;
  component: FunctionalComponent<ISlug>;
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
    path: `/${CV_SUBDIRECTORY}`,
    component: CV,
  },
  {
    path: `/${BLOG_SUBDIRECTORY}/*`,
    component: ExternalPost,
  },
];

const notFoundRoute: IRoute = {
  path: '*',
  component: NotFound,
};

const allRoutes: IRoute[] = [...routes, notFoundRoute];

export const AppRoutes = () => {
  return (
    <Router>
      {allRoutes.map(route => (
        <Route key={route.path} path={route.path} component={route.component} />
      ))}
    </Router>
  );
};
