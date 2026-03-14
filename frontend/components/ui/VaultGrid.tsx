import React from 'react';

export const VaultGrid: React.FC<{ downloads: Array<{
  id: string;
  name: string;
  thumb: string;
  size: string;
  date: string;
}> }> = ({ downloads }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
    {downloads.map(dl => (
      <div key={dl.id} className="rounded-xl bg-[#181C24] border border-[#23272F] p-3 flex flex-col items-center shadow hover:shadow-lg transition-all">
        <img src={dl.thumb} alt={dl.name} className="w-16 h-16 rounded-lg object-cover mb-2" style={{ aspectRatio: '1/1' }} />
        <div className="font-mono text-xs text-white truncate w-full text-center">{dl.name}</div>
        <div className="text-[10px] text-elite-gold font-bold mt-1">{dl.size}</div>
        <div className="text-[10px] text-gray-400 mt-0.5">{dl.date}</div>
      </div>
    ))}
  </div>
);
