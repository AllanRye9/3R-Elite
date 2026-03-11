import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-extrabold text-white">3R-Elite</Link>
            <p className="mt-3 text-sm text-gray-400 max-w-xs">
              Your trusted marketplace for buying and selling quality goods. Connect with thousands of sellers and buyers worldwide.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Mail className="h-5 w-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Refund Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} 3R-Elite Marketplace. All rights reserved.</p>
          <p className="text-sm text-gray-500 mt-2 sm:mt-0">Built with ❤️ for buyers & sellers</p>
        </div>
      </div>
    </footer>
  );
}
