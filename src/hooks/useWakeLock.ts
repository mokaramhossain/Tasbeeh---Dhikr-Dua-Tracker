import { useEffect, useRef } from 'react';

/**
 * Holds a screen wake lock while `active` is true, so the phone does not dim
 * part-way through a recitation.
 *
 * The lock is dropped by the browser whenever the page is hidden, so it is
 * re-acquired on `visibilitychange`. Unsupported browsers (older iOS) and
 * rejected requests are ignored — this is a comfort feature and must never
 * throw into the render tree.
 */
export const useWakeLock = (active: boolean) => {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active) return;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;

    let cancelled = false;

    const release = async () => {
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      try {
        await sentinel?.release();
      } catch {
        /* already released */
      }
    };

    const acquire = async () => {
      if (cancelled || document.visibilityState !== 'visible' || sentinelRef.current) return;
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await sentinel.release();
          return;
        }
        sentinelRef.current = sentinel;
        // Clear our handle if the browser drops it on its own.
        sentinel.addEventListener('release', () => {
          if (sentinelRef.current === sentinel) sentinelRef.current = null;
        });
      } catch {
        /* denied, low battery, or unsupported */
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibility);
      void release();
    };
  }, [active]);
};

export default useWakeLock;
