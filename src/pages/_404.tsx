import { Seo } from '@/components/Seo/Seo';
import { ButtonLink } from '@/components/ui/Button';
import styles from './_404.module.css';

export const NotFound = () => (
  <>
    <Seo
      title="404 · rustatian"
      description="That URL doesn't match any route on rustatian.me."
      noindex
    />
    <div className={`container ${styles.wrap}`}>
      <span className={styles.code}>404</span>
      <h1 className={styles.title}>Page not found</h1>
      <p className={styles.body}>
        That URL doesn't match any route. It may have moved, or never existed.
      </p>
      <ButtonLink href="/" variant="primary">
        ← back home
      </ButtonLink>
    </div>
  </>
);
