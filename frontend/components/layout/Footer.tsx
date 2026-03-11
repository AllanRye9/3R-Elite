import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10 mt-10">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold mb-3 text-lg">3R-Elite</h3>
          <p className="text-sm">Your trusted marketplace for UAE &amp; Uganda.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Browse</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/listings?country=UAE" className="hover:text-orange-400">UAE Listings</Link></li>
            <li><Link href="/listings?country=UGANDA" className="hover:text-orange-400">Uganda Listings</Link></li>
            <li><Link href="/listings?category=electronics" className="hover:text-orange-400">Electronics</Link></li>
            <li><Link href="/listings?category=vehicles" className="hover:text-orange-400">Vehicles</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/auth/login" className="hover:text-orange-400">Login</Link></li>
            <li><Link href="/auth/register" className="hover:text-orange-400">Register</Link></li>
            <li><Link href="/profile" className="hover:text-orange-400">My Profile</Link></li>
            <li><Link href="/listings/create" className="hover:text-orange-400">Post Ad</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="mailto:support@3relite.com" className="hover:text-orange-400">Contact Us</a></li>
            <li><Link href="/about" className="hover:text-orange-400">About Us</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-6 mt-6 border-t border-gray-700 text-sm text-center">
        &copy; {new Date().getFullYear()} 3R-Elite Marketplace. All rights reserved.
      </div>
    </footer>
  );
}
