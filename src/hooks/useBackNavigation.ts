import { useEffect, useRef } from 'react';

interface BackNavigationOptions {
  /** How many "back-dismissable" layers are currently showing. */
  depth: number;
  /** Called when the user presses Back. Should reduce `depth` by one. */
  onBack: () => void;
}

/**
 * Keeps the browser history stack in sync with however many dismissable layers
 * (overlay, non-default tab) are open.
 *
 * The previous implementation pushed an entry whenever an overlay opened but
 * only popped it when the overlay was dismissed *via* the Back button. Any
 * overlay closed with a normal button — "Maybe Later" on the rating sheet, the
 * surah modal's own close in its `finally` block — left a stray entry behind,
 * so the next Back press appeared to do nothing and eventually took several
 * presses to leave the app.
 *
 * Here every layer owns exactly one history entry: opening pushes one, closing
 * by any means consumes one. `skipPops` marks the pops we triggered ourselves
 * so they are not mistaken for the user pressing Back.
 */
export const useBackNavigation = ({ depth, onBack }: BackNavigationOptions) => {
  const pushedRef = useRef(0);
  const skipPopsRef = useRef(0);
  const onBackRef = useRef(onBack);
  const depthRef = useRef(depth);

  onBackRef.current = onBack;
  depthRef.current = depth;

  useEffect(() => {
    const handlePopState = () => {
      if (skipPopsRef.current > 0) {
        skipPopsRef.current -= 1;
        return;
      }
      if (pushedRef.current > 0) {
        pushedRef.current -= 1;
        onBackRef.current();
      }
      // With no entries of our own left, the pop belongs to the browser and
      // leaves the app, which is what the user asked for.
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    while (pushedRef.current < depth) {
      pushedRef.current += 1;
      window.history.pushState({ dhikrLayer: pushedRef.current }, '');
    }
    while (pushedRef.current > depth) {
      pushedRef.current -= 1;
      skipPopsRef.current += 1;
      window.history.back();
    }
  }, [depth]);
};

export default useBackNavigation;
