import React from 'react';

export const BatchModeInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => (
  <textarea
    className="w-full min-h-[120px] rounded-xl bg-[#181C24] border border-[#23272F] text-white font-mono p-4 text-base shadow focus:ring-2 focus:ring-elite-gold/60 transition-all"
    placeholder="Paste multiple links, one per line..."
    value={value}
    onChange={e => onChange(e.target.value)}
  />
);
