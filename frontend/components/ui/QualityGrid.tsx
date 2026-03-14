import React from 'react';

const qualities = [
  { label: '4K', value: '4k' },
  { label: '1080p', value: '1080p' },
  { label: '720p', value: '720p' },
  { label: 'MP3', value: 'mp3' },
];

export const QualityGrid: React.FC<{
  selected: string;
  onSelect: (val: string) => void;
}> = ({ selected, onSelect }) => (
  <div className="grid grid-cols-2 gap-3 my-4">
    {qualities.map((q) => (
      <button
        key={q.value}
        className={`rounded-xl px-4 py-3 font-mono text-lg font-bold border transition-all shadow-sm
          ${selected === q.value ? 'bg-elite-gold text-elite-navy border-elite-gold' : 'bg-[#181C24] text-white border-[#23272F] hover:bg-elite-gold/10 hover:text-elite-gold'}`}
        onClick={() => onSelect(q.value)}
        type="button"
      >
        {q.label}
      </button>
    ))}
  </div>
);
