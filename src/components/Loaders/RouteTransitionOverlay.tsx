import { useEffect, useState } from 'preact/hooks';

interface IRouteTransitionOverlayProps {
  loading: boolean;
  delay?: number;
}

export const RouteTransitionOverlay = ({ loading, delay = 150 }: IRouteTransitionOverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay, loading]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-testid="route-transition-overlay"
      aria-busy="true"
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: '0',
        zIndex: '1400',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(12, 18, 32, 0.35)',
        backdropFilter: 'blur(2px)',
        pointerEvents: 'all',
      }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" role="status" aria-label="Loading route">
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="4"
        />
        <path d="M22 4a18 18 0 0 1 18 18" fill="none" stroke="#ffffff" strokeWidth="4">
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 22 22"
            to="360 22 22"
            dur="0.9s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};
