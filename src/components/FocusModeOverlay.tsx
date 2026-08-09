import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { DhikrItem, Language, LocalizedText } from '../constants';
import ProgressBar from './ProgressBar';
import { renderText } from '../utils/renderText';
import { formatNumber } from '../i18n';

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
}

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
  language
}) => {
  const isDone = target > 0 && count >= target;
  const progress = target > 0 ? Math.min(Math.round((count / target) * 100), 100) : 0;
  const stop = (e: React.MouseEvent | React.TouchEvent) => e.stopPropagation();

  // Keyboard support so the counter is usable on a desktop/tablet keyboard.
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

      <div className="flex-1 overflow-y-auto px-5 py-10 flex flex-col items-center text-center">
        <div className="max-w-xl w-full space-y-10 pointer-events-none">
          <div className="space-y-5">
            {item.arabic ? (
              <div
                lang="ar"
                dir="rtl"
                className="whitespace-pre-line arabic-text leading-[1.85] text-text-arabic text-right"
                style={{ fontSize: 'calc(var(--arabic-size) * 1.2)' }}
              >
                {renderText(item.arabic)}
              </div>
            ) : null}
            {getLocalizedText(item.trn) ? (
              <p
                className="whitespace-pre-line text-green-light font-medium italic opacity-90"
                style={{ fontSize: 'var(--english-size)' }}
              >
                {renderText(getLocalizedText(item.trn))}
              </p>
            ) : null}
          </div>
          {getLocalizedText(item.meaning) ? (
            <div className="p-6 bg-card rounded-[2rem] border border-border">
              <div
                className="whitespace-pre-line text-text-main/90 leading-relaxed"
                style={{ fontSize: 'calc(var(--english-size) * 1.1)' }}
              >
                {renderText(getLocalizedText(item.meaning))}
              </div>
            </div>
          ) : null}
          {item.benefit ? (
            <div className="text-left p-5 bg-gold/6 rounded-2xl border border-gold/10">
              <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-2">
                {getLocalizedText({ en: 'Benefit', bn: 'ফজিলত' })}
              </p>
              <div className="whitespace-pre-line text-sm text-text-sub leading-relaxed">
                {renderText(getLocalizedText(item.benefit))}
              </div>
            </div>
          ) : null}
          {(item.source || item.ref) ? (
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
              {[item.source, item.ref].filter(Boolean).join(', ')}
            </p>
          ) : null}
        </div>
      </div>

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
