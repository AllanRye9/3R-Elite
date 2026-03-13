'use client';

import Link from 'next/link';

interface SideCardItem {
  label: string;
  icon: string;
  href: string;
}

const leftItems: SideCardItem[] = [
  { label: 'Electronics', icon: '💻', href: '/listings?q=electronics' },
  { label: 'Vehicles', icon: '🚗', href: '/listings?q=vehicles' },
  { label: 'Real Estate', icon: '🏠', href: '/listings?q=real+estate' },
];

const rightItems: SideCardItem[] = [
  { label: 'Fashion', icon: '👗', href: '/listings?q=fashion' },
  { label: 'Jobs', icon: '💼', href: '/listings?q=jobs' },
  { label: 'Services', icon: '🔧', href: '/listings?q=services' },
];

function SideCard({ items, side }: { items: SideCardItem[]; side: 'left' | 'right' }) {
  return (
    <div
      className={`hidden lg:flex flex-col gap-2 justify-center absolute top-0 bottom-0 z-10 w-[20%] px-3 ${
        side === 'left' ? 'left-0' : 'right-0'
      }`}
    >
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2.5 shadow-sm border border-white/60 hover:bg-white hover:shadow-md transition-all duration-200 interactive group"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
          <span className="text-xs font-semibold text-gray-700 group-hover:text-sky-700 truncate">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function HeroSideCards() {
  return (
    <>
      <SideCard items={leftItems} side="left" />
      <SideCard items={rightItems} side="right" />
    </>
  );
}
