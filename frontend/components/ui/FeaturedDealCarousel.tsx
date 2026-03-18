'use client';

import { useEffect, useState } from 'react';

export default function FeaturedDealCarousel({ initialCards }: { initialCards: React.ReactNode[] }) {
  const [cards, setCards] = useState(initialCards);

  useEffect(() => {
    const interval = setInterval(() => {
      setCards((prev) => {
        if (prev.length <= 1) return prev;
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-auto scrollable-x">
      <style jsx>{`
        .scrollable-x {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .scrollable-x::-webkit-scrollbar {
          height: 6px;
        }
        .scrollable-x::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 20px;
        }
        .scrollable-x::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 20px;
        }
        .scrollable-x::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div className="flex gap-4 w-[900px] max-w-full">
        {cards}
      </div>
    </div>
  );
}