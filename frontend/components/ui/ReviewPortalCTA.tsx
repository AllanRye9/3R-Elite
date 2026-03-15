import React from 'react';
import Link from 'next/link';

export default function ReviewPortalCTA() {
  return (
    <section className="bg-elite-navy text-white py-10 px-4 border-t border-elite-gold/10">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-extrabold mb-2">Share Your Experience</h2>
        <p className="text-elite-gold text-sm mb-5">Help us build a trusted community. Leave a review or read what others have to say.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/reviews" className="bg-elite-gold text-elite-navy font-bold px-6 py-3 rounded-lg hover:bg-elite-gold-light transition-all interactive shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-elite-gold">
            Read Reviews
          </Link>
          <Link href="/reviews/submit" className="bg-white text-elite-navy font-bold px-6 py-3 rounded-lg hover:bg-elite-gold/20 transition-all interactive shadow-lg hover:shadow-xl hover:-translate-y-0.5 border border-elite-gold">
            Write a Review
          </Link>
        </div>
      </div>
    </section>
  );
}
