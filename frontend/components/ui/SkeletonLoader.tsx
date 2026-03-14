import React from 'react';

export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse shimmer rounded-xl bg-white/10 ${className}`} style={{ minHeight: 120 }}>
    <div className="flex items-center gap-4 p-4">
      <div className="w-16 h-16 bg-gray-300/30 rounded-full shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300/30 rounded w-1/2 shimmer" />
        <div className="h-3 bg-gray-300/20 rounded w-1/3 shimmer" />
        <div className="h-3 bg-gray-300/20 rounded w-1/4 shimmer" />
      </div>
    </div>
  </div>
);
