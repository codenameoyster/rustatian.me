import { Helmet } from 'react-helmet-async';
import { OG_IMAGE_PATH, SITE_URL } from '@/constants';

interface SeoProps {
  title: string;
  description: string;
  // Site-root-relative, with a trailing slash to match the prerendered output
  // (`/about/`, not `/about`). Omit on pages that should not be indexed.
  path?: string;
  noindex?: boolean;
}

// Every page's head in one place. Previously each page hand-rolled its own tags,
// which is how Home ended up with partial Open Graph tags, About and Contact
// with none, and no page with a canonical URL at all.
export const Seo = ({ title, description, path, noindex = false }: SeoProps) => {
  const canonical = path ? `${SITE_URL}${path}` : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${SITE_URL}${OG_IMAGE_PATH}`} />
      {canonical && <meta property="og:url" content={canonical} />}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${OG_IMAGE_PATH}`} />
    </Helmet>
  );
};
