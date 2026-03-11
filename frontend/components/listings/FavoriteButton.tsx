'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Props {
  listingId: string;
}

export function FavoriteButton({ listingId }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      api.get(`/listings/${listingId}/favorites`)
        .then(({ data }) => setFavorited(data.favorited))
        .catch(() => {});
    }
  }, [listingId, user]);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { router.push('/auth/login'); return; }
    setLoading(true);
    try {
      const { data } = await api.post(`/listings/${listingId}/favorite`);
      setFavorited(data.favorited);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="bg-white/80 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center hover:bg-white transition-colors shadow"
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      {favorited ? '❤️' : '🤍'}
    </button>
  );
}
