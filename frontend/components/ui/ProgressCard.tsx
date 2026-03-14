import React, { useState } from 'react';
import { ProgressRing } from './ProgressRing';
import { SkeletonLoader } from './SkeletonLoader';

interface ProgressCardProps {
  fileName?: string;
  fileSize?: string;
  speed?: string;
  timeRemaining?: string;
  progress: number;
  isLoading?: boolean;
  onOpen?: () => void;
  isCelebrating?: boolean;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
  fileName = 'File.mp4',
  fileSize = '1.2 GB / 4.0 GB',
  speed = '12.5 MB/s',
  timeRemaining = '00:45',
  progress,
  isLoading = false,
  onOpen,
  isCelebrating = false,
}) => {
  if (isLoading) return <SkeletonLoader className="w-full max-w-md mx-auto my-6" />;
  return (
    <div className={`w-full max-w-md mx-auto my-6 p-5 rounded-2xl bg-[#181C24] border border-[#23272F] shadow-xl flex flex-col items-center transition-all ${isCelebrating ? 'animate-pulse-glow ring-4 ring-elite-gold/60' : ''}`}>
      <ProgressRing progress={progress} color={isCelebrating ? '#C5A059' : '#0EA5E9'} />
      <div className="mt-4 w-full text-center">
        <div className="font-mono text-white text-base mb-1 truncate">{fileName}</div>
        <div className="flex justify-center gap-4 text-xs text-gray-400 font-mono mb-2">
          <span>Speed: <span className="text-elite-gold font-bold">{speed}</span></span>
          <span>Time Left: <span className="text-elite-gold font-bold">{timeRemaining}</span></span>
          <span>Size: <span className="text-elite-gold font-bold">{fileSize}</span></span>
        </div>
        {progress >= 100 ? (
          <button
            className="mt-2 px-5 py-2 rounded-lg bg-elite-gold text-elite-navy font-bold shadow hover:bg-elite-gold-dark transition-all animate-bounce-subtle"
            onClick={onOpen}
          >
            Open File
          </button>
        ) : null}
      </div>
    </div>
  );
};
