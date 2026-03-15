"use client";
import React, { useState } from 'react';
import { ProgressCard } from './ProgressCard';

const demoCards = [
  { fileName: 'LuxuryCar.mp4', fileSize: '1.2 GB / 4.0 GB', speed: '12.5 MB/s', timeRemaining: '00:45', progress: 80 },
  { fileName: 'Brochure.pdf', fileSize: '4.0 MB / 4.0 MB', speed: '2.1 MB/s', timeRemaining: '00:00', progress: 100 },
  { fileName: 'EliteSong.mp3', fileSize: '8.2 MB / 10.0 MB', speed: '1.5 MB/s', timeRemaining: '00:12', progress: 82 },
  { fileName: 'PromoClip.mov', fileSize: '500 MB / 1.0 GB', speed: '5.0 MB/s', timeRemaining: '01:40', progress: 50 },
  { fileName: 'Document.docx', fileSize: '2.0 MB / 2.0 MB', speed: '1.0 MB/s', timeRemaining: '00:00', progress: 100 },
];

export const ProgressCarousel: React.FC = () => {
  const [index, setIndex] = useState(0);
  const visible = 4;
  const total = demoCards.length;

  const next = () => setIndex(i => (i + 1) % total);
  const prev = () => setIndex(i => (i - 1 + total) % total);

  // Circular slice logic
  const getCards = () => {
    const cards = [];
    for (let i = 0; i < visible; i++) {
      cards.push(demoCards[(index + i) % total]);
    }
    return cards;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2">
        <button onClick={prev} className="w-8 h-8 rounded-full bg-elite-gold text-elite-navy font-bold flex items-center justify-center shadow hover:bg-elite-gold-dark transition-all" aria-label="Previous">
          &#8592;
        </button>
        <div className="flex gap-2">
          {getCards().map((props, i) => (
            <ProgressCard key={i} {...props} />
          ))}
        </div>
        <button onClick={next} className="w-8 h-8 rounded-full bg-elite-gold text-elite-navy font-bold flex items-center justify-center shadow hover:bg-elite-gold-dark transition-all" aria-label="Next">
          &#8594;
        </button>
      </div>
      <div className="flex gap-1 mt-1">
        {demoCards.map((_, i) => (
          <span key={i} className={`w-2 h-2 rounded-full ${i === index ? 'bg-elite-gold' : 'bg-elite-navy/20'}`} />
        ))}
      </div>
    </div>
  );
};
