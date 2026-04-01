import React from 'react';
import { Info } from 'lucide-react';

interface SourceBadgeProps {
  src?: string;
  refCode?: string;
  className?: string;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ src, refCode, className = "" }) => {
  if (!src) return null;
  return (
    <div className={`flex items-center gap-1 text-[10px] font-bold text-[#E0E7E4]/40 uppercase tracking-widest ${className}`}>
      <Info size={10} />
      <span>{src} {refCode}</span>
    </div>
  );
};

export default SourceBadge;
