import React from 'react';
import { LocalizedText } from '../constants';

interface SectionBlockProps {
  title: LocalizedText | string;
  /**
   * Pre-formatted by the caller, which knows the language.
   *
   * Was `number`, printed raw — so a Bangla screen showed ৩৩ on a card and 33
   * in the heading above it.
   */
  count?: React.ReactNode;
  subtitle?: LocalizedText | string;
  getLocalizedText: (text: LocalizedText | string | undefined) => string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const SectionBlock: React.FC<SectionBlockProps> = ({
  title,
  count,
  subtitle,
  getLocalizedText,
  children,
  action,
  className = ''
}) => {
  return (
    <section className={`space-y-3 ${className}`}>
      <div className="px-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-text-main">{getLocalizedText(title)}</h2>
              {count !== undefined && count !== null ? (
                <span className="inline-flex items-center rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-gold-ink">
                  {count}
                </span>
              ) : null}
            </div>
            {subtitle ? <p className="mt-1 text-sm leading-relaxed text-text-sub">{getLocalizedText(subtitle)}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
};

export default SectionBlock;
