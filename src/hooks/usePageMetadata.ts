import { useEffect } from 'preact/hooks';

export const usePageMetadata = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) => {
  useEffect(() => {
    document.title = title ?? 'theRustation.me';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        description ?? 'Information about me and my projects.',
      );
    }
  }, [title, description]);
};
