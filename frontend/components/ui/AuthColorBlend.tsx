'use client';

import { ReactNode, useRef } from 'react';

interface AuthColorBlendProps {
  children: ReactNode;
  className?: string;
}

const blobs = [
  {
    className: 'absolute -top-24 -left-20 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl motion-safe:animate-[float_8s_ease-in-out_infinite]',
    style: { animationDelay: '0s' },
  },
  {
    className: 'absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl motion-safe:animate-[float_10s_ease-in-out_infinite]',
    style: { animationDelay: '0.6s' },
  },
  {
    className: 'absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-amber-300/25 blur-3xl motion-safe:animate-[float_9s_ease-in-out_infinite]',
    style: { animationDelay: '1.2s' },
  },
  {
    className: 'absolute bottom-0 right-0 h-64 w-64 rounded-full bg-violet-400/25 blur-3xl motion-safe:animate-[float_11s_ease-in-out_infinite]',
    style: { animationDelay: '1.8s' },
  },
];

export default function AuthColorBlend({ children, className = '' }: AuthColorBlendProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const root = rootRef.current;
    if (!root) return;

    const rect = root.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    root.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`);
    root.style.setProperty('--my', `${(py * 100).toFixed(2)}%`);

    const tiltX = ((py - 0.5) * -8).toFixed(2);
    const tiltY = ((px - 0.5) * 8).toFixed(2);
    root.style.setProperty('--tilt-x', `${tiltX}deg`);
    root.style.setProperty('--tilt-y', `${tiltY}deg`);
  };

  const handlePointerLeave = () => {
    const root = rootRef.current;
    if (!root) return;

    root.style.setProperty('--mx', '50%');
    root.style.setProperty('--my', '50%');
    root.style.setProperty('--tilt-x', '0deg');
    root.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <div
      ref={rootRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative min-h-[78vh] overflow-hidden px-4 py-8 sm:py-12 [--mx:50%] [--my:50%] [--tilt-x:0deg] [--tilt-y:0deg] ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-cyan-600 to-fuchsia-600 dark:from-slate-900 dark:via-indigo-900 dark:to-fuchsia-900" />
      <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,0.08),rgba(255,255,255,0)_35%,rgba(255,255,255,0.08)_65%,rgba(255,255,255,0))] dark:bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,0.04),rgba(255,255,255,0)_35%,rgba(255,255,255,0.04)_65%,rgba(255,255,255,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.22),transparent_35%),radial-gradient(circle_at_85%_25%,rgba(250,204,21,0.22),transparent_34%),radial-gradient(circle_at_50%_90%,rgba(236,72,153,0.2),transparent_38%)] dark:bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.2),transparent_35%),radial-gradient(circle_at_85%_25%,rgba(217,70,239,0.22),transparent_34%),radial-gradient(circle_at_50%_90%,rgba(99,102,241,0.18),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 transition-all duration-300 ease-out bg-[radial-gradient(520px_circle_at_var(--mx)_var(--my),rgba(255,255,255,0.24),transparent_55%)] dark:bg-[radial-gradient(520px_circle_at_var(--mx)_var(--my),rgba(56,189,248,0.24),transparent_55%)]" />
      <div className="absolute inset-0 bg-black/0 dark:bg-black/25 [@media(prefers-contrast:more)]:bg-black/10 dark:[@media(prefers-contrast:more)]:bg-black/40" />

      <div className="absolute inset-0 transition-transform duration-300 ease-out will-change-transform [transform:perspective(1000px)_rotateX(var(--tilt-x))_rotateY(var(--tilt-y))]">
        {blobs.map((blob, index) => (
          <div key={index} aria-hidden="true" className={blob.className} style={blob.style} />
        ))}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
