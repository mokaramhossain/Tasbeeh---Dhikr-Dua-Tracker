import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';
import { LocalizedText } from '../constants';
import { readJSON, writeJSON } from '../utils/storage';

interface InstallPromptProps {
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'dhikr-install-hint-v1';
/** Not on the first visit — earn it first. */
const MIN_VISITS = 3;
const VISITS_KEY = 'dhikr-visits-v1';

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS predates the display-mode media query for installed web apps.
    (navigator as { standalone?: boolean }).standalone === true);

const isIos = () =>
  typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);

/**
 * A quiet, dismissible hint that the app can live on the home screen.
 *
 * Installed is where this app is meant to be used — it is offline-first, and a
 * home-screen launch is the difference between a bookmark and something opened
 * after salah. But an install banner on the first visit is the behaviour of
 * apps that want something from you, so this waits for a third visit, appears
 * once, and never comes back once dismissed.
 *
 * Android exposes `beforeinstallprompt`, which gives a real install dialog.
 * iOS has no equivalent, so there the hint explains the Share-menu route
 * instead of offering a button that cannot work.
 */
const InstallPrompt: React.FC<InstallPromptProps> = ({ getLocalizedText }) => {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (readJSON<boolean>(DISMISSED_KEY, false)) return;

    const visits = readJSON<number>(VISITS_KEY, 0) + 1;
    writeJSON(VISITS_KEY, visits);
    if (visits < MIN_VISITS) return;

    if (isIos()) {
      setShow(true);
      return;
    }

    const onPrompt = (event: Event) => {
      // Keep the event so the install dialog can be opened on a real tap;
      // browsers refuse it otherwise.
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const dismiss = () => {
    writeJSON(DISMISSED_KEY, true);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-[88px] z-[110] mx-auto flex w-[min(28rem,calc(100%-1.5rem))] items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-text-main">
          {getLocalizedText('Keep it on your home screen')}
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-text-sub">
          {getLocalizedText(
            isIos()
              ? 'Tap Share, then Add to Home Screen. It then works with no internet.'
              : 'Works with no internet once installed.'
          )}
        </span>
      </span>

      {deferred ? (
        <button
          onClick={async () => {
            const event = deferred;
            setDeferred(null);
            dismiss();
            await event.prompt().catch(() => undefined);
          }}
          className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-gold px-4 text-xs font-bold text-on-gold"
        >
          <Download size={14} />
          {getLocalizedText('Install')}
        </button>
      ) : (
        <Share size={16} className="shrink-0 text-gold-ink" aria-hidden="true" />
      )}

      <button
        onClick={dismiss}
        aria-label={getLocalizedText('Close')}
        className="flex h-11 w-7 shrink-0 items-center justify-center text-text-muted hover:text-text-main"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default InstallPrompt;
