import { useEffect, useRef } from 'react';

interface UseSmartRefetchOptions {
  /**
   * Minimum time (in milliseconds) the tab must be hidden before triggering a refetch
   * @default 30000 (30 seconds)
   */
  threshold?: number;
  /**
   * Whether to enable smart refetch
   * @default true
   */
  enabled?: boolean;
}

/**
 * Smart refetch hook that only refetches data when the tab regains focus
 * AND was hidden for longer than the threshold duration.
 *
 * This prevents excessive API calls when quickly switching between tabs.
 *
 * @param refetchFn - Function to call when refetch conditions are met
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * useSmartRefetch(fetchData, { threshold: 60000 }); // Refetch only if hidden for 60s+
 * ```
 */
export function useSmartRefetch(
  refetchFn: () => void | Promise<void>,
  options: UseSmartRefetchOptions = {}
) {
  const { threshold = 30000, enabled = true } = options;
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Tab is being hidden - record the timestamp
        hiddenAtRef.current = Date.now();
      } else {
        // Tab is becoming visible - check if we should refetch
        if (hiddenAtRef.current !== null) {
          const hiddenDuration = Date.now() - hiddenAtRef.current;

          // Only refetch if hidden for longer than threshold
          if (hiddenDuration >= threshold) {
            await refetchFn();
          }

          hiddenAtRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchFn, threshold, enabled]);
}
