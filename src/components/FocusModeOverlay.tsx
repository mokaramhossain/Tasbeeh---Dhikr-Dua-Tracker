import React, { useEffect } from 'react';
import { motion, type PanInfo } from 'motion/react';
import { X, ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';
import { DhikrItem, Language, LocalizedText } from '../constants';
import ProgressBar from './ProgressBar';
import { renderText } from '../utils/renderText';
import { formatNumber } from '../i18n';
import useWakeLock from '../hooks/useWakeLock';

interface FocusModeOverlayProps {
  item: DhikrItem;
  count: number;
  target: number;
  onIncrement: () => void;
  onReset: () => void;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  position?: { current: number; total: number };
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  language: Language;
  showTransliteration?: boolean;
  showTranslation?: boolean;
}

const SHORT_ARABIC_LIMIT = 60;
/** Distance or flick speed needed before a drag counts as a swipe. */
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 400;

const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  item,
  count,
  target,
  onIncrement,
  onReset,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  position,
  getLocalizedText,
  language,
  showTransliteration = true,
  showTranslation = true
}) => {
  const isDone = target > 0 && count >= target;
  const progress = target > 0 ? Math.min(Math.round((count / target) * 100), 100) : 0;
  const stop = (e: React.MouseEvent | React.TouchEvent) => e.stopPropagation();
  const isShortArabic = (item.arabic || '').length <= SHORT_ARABIC_LIMIT;
  const transliteration = getLocalizedText(item.trn);
  const meaning = getLocalizedText(item.meaning);
  const benefit = getLocalizedText(item.benefit);
  const citation = [item.source, item.ref].filter(Boolean).join(', ');

  // Reciting a long dhikr can easily outlast the screen timeout.
  useWakeLock(true);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        onIncrement();
      } else if (event.key === 'ArrowLeft' && hasPrev) {
        onPrev?.();
      } else if (event.key === 'ArrowRight' && hasNext) {
        onNext?.();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, onIncrement, onPrev, onNext, hasPrev, hasNext]);

  /*
   * Swiping between duas is the primary navigation in comparable apps, and is
   * far more natural on a phone than reaching for the arrows. Dragging left
   * advances, matching the on-screen arrow order.
   */
  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const wentLeft = offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY;
    const wentRight = offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY;
    if (wentLeft && hasNext) onNext?.();
    else if (wentRight && hasPrev) onPrev?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-bg flex flex-col select-none"
      onClick={onIncrement}
      role="dialog"
      aria-modal="true"
      aria-label={getLocalizedText({ en: 'Focus Mode', bn: 'ফোকাস মোড' })}
    >
      <div className="border-b border-border p-5 flex items-center justify-between" onClick={stop}>
        <button
          onClick={(e) => { stop(e); onClose(); }}
          className="p-2 hover:bg-card rounded-xl transition-colors text-text-muted"
          aria-label={getLocalizedText({ en: 'Close focus mode', bn: 'ফোকাস মোড বন্ধ করুন' })}
        >
          <X size={24} />
        </button>
        <div className="flex flex-col items-center text-center px-2 min-w-0">
          <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-1">
            {getLocalizedText({ en: 'Focus Mode', bn: 'ফোকাস মোড' })}
          </span>
          <h2 className="text-sm font-bold text-text-main truncate max-w-[60vw]">{getLocalizedText(item.title)}</h2>
        </div>
        <div className="w-10 text-right text-[10px] font-bold text-text-muted tabular-nums">
          {position && position.total > 1 ? `${position.current}/${position.total}` : ''}
        </div>
      </div>

      <motion.div
        className="flex-1 overflow-y-auto px-5 py-10"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        dragDirectionLock
        onDragEnd={handleDragEnd}
      >
        {/*
          This block used to be pointer-events-none, which meant none of the
          text could be selected or copied on the one screen built for reading.
          Taps still bubble up to the container, so tap-to-count is unaffected.
        */}
        <div className="mx-auto max-w-xl w-full space-y-8 select-text">
          {item.arabic ? (
            <div
              lang="ar"
              dir="rtl"
              className={`whitespace-pre-line arabic-text text-text-arabic text-right ${
                isShortArabic ? 'arabic-text--short' : ''
              }`}
              style={{ fontSize: 'calc(var(--arabic-size) * 1.2)' }}
            >
              {renderText(item.arabic)}
            </div>
          ) : null}

          {showTransliteration && transliteration ? (
            <p
              className="prose-block whitespace-pre-line text-green-light font-medium italic opacity-90"
              style={{ fontSize: 'var(--english-size)' }}
            >
              {renderText(transliteration)}
            </p>
          ) : null}

          {showTranslation && meaning ? (
            <div className="p-6 bg-card rounded-[2rem] border border-border">
              <div
                className="prose-block whitespace-pre-line text-text-main/90 leading-relaxed"
                style={{ fontSize: 'calc(var(--english-size) * 1.1)' }}
              >
                {renderText(meaning)}
              </div>
            </div>
          ) : null}

          {benefit || citation ? (
            <div className="rounded-2xl border border-gold/15 bg-gold/5 p-5">
              {benefit ? (
                <>
                  <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold text-gold uppercase tracking-widest">
                    <Sparkles size={11} />
                    {getLocalizedText({ en: 'Benefit', bn: 'ফজিলত' })}
                  </p>
                  {/* Was locked to text-sm, ignoring the reading size the user set. */}
                  <div
                    className="prose-block whitespace-pre-line text-text-sub leading-relaxed"
                    style={{ fontSize: 'calc(var(--english-size) * 0.94)' }}
                  >
                    {renderText(benefit)}
                  </div>
                </>
              ) : null}
              {citation ? (
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest text-text-muted ${benefit ? 'mt-3' : ''}`}
                >
                  {citation}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </motion.div>

      <div className="p-5 bg-card border-t border-border space-y-6 pb-safe">
        <div className="max-w-xl mx-auto space-y-4" onClick={stop}>
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold tabular-nums ${isDone ? 'text-gold' : 'text-text-main'}`}>
                {formatNumber(count, language)}
              </span>
              <span className="text-lg text-text-muted font-bold">
                / {target > 0 ? formatNumber(target, language) : '∞'}
              </span>
            </div>
            <button
              onClick={(e) => { stop(e); onReset(); }}
              className="p-2 text-text-muted hover:text-gold transition-colors"
              aria-label={getLocalizedText({ en: 'Reset count', bn: 'গণনা রিসেট করুন' })}
            >
              <RotateCcw size={20} />
            </button>
          </div>
          <ProgressBar progress={progress} isDone={isDone} height={12} />
        </div>
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button
            onClick={(e) => { stop(e); onPrev?.(); }}
            disabled={!hasPrev}
            className="w-16 h-16 bg-bg rounded-3xl border border-border flex items-center justify-center text-text-main active:scale-95 transition-all disabled:opacity-30"
            aria-label={getLocalizedText({ en: 'Previous dhikr', bn: 'আগের জিকির' })}
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => { stop(e); onIncrement(); }}
            className="flex-1 h-16 bg-gold rounded-3xl flex items-center justify-center text-bg active:scale-95 transition-all shadow-lg"
          >
            <span className="text-xl font-bold uppercase tracking-[0.18em]">
              {getLocalizedText({ en: 'Count', bn: 'গণনা' })}
            </span>
          </button>
          <button
            onClick={(e) => { stop(e); onNext?.(); }}
            disabled={!hasNext}
            className="w-16 h-16 bg-bg rounded-3xl border border-border flex items-center justify-center text-text-main active:scale-95 transition-all disabled:opacity-30"
            aria-label={getLocalizedText({ en: 'Next dhikr', bn: 'পরের জিকির' })}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FocusModeOverlay;
