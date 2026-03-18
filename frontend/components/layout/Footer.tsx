import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-elite-navy text-gray-300">
      {/* Main footer content - hidden on mobile, shown on md+ */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-elite-gold/20 rounded-lg flex items-center justify-center font-black text-elite-gold text-sm border border-elite-gold/30">3R</div>
                <span className="font-extrabold text-white text-lg tracking-tight">
                  <span>3R</span> <span className="font-serif italic text-elite-gold">Elite</span>
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-4 max-w-xs text-gray-300">
                The premier online marketplace connecting buyers and sellers across UAE and Uganda. Safe, fast, and free to list.
              </p>
              {/* Get Social */}
              <h4 className="text-white font-bold mb-3 text-sm uppercase tracking-wide">Get Social</h4>
              <div className="flex gap-2">
                {[
                  { label: 'Facebook', icon: 'f', href: '#' },
                  { label: 'Twitter / X', icon: 'X', href: '#' },
                  { label: 'Instagram', icon: '📷', href: '#' },
                  { label: 'WhatsApp', icon: '💬', href: '#' },
                  { label: 'YouTube', icon: '▶', href: '#' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-lg bg-white/10 hover:bg-elite-gold hover:text-white flex items-center justify-center text-xs text-gray-300 transition-colors interactive"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide border-b border-white/10 pb-2">Company</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/about" className="text-gray-300 hover:text-elite-gold transition-colors">About Us</Link></li>
                <li><Link href="/advertising" className="text-gray-300 hover:text-elite-gold transition-colors">Advertising</Link></li>
                <li><Link href="/blog" className="text-gray-300 hover:text-elite-gold transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-300 hover:text-elite-gold transition-colors">Careers</Link></li>
                <li><Link href="/press" className="text-gray-300 hover:text-elite-gold transition-colors">Press</Link></li>
              </ul>
            </div>

            {/* Our Locations */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide border-b border-white/10 pb-2">Our Locations</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/listings?country=UAE" className="text-gray-300 hover:text-elite-gold transition-colors">🇦🇪 UAE</Link></li>
                <li><Link href="/listings?country=UAE&location=Dubai" className="text-gray-300 hover:text-elite-gold transition-colors">Dubai</Link></li>
                <li><Link href="/listings?country=UAE&location=Abu+Dhabi" className="text-gray-300 hover:text-elite-gold transition-colors">Abu Dhabi</Link></li>
                <li><Link href="/listings?country=UGANDA" className="text-gray-300 hover:text-elite-gold transition-colors">🇺🇬 Uganda</Link></li>
                <li><Link href="/listings?country=UGANDA&location=Kampala" className="text-gray-300 hover:text-elite-gold transition-colors">Kampala</Link></li>
                <li><Link href="/listings?country=UGANDA&location=Wakiso" className="text-gray-300 hover:text-elite-gold transition-colors">Wakiso</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide border-b border-white/10 pb-2">Support</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/help" className="text-gray-300 hover:text-elite-gold transition-colors">Help Center</Link></li>
                <li><a href="mailto:support@3relite.com" className="text-gray-300 hover:text-elite-gold transition-colors">Contact Us</a></li>
                <li><Link href="/safety" className="text-gray-300 hover:text-elite-gold transition-colors">Safety Tips</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-elite-gold transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-300 hover:text-elite-gold transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Compact mobile footer - shown only below md */}
      <div className="md:hidden px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-7 h-7 bg-elite-gold/20 rounded-lg flex items-center justify-center font-black text-elite-gold text-xs border border-elite-gold/30">3R</div>
          <span className="font-extrabold text-white text-base tracking-tight">
            <span>3R</span> <span className="font-serif italic text-elite-gold">Elite</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 text-xs mb-4">
          <Link href="/about" className="text-gray-300 hover:text-elite-gold transition-colors">About</Link>
          <Link href="/blog" className="text-gray-300 hover:text-elite-gold transition-colors">Blog</Link>
          <Link href="/safety" className="text-gray-300 hover:text-elite-gold transition-colors">Safety Tips</Link>
          <Link href="/help" className="text-gray-300 hover:text-elite-gold transition-colors">Help Center</Link>
          <a href="mailto:support@3relite.com" className="text-gray-300 hover:text-elite-gold transition-colors">Contact</a>
          <Link href="/privacy" className="text-gray-300 hover:text-elite-gold transition-colors">Privacy</Link>
          <Link href="/terms" className="text-gray-300 hover:text-elite-gold transition-colors">Terms</Link>
        </div>
        <div className="flex justify-center gap-3 mb-4">
          {[
            { label: 'Facebook', icon: 'f', href: '#' },
            { label: 'Twitter', icon: 'X', href: '#' },
            { label: 'Instagram', icon: '📷', href: '#' },
            { label: 'WhatsApp', icon: '💬', href: '#' },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-elite-gold flex items-center justify-center text-xs text-gray-300 transition-colors interactive"
            >
              {s.icon}
            </a>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400">&copy; {new Date().getFullYear()} 3R-Elite Marketplace</p>
      </div>

      {/* Bottom bar - desktop only */}
      <div className="hidden md:block border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p className="text-gray-300">&copy; {new Date().getFullYear()} 3R-Elite Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-gray-300 hover:text-elite-gold transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-300 hover:text-elite-gold transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

