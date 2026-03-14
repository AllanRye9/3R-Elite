import React, { useState } from 'react';
import { ProgressCard } from './ProgressCard';
import { QualityGrid } from './QualityGrid';
import { VaultGrid } from './VaultGrid';
import { BatchModeInput } from './BatchModeInput';

const mockDownloads = [
  { id: '1', name: 'LuxuryCar.mp4', thumb: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop', size: '1.2 GB', date: '2026-03-14' },
  { id: '2', name: 'Brochure.pdf', thumb: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=100&h=100&fit=crop', size: '4.0 MB', date: '2026-03-13' },
];

export const EliteDemoPanel: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState('1080p');
  const [batchMode, setBatchMode] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Simulate progress for demo
  React.useEffect(() => {
    if (progress < 100 && !isLoading) {
      const t = setTimeout(() => setProgress(p => Math.min(100, p + 10)), 500);
      return () => clearTimeout(t);
    } else if (progress === 100) {
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 1200);
    }
  }, [progress, isLoading]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
        <button
          className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${batchMode ? 'bg-elite-gold text-elite-navy' : 'bg-[#181C24] text-white border border-[#23272F]'}`}
          onClick={() => setBatchMode(b => !b)}
        >
          {batchMode ? 'Single Mode' : 'Batch Mode'}
        </button>
        <span className="text-xs text-gray-400">Toggle to switch input mode</span>
      </div>
      {batchMode ? (
        <BatchModeInput value={batchInput} onChange={setBatchInput} />
      ) : (
        <>
          <QualityGrid selected={quality} onSelect={setQuality} />
          <ProgressCard
            fileName={`EliteFile.${quality === 'mp3' ? 'mp3' : 'mp4'}`}
            fileSize="1.2 GB / 4.0 GB"
            speed="12.5 MB/s"
            timeRemaining="00:45"
            progress={progress}
            isLoading={isLoading}
            isCelebrating={isCelebrating}
            onOpen={() => alert('File opened!')}
          />
        </>
      )}
      <h3 className="mt-8 mb-2 text-lg font-bold text-elite-gold">Recent Downloads (Vault)</h3>
      <VaultGrid downloads={mockDownloads} />
    </div>
  );
};
