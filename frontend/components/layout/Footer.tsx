import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6 mt-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <h3 className="text-white font-bold mb-2 text-sm">3R-Elite</h3>
          <p className="text-xs">Your trusted marketplace for UAE &amp; Uganda.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2 text-sm">Browse</h4>
          <ul className="space-y-1 text-xs">
            <li><Link href="/listings?country=UAE" className="hover:text-sky-400">UAE Listings</Link></li>
            <li><Link href="/listings?country=UGANDA" className="hover:text-sky-400">Uganda Listings</Link></li>
            <li><Link href="/listings?category=electronics" className="hover:text-sky-400">Electronics</Link></li>
            <li><Link href="/listings?category=vehicles" className="hover:text-sky-400">Vehicles</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2 text-sm">Account</h4>
          <ul className="space-y-1 text-xs">
            <li><Link href="/auth/login" className="hover:text-sky-400">Login</Link></li>
            <li><Link href="/auth/register" className="hover:text-sky-400">Register</Link></li>
            <li><Link href="/profile" className="hover:text-sky-400">My Profile</Link></li>
            <li><Link href="/listings/create" className="hover:text-sky-400">Post Ad</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-2 text-sm">Support</h4>
          <ul className="space-y-1 text-xs">
            <li><a href="mailto:support@3relite.com" className="hover:text-sky-400">Contact Us</a></li>
            <li><Link href="/about" className="hover:text-sky-400">About Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-4 mt-4 border-t border-gray-700 text-xs text-center">
        &copy; {new Date().getFullYear()} 3R-Elite Marketplace. All rights reserved.
      </div>
    </footer>
  );
}
