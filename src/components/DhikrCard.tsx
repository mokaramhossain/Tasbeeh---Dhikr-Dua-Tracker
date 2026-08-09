import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Heart,
  Pin,
  Target,
  Maximize2,
  RotateCcw,
  Edit3,
  Trash2,
  BookOpen,
  ScrollText,
  Folder,
  Check
} from 'lucide-react';
import { DhikrItem, Language, LocalizedText } from '../constants';
import { renderText } from '../utils/renderText';
import { formatNumber } from '../i18n';

interface DhikrCardProps {
  item: DhikrItem;
  count: number;
  targetOverride?: number;
  onIncrement: () => void;
  onReset?: () => void;
  onEditTarget?: () => void;
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onFocus?: () => void;
  language?: Language;
  onEdit?: () => void;
  onDelete?: () => void;
  sections?: { id: string; name: LocalizedText }[];
  onMoveToCollection?: (sectionId: string) => void;
}

const stop = (e: React.MouseEvent) => e.stopPropagation();

const DhikrCard: React.FC<DhikrCardProps> = ({
  item,
  count,
  targetOverride,
  onIncrement,
  onReset,
  onEditTarget,
  getLocalizedText,
  isFavorite = false,
  onToggleFavorite,
  isPinned = false,
  onTogglePin,
  onFocus,
  language = 'en',
  onEdit,
  onDelete,
  sections,
  onMoveToCollection
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMoveMenuOpen, setIsMoveMenuOpen] = useState(false);
  const moveMenuRef = useRef<HTMLDivElement | null>(null);

  const target = Math.max(0, Number(targetOverride ?? item.target ?? 0) || 0);
  const isComplete = target > 0 && count >= target;
  const progressText = useMemo(
    () => (target > 0 ? `${formatNumber(count, language)} / ${formatNumber(target, language)}` : `${formatNumber(count, language)} / ∞`),
    [count, target, language]
  );
  const progress = target > 0 ? Math.min((count / target) * 100, 100) : 0;

  const transliteration = getLocalizedText(item.trn);
  const meaning = getLocalizedText(item.meaning);
  const isSurah = String(item.id).startsWith('surah_') || String(item.badge).toLowerCase() === 'surah';

  const readLabel = isExpanded
    ? getLocalizedText(isSurah ? { en: 'Hide Surah', bn: 'সূরা লুকান' } : { en: 'Hide Dua', bn: 'দুআ লুকান' })
    : getLocalizedText(isSurah ? { en: 'Read Surah', bn: 'সূরা পড়ুন' } : { en: 'Read Dua', bn: 'দুআ পড়ুন' });

  // Close the collection menu on an outside click instead of leaving it stuck open.
  useEffect(() => {
    if (!isMoveMenuOpen) return;
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!moveMenuRef.current?.contains(event.target as Node)) setIsMoveMenuOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [isMoveMenuOpen]);

  return (
    <div
      onClick={onIncrement}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onIncrement();
        }
      }}
      aria-label={`${getLocalizedText(item.title)} — ${progressText}`}
      className={`w-full rounded-[24px] border bg-card px-4 py-4 shadow-sm transition-all cursor-pointer select-none active:scale-[0.995] ${
        isComplete ? 'border-gold/70 shadow-gold/5' : 'border-border hover:border-gold/45'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isSurah && (
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold mb-1">
              <BookOpen size={10} />
              <span>{getLocalizedText({ en: 'Surah', bn: 'সূরা' })}</span>
            </div>
          )}
          {item.source && !isSurah && (
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em] text-gold mb-1">
              <ScrollText size={10} />
              <span>{item.source}</span>
            </div>
          )}
          <div className="flex min-w-0 items-start gap-2">
            <h3 className="min-w-0 flex-1 text-[1.02rem] sm:text-xl font-bold leading-[1.18] text-text-main">
              {getLocalizedText(item.title)}
            </h3>
            <span className="shrink-0 rounded-full bg-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-bg shadow-sm">
              {target > 0 ? `×${formatNumber(target, language)}` : '∞'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center justify-center">
        <button
          onClick={(e) => {
            stop(e);
            onIncrement();
          }}
          aria-label={getLocalizedText({ en: 'Count', bn: 'গণনা' })}
          className={`relative flex h-[78px] w-[78px] items-center justify-center rounded-full text-[2rem] font-bold text-white shadow-lg transition-all active:scale-95 ${
            isComplete ? 'bg-gold text-bg ring-4 ring-gold/25' : 'bg-green-primary'
          }`}
        >
          {formatNumber(count, language)}
          {isComplete && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-bg text-gold shadow">
              <Check size={14} strokeWidth={3} />
            </span>
          )}
        </button>
        <div className={`mt-2 text-[14px] font-bold tracking-wide tabular-nums ${isComplete ? 'text-gold' : 'text-gold/80'}`}>
          {progressText}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3" onClick={stop}>
        <button
          onClick={(e) => {
            stop(e);
            setIsExpanded((v) => !v);
          }}
          aria-expanded={isExpanded}
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-gold/10 px-4 py-2 text-[12px] font-bold text-gold transition-all hover:bg-gold/15"
        >
          {isSurah ? <BookOpen size={14} /> : <ScrollText size={14} />}
          {readLabel}
        </button>

        <div className="flex shrink-0 items-center gap-2">
          {onToggleFavorite ? (
            <button
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
              aria-label={getLocalizedText({ en: 'Favourite', bn: 'ফেভারিট' })}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all ${
                isFavorite
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border bg-bg text-text-muted hover:border-gold/40 hover:text-gold'
              }`}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          ) : null}

          {onTogglePin ? (
            <button
              onClick={onTogglePin}
              aria-pressed={isPinned}
              aria-label={getLocalizedText({ en: 'Pin', bn: 'পিন' })}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all ${
                isPinned
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-border bg-bg text-text-muted hover:border-gold/40 hover:text-gold'
              }`}
            >
              <Pin size={16} fill={isPinned ? 'currentColor' : 'none'} />
            </button>
          ) : null}

          {onFocus ? (
            <button
              onClick={onFocus}
              aria-label={getLocalizedText({ en: 'Focus Mode', bn: 'ফোকাস মোড' })}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-bg text-text-muted transition-all hover:border-gold/40 hover:text-gold"
            >
              <Maximize2 size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {isExpanded ? (
        // The whole card is a counter, so reading the dua used to add a count
        // with every tap — and selecting a line of text was impossible. The
        // detail panel swallows clicks and re-enables text selection.
        <div
          className="mt-5 space-y-4 border-t border-border/70 pt-4 cursor-auto select-text"
          onClick={stop}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {item.arabic ? (
            <div
              lang="ar"
              dir="rtl"
              className="arabic-text whitespace-pre-line text-right leading-[1.85] text-text-arabic"
              style={{ fontSize: 'var(--arabic-size)' }}
            >
              {renderText(item.arabic)}
            </div>
          ) : null}
          {transliteration ? (
            <p
              className="whitespace-pre-line italic leading-relaxed text-green-light"
              style={{ fontSize: 'calc(var(--english-size) * 0.875)' }}
            >
              {renderText(transliteration)}
            </p>
          ) : null}
          {meaning ? (
            <div
              className="whitespace-pre-line leading-relaxed text-text-main"
              style={{ fontSize: 'var(--english-size)' }}
            >
              {renderText(meaning)}
            </div>
          ) : null}
          {item.source || item.ref ? (
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted mt-2">
              <BookOpen size={10} />
              <span>{[item.source, item.ref].filter(Boolean).join(', ')}</span>
            </div>
          ) : null}
          {target > 0 ? (
            <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
              <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
            </div>
          ) : null}
        </div>
      ) : null}

      {onReset || onEditTarget || onEdit || onDelete || onMoveToCollection ? (
        <div className="mt-5 flex flex-wrap gap-2" onClick={stop}>
          {onEditTarget ? (
            <button
              onClick={onEditTarget}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-sub transition-all hover:border-gold/40 hover:text-gold"
            >
              <Target size={12} />
              {getLocalizedText({ en: 'Set Target', bn: 'সেট টার্গেট' })}
            </button>
          ) : null}
          {onReset ? (
            <button
              onClick={onReset}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-sub transition-all hover:border-gold/40 hover:text-gold"
            >
              <RotateCcw size={12} />
              {getLocalizedText({ en: 'Reset', bn: 'রিসেট' })}
            </button>
          ) : null}
          {onEdit ? (
            <button
              onClick={onEdit}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-bg px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-sub transition-all hover:border-gold/40 hover:text-gold"
            >
              <Edit3 size={12} />
              {getLocalizedText({ en: 'Edit', bn: 'এডিট' })}
            </button>
          ) : null}
          {onMoveToCollection && sections && sections.length > 1 ? (
            <div className="relative flex-1 min-w-[120px]" ref={moveMenuRef}>
              <button
                onClick={(e) => {
                  stop(e);
                  setIsMoveMenuOpen((open) => !open);
                }}
                aria-expanded={isMoveMenuOpen}
                className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border transition-all px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] ${
                  isMoveMenuOpen
                    ? 'border-gold bg-gold/5 text-gold'
                    : 'border-border bg-bg text-text-sub hover:border-gold/40 hover:text-gold'
                }`}
              >
                <Folder size={12} />
                {getLocalizedText({ en: 'Move', bn: 'সরান' })}
              </button>

              {isMoveMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full min-w-[160px] rounded-2xl border border-border bg-card p-2 shadow-xl z-10">
                  <p className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-text-muted border-b border-border/50 mb-1">
                    {getLocalizedText({ en: 'Move to Collection', bn: 'কালেকশন পরিবর্তন' })}
                  </p>
                  <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                    {sections.map((section) => (
                      <button
                        key={section.id}
                        onClick={(e) => {
                          stop(e);
                          onMoveToCollection(section.id);
                          setIsMoveMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors ${
                          item.sectionId === section.id ? 'bg-gold/10 text-gold' : 'text-text-main hover:bg-bg'
                        }`}
                      >
                        {getLocalizedText(section.name)}
                        {item.sectionId === section.id && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
          {onDelete ? (
            <button
              onClick={onDelete}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-red-500 transition-all hover:bg-red-500/10"
            >
              <Trash2 size={12} />
              {getLocalizedText({ en: 'Delete', bn: 'মুছুন' })}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default DhikrCard;
