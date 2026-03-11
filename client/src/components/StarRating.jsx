import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, interactive = false, onChange, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <div className="flex items-center space-x-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(rating);
        return (
          <Star
            key={i}
            className={`${sizeClass} ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-400 hover:fill-yellow-400 transition-colors' : ''}`}
            onClick={() => interactive && onChange && onChange(i + 1)}
          />
        );
      })}
    </div>
  );
}
