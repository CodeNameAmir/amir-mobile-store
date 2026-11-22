import { useCallback, useEffect, useRef, useState } from 'react';

export function useTemporarilyAdded(durationMs = 1500) {
  const [recentlyAdded, setRecentlyAdded] = useState(false);
  const timerRef = useRef<number | null>(null);

  const triggerAdded = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setRecentlyAdded(true);
    timerRef.current = window.setTimeout(() => {
      setRecentlyAdded(false);
      timerRef.current = null;
    }, durationMs);
  }, [durationMs]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { recentlyAdded, triggerAdded };
}
