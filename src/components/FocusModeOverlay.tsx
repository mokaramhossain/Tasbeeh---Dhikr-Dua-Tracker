import React from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { DhikrItem, LocalizedText } from '../constants';
import ProgressBar from './ProgressBar';
import { renderText } from '../utils/renderText';

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
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
}

const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({ item, count, target, onIncrement, onReset, onClose, onPrev, onNext, hasPrev, hasNext, getLocalizedText }) => {
  const progress = target > 0 ? Math.min(Math.round((count / target) * 100), 100) : 0;
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-bg flex flex-col">
      <div className="border-b border-border p-5 flex items-center justify-between">
        <button onClick={(e)=>{stop(e); onClose();}} className="p-2 hover:bg-card rounded-xl transition-colors text-text-muted"><X size={24} /></button>
        <div className="flex flex-col items-center text-center"><span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-1">{getLocalizedText({ en: 'Focus Mode', bn: 'ফোকাস মোড' })}</span><h2 className="text-sm font-bold text-text-main">{getLocalizedText(item.title)}</h2></div>
        <div className="w-10" />
      </div>
      <div onClick={onIncrement} className="flex-1 overflow-y-auto px-5 py-10 flex flex-col items-center text-center cursor-pointer">
        <div className="max-w-xl w-full space-y-10">
          <div className="space-y-5">
            <div className="whitespace-pre-line arabic-text text-[2.4rem] md:text-[3rem] leading-[1.85] text-text-arabic text-right">{renderText(item.arabic)}</div>
            <p className="whitespace-pre-line text-base text-green-light font-medium italic opacity-90">{renderText(getLocalizedText(item.trn))}</p>
          </div>
          <div className="p-6 bg-card rounded-[2rem] border border-border"><div className="whitespace-pre-line text-lg text-text-main/90 leading-relaxed">{renderText(getLocalizedText(item.meaning))}</div></div>
          {item.benefit ? <div className="text-left p-5 bg-gold/6 rounded-2xl border border-gold/10"><p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-2">{getLocalizedText({ en: 'Benefit', bn: 'ফজিলত' })}</p><div className="whitespace-pre-line text-sm text-text-sub leading-relaxed">{renderText(getLocalizedText(item.benefit))}</div></div> : null}
        </div>
      </div>
      <div onClick={onIncrement} className="p-5 bg-card border-t border-border space-y-6 cursor-pointer">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="flex justify-between items-end"><div className="flex items-center gap-3"><span className="text-4xl font-bold text-text-main">{count}</span><span className="text-lg text-text-muted font-bold">/ {target > 0 ? target : '∞'}</span></div><button onClick={(e)=>{stop(e); onReset();}} className="p-2 text-text-muted hover:text-gold transition-colors"><RotateCcw size={20} /></button></div>
          <ProgressBar progress={progress} height={12} />
        </div>
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <button onClick={(e)=>{stop(e); onPrev?.();}} disabled={!hasPrev} className="w-16 h-16 bg-bg rounded-3xl border border-border flex items-center justify-center text-text-main active:scale-95 transition-all disabled:opacity-30"><ChevronLeft size={28} /></button>
          <button onClick={(e)=>{stop(e); onIncrement();}} className="flex-1 h-16 bg-gold rounded-3xl flex items-center justify-center text-bg active:scale-95 transition-all shadow-lg"><span className="text-xl font-bold uppercase tracking-[0.18em]">{getLocalizedText({ en: 'Count', bn: 'গণনা' })}</span></button>
          <button onClick={(e)=>{stop(e); onNext?.();}} disabled={!hasNext} className="w-16 h-16 bg-bg rounded-3xl border border-border flex items-center justify-center text-text-main active:scale-95 transition-all disabled:opacity-30"><ChevronRight size={28} /></button>
        </div>
      </div>
    </motion.div>
  );
};

export default FocusModeOverlay;
