import type { Metadata } from 'next';
import './globals.css';
import '../style.css';
import { AuthProvider } from '@/context/AuthContext';
import { CountryProvider } from '@/context/CountryContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: '3R-Elite Marketplace - UAE & Uganda',
  description: 'Buy and sell anything in UAE and Uganda. Find deals on electronics, vehicles, real estate, and more.',
  keywords: 'marketplace, buy, sell, UAE, Uganda, Dubai, Kampala, classifieds',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <CountryProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-gray-50">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </CountryProvider>
      </body>
    </html>
  );
}
