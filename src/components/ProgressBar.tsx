import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  progress: number;
  isDone: boolean;
  height?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  isDone, 
  height = "h-1",
  className = ""
}) => {
  return (
    <div className={`w-full ${height} bg-black/20 overflow-hidden ${className}`}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className={`h-full ${isDone ? 'bg-gold' : 'bg-green-light'} transition-all duration-300`}
      />
    </div>
  );
};

export default ProgressBar;
