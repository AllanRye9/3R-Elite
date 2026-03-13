'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Listing } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface Props {
  listing: Listing;
}

export function ContactSellerModal({ listing }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(`Hi, I'm interested in "${listing.title}". Is it still available?`);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const whatsappUrl = listing.user.phone
    ? `https://wa.me/${listing.user.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your listing: ${listing.title}`)}`
    : null;

  const handleSend = async () => {
    if (!user) { router.push('/auth/login'); return; }
    setLoading(true);
    try {
      await api.post('/messages', {
        receiverId: listing.userId,
        listingId: listing.id,
        content: message,
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors"
        >
          Contact Seller
        </button>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors text-center"
          >
            💬 WhatsApp
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {sent ? (
        <div className="text-center py-4">
          <p className="text-green-600 font-semibold">Message sent! ✓</p>
          <p className="text-sm text-gray-500 mt-1">The seller will reply soon.</p>
          <button onClick={() => router.push('/messages')} className="mt-3 text-sky-600 text-sm underline">
            View Messages
          </button>
        </div>
      ) : (
        <>
          <h3 className="font-semibold mb-3">Send Message to Seller</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSend}
              disabled={loading || !message.trim()}
              className="flex-1 bg-sky-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-sky-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
