import { Helmet } from 'react-helmet-async';

export function NotFound() {
  return (
    <>
      <Helmet>
        <title>Not Found | rustatian.me</title>
        <meta
          name="description"
          content="The page you're looking for doesn't exist. Return to the home page to explore rustatian.me."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <section>
        <h1>404: Not Found</h1>
        <p>It's gone :(</p>
      </section>
    </>
  );
}
