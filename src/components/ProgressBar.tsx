import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  /** 0–100. */
  progress: number;
  isDone?: boolean;
  /** Track height in pixels. */
  height?: number;
  className?: string;
}

/**
 * `height` is a pixel number, not a Tailwind class fragment. Focus Mode used to
 * pass `height={12}` into a `className={\`w-full ${height}\`}` slot, producing
 * `class="w-full 12"` — an unstyled div with no height, so the progress bar was
 * invisible there.
 */
const ProgressBar: React.FC<ProgressBarProps> = ({ progress, isDone = false, height = 4, className = '' }) => {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(progress) ? progress : 0));

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-black/20 ${className}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.3 }}
        className={`h-full rounded-full ${isDone ? 'bg-gold' : 'bg-green-light'}`}
      />
    </div>
  );
};

export default ProgressBar;
