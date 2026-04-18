import { useError, useSetError } from '@state/appContext/appContext';
import { useEffect, useRef, useState } from 'preact/hooks';
import styles from './ErrorNotification.module.css';

const AUTO_HIDE_MS = 6000;
const FADE_MS = 250;

export const ErrorNotification = () => {
  const error = useError();
  const setError = useSetError();
  const [leaving, setLeaving] = useState(false);
  // All pending timers share one ref so `handleClose` and the unmount cleanup
  // can both cancel whatever is scheduled — prevents a manual dismiss from
  // racing the auto-hide and leaving stale setState calls in flight.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    for (const id of timers.current) clearTimeout(id);
    timers.current = [];
  };

  useEffect(() => {
    if (!error) {
      // The toast instance persists between errors; without this reset a new
      // error inherits the last run's `leaving=true` and paints mid-fade for
      // one frame.
      setLeaving(false);
      return;
    }
    setLeaving(false);
    clearTimers();
    timers.current.push(setTimeout(() => setLeaving(true), AUTO_HIDE_MS - FADE_MS));
    timers.current.push(setTimeout(() => setError(undefined), AUTO_HIDE_MS));
    return clearTimers;
  }, [error, setError]);

  if (!error) return null;

  const handleClose = () => {
    clearTimers();
    setLeaving(true);
    timers.current.push(setTimeout(() => setError(undefined), FADE_MS));
  };

  return (
    <div role="alert" className={`${styles.toast} ${leaving ? styles.leaving : ''}`}>
      <span>{error.message || 'Something went wrong'}</span>
      <button type="button" className={styles.close} aria-label="Dismiss" onClick={handleClose}>
        ×
      </button>
    </div>
  );
};
