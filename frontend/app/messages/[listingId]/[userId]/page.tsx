'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Message } from '@/lib/types';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { formatDate, timeAgo } from '@/lib/utils';

function MessageThreadPageContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ listingId: string; userId: string }>();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [listingTitle, setListingTitle] = useState(searchParams?.get('listingTitle') || 'Listing conversation');
  const [participantName, setParticipantName] = useState(searchParams?.get('name') || 'Seller');
  const [content, setContent] = useState('');
  const [fetching, setFetching] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user || !params?.listingId || !params?.userId) return;

    setFetching(true);
    setError('');

    Promise.all([
      api.get(`/messages/${params.listingId}/${params.userId}`),
      api.get(`/listings/${params.listingId}`),
    ])
      .then(([messagesResponse, listingResponse]) => {
        const thread = messagesResponse.data as Message[];
        setMessages(thread);
        if (listingResponse.data?.title) {
          setListingTitle(listingResponse.data.title);
        }
        const matched = thread.find((message) => message.sender.id !== user.id);
        if (matched?.sender?.name) {
          setParticipantName(matched.sender.name);
        }
      })
      .catch(() => setError('Failed to load this conversation.'))
      .finally(() => setFetching(false));
  }, [params?.listingId, params?.userId, user]);

  const otherParticipant = useMemo(() => {
    const matched = messages.find((message) => message.sender.id !== user?.id)?.sender;
    return matched || { id: params?.userId || '', name: participantName, avatar: undefined };
  }, [messages, params?.userId, participantName, user?.id]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim() || !params?.listingId || !params?.userId) return;

    setSending(true);
    setError('');

    try {
      await api.post('/messages', {
        receiverId: params.userId,
        listingId: params.listingId,
        content: content.trim(),
      });

      const { data } = await api.get(`/messages/${params.listingId}/${params.userId}`);
      setMessages(data);
      setContent('');
    } catch {
      setError('Unable to send the message right now.');
    } finally {
      setSending(false);
    }
  };

  if (loading || fetching) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Loading conversation…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link href="/messages" className="text-sm font-medium text-sky-700 hover:text-sky-800 transition-colors">
            Back to messages
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{participantName}</h1>
          <p className="text-sm text-gray-600 mt-1">
            About <span className="font-semibold text-gray-900">{listingTitle}</span>
          </p>
        </div>
        <Link
          href={`/listings/${params?.listingId}`}
          className="inline-flex items-center gap-2 rounded-lg bg-elite-gold px-4 py-2 text-sm font-semibold text-white hover:bg-elite-gold-dark transition-colors"
        >
          View listing
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 px-4 sm:px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <UserAvatar user={otherParticipant} size="md" />
            <div>
              <p className="font-semibold text-gray-900">{participantName}</p>
              <p className="text-xs text-gray-500">{messages.length} message{messages.length === 1 ? '' : 's'} in this thread</p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-5 space-y-3 max-h-[60vh] overflow-y-auto bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-gray-500">
              No messages yet. Start the conversation below.
            </div>
          ) : (
            messages.map((message) => {
              const mine = message.sender.id === user?.id;

              return (
                <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${mine ? 'bg-elite-gold text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md border border-slate-100'}`}>
                    <div className={`text-[11px] font-semibold mb-1 ${mine ? 'text-white/80' : 'text-sky-700'}`}>
                      {mine ? 'You' : message.sender.name}
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <div className={`mt-2 text-[11px] ${mine ? 'text-white/75' : 'text-gray-400'}`}>
                      {timeAgo(message.createdAt)} · {formatDate(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={sendMessage} className="border-t border-gray-100 p-4 sm:p-5 bg-white space-y-3">
          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your message here"
            rows={4}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 resize-y"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !content.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-elite-gold px-4 py-2 text-sm font-semibold text-white hover:bg-elite-gold-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MessageThreadPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-12 text-center text-gray-500">Loading conversation…</div>}>
      <MessageThreadPageContent />
    </Suspense>
  );
}