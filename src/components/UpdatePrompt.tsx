import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { LocalizedText } from '../constants';

/** How often an open app asks whether a newer build has been deployed. */
const UPDATE_CHECK_MS = 60 * 60 * 1000;

interface UpdatePromptProps {
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
}

/**
 * Tells the user when a new build is installed and waiting.
 *
 * The service worker takes over as soon as it installs, but the page already on
 * screen keeps its old assets — so a fresh deploy only appears on the *second*
 * load, which reads as "the update didn't work". This makes that visible and
 * gives it one tap.
 *
 * Deliberately not an automatic reload: someone may be mid-recitation with a
 * count on screen, and reloading under them would lose their place.
 */
const UpdatePrompt: React.FC<UpdatePromptProps> = ({ getLocalizedText }) => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    // An installed PWA can stay open for days without a navigation, so without
    // a periodic check it would never learn that a new build exists.
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => { void registration.update(); }, UPDATE_CHECK_MS);
    }
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-[88px] z-[120] mx-auto flex w-[min(28rem,calc(100%-1.5rem))] items-center gap-3 rounded-2xl border border-gold/40 bg-card px-4 py-3 shadow-xl"
    >
      <span className="min-w-0 flex-1 text-sm font-bold text-text-main">
        {getLocalizedText('A new version is ready.')}
      </span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-gold px-4 text-xs font-bold text-bg"
      >
        <RefreshCw size={14} />
        {getLocalizedText('Reload')}
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        aria-label={getLocalizedText('Close')}
        className="flex h-11 w-8 shrink-0 items-center justify-center text-text-muted hover:text-text-main"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default UpdatePrompt;
