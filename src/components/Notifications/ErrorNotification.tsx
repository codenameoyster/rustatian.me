import { useError, useSetError } from '@state/appContext/appContext';
import { useEffect, useState } from 'preact/hooks';
import styles from './ErrorNotification.module.css';

const AUTO_HIDE_MS = 6000;

export const ErrorNotification = () => {
  const error = useError();
  const setError = useSetError();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!error) return;
    setLeaving(false);
    const hideAt = setTimeout(() => setLeaving(true), AUTO_HIDE_MS - 250);
    const clearAt = setTimeout(() => setError(undefined), AUTO_HIDE_MS);
    return () => {
      clearTimeout(hideAt);
      clearTimeout(clearAt);
    };
  }, [error, setError]);

  if (!error) return null;

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => setError(undefined), 250);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`${styles.toast} ${leaving ? styles.leaving : ''}`}
    >
      <span>{error.message || 'Something went wrong'}</span>
      <button type="button" className={styles.close} aria-label="Dismiss" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};
