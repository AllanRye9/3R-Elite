'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Message } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { timeAgo } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Message[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    if (user) {
      api.get('/messages')
        .then(({ data }) => setConversations(data))
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [user, loading, router]);

  if (loading || fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
      {conversations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center text-gray-500">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-medium">No conversations yet</p>
          <p className="text-sm mt-1">Start by contacting a seller on any listing</p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.senderId === user?.id ? conv.receiver : conv.sender;
            return (
              <a
                key={conv.id}
                href={`/messages/${conv.listingId}/${other.id}`}
                className="flex items-center gap-3 sm:gap-4 bg-white rounded-xl shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <UserAvatar user={other} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold truncate">{other.name}</p>
                    <span className="text-xs text-gray-400 shrink-0">{timeAgo(conv.createdAt)}</span>
                  </div>
                  {conv.listing && (
                    <p className="text-xs text-sky-600 mb-1 truncate">Re: {conv.listing.title}</p>
                  )}
                  <p className={`text-sm truncate ${!conv.read && conv.receiverId === user?.id ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                    {conv.content}
                  </p>
                </div>
                {conv.listing?.images?.[0] && (
                  <Image
                    src={conv.listing.images[0]}
                    alt=""
                    width={56}
                    height={56}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover shrink-0"
                  />
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
