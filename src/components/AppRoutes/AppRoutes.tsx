import { Router, Route } from "preact-iso";
import { Home } from "@pages/Home";
import { NotFound } from "@pages/_404";

export const AppRoutes = () => {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route default component={NotFound} />
    </Router>
  );
};
