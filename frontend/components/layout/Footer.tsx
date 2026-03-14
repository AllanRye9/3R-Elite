import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Main footer content - hidden on mobile, shown on md+ */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center font-black text-white text-sm">3R</div>
                <span className="font-extrabold text-white text-lg tracking-tight">Elite</span>
              </div>
              <p className="text-sm leading-relaxed mb-4 max-w-xs">
                The premier online marketplace connecting buyers and sellers across UAE and Uganda. Safe, fast, and free to list.
              </p>
              {/* Social links */}
              <div className="flex gap-2">
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
                    className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-600 flex items-center justify-center text-xs transition-colors interactive"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Browse */}
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Browse</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/listings?country=UAE" className="hover:text-sky-400 transition-colors">🇦🇪 UAE Listings</Link></li>
                <li><Link href="/listings?country=UGANDA" className="hover:text-sky-400 transition-colors">🇺🇬 Uganda Listings</Link></li>
                <li><Link href="/listings?category=electronics" className="hover:text-sky-400 transition-colors">Electronics</Link></li>
                <li><Link href="/listings?category=vehicles" className="hover:text-sky-400 transition-colors">Vehicles</Link></li>
                <li><Link href="/listings?category=real-estate" className="hover:text-sky-400 transition-colors">Real Estate</Link></li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/login" className="hover:text-sky-400 transition-colors">Login</Link></li>
                <li><Link href="/auth/register" className="hover:text-sky-400 transition-colors">Register</Link></li>
                <li><Link href="/profile" className="hover:text-sky-400 transition-colors">My Profile</Link></li>
                <li><Link href="/listings/create" className="hover:text-sky-400 transition-colors">Post Free Ad</Link></li>
                <li><Link href="/profile/favorites" className="hover:text-sky-400 transition-colors">Favorites</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@3relite.com" className="hover:text-sky-400 transition-colors">Contact Us</a></li>
                <li><Link href="/about" className="hover:text-sky-400 transition-colors">About Us</Link></li>
                <li><Link href="/safety" className="hover:text-sky-400 transition-colors">Safety Tips</Link></li>
              </ul>
              {/* App download hint */}
              <div className="mt-4 p-3 bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-400 mb-2 font-medium">Available on</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span>🍎</span> iOS App Store
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <span>🤖</span> Google Play
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact mobile footer - shown only below md */}
      <div className="md:hidden px-4 py-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center font-black text-white text-xs">3R</div>
          <span className="font-extrabold text-white text-base tracking-tight">Elite</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs mb-4">
          <Link href="/about" className="hover:text-sky-400 transition-colors">About</Link>
          <Link href="/safety" className="hover:text-sky-400 transition-colors">Safety Tips</Link>
          <a href="mailto:support@3relite.com" className="hover:text-sky-400 transition-colors">Contact</a>
          <Link href="/privacy" className="hover:text-sky-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-sky-400 transition-colors">Terms</Link>
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
              className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-brand-600 flex items-center justify-center text-xs transition-colors interactive"
            >
              {s.icon}
            </a>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500">&copy; {new Date().getFullYear()} 3R-Elite Marketplace</p>
      </div>

      {/* Bottom bar - desktop only */}
      <div className="hidden md:block border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>&copy; {new Date().getFullYear()} 3R-Elite Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-sky-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-sky-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

