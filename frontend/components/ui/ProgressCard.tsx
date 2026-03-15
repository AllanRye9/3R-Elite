import React from 'react';
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
  if (isLoading) return <SkeletonLoader className="w-full max-w-xs mx-auto my-2" />;
  return (
    <div className={`bg-[#e0f2fe] rounded-xl border border-elite-gold/30 shadow-sm overflow-hidden hover:shadow-lg transition-shadow flex flex-col items-center p-3 w-48 min-w-[11rem] max-w-xs mx-1 ${isCelebrating ? 'animate-pulse-glow ring-2 ring-elite-gold/60' : ''}`}>
      <ProgressRing progress={progress} size={48} strokeWidth={5} color={isCelebrating ? '#C5A059' : '#0EA5E9'} />
      <div className="mt-2 w-full text-center">
        <div className="font-mono text-elite-navy text-xs mb-0.5 truncate">{fileName}</div>
        <div className="flex justify-center gap-2 text-[10px] text-elite-navy/70 font-mono mb-1 flex-wrap">
          <span>Speed: <span className="text-elite-gold font-bold">{speed}</span></span>
          <span>Left: <span className="text-elite-gold font-bold">{timeRemaining}</span></span>
          <span>Size: <span className="text-elite-gold font-bold">{fileSize}</span></span>
        </div>
        {progress >= 100 ? (
          <button
            className="mt-1 px-3 py-1.5 rounded-lg bg-elite-gold text-elite-navy font-bold shadow hover:bg-elite-gold-dark transition-all animate-bounce-subtle text-xs"
            onClick={onOpen}
          >
            Open File
          </button>
        ) : null}
      </div>
    </div>
  );
};
