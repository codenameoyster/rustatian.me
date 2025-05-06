import { Router, Route } from 'preact-iso';
import { Home } from '@pages/Home';
import { NotFound } from '@pages/_404';
import { Projects } from '@pages/Projects';
import { Stats } from '@pages/Stats';
import { Awards } from '@pages/Awards';
import { Contact } from '@pages/Contact';
import { Blog } from '@pages/Blog';
import { AnyComponent } from 'preact';

interface IRoute {
  path: string;
  component: AnyComponent;
}

const routes: IRoute[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/projects',
    component: Projects,
  },
  {
    path: '/stats',
    component: Stats,
  },
  {
    path: '/awards',
    component: Awards,
  },
  {
    path: '/contact',
    component: Contact,
  },
  {
    path: '/blog',
    component: Blog,
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
