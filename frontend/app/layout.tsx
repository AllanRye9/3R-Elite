import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CountryProvider } from '@/context/CountryContext';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: '3R-Elite Marketplace - UAE, Uganda, Kenya & China',
  description: 'Buy and sell anything in UAE, Uganda, Kenya and China. Find the best deals on electronics, vehicles, real estate, and more. Millions of listings.',
  keywords: 'marketplace, buy, sell, UAE, Uganda, Kenya, China, Dubai, Kampala, Nairobi, Beijing, classifieds, deals, electronics, vehicles',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '3R-Elite',
  },
  openGraph: {
    type: 'website',
    siteName: '3R-Elite Marketplace',
    title: '3R-Elite Marketplace - UAE & Uganda',
    description: 'Buy and sell anything in UAE and Uganda. Find the best deals near you.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3R-Elite Marketplace',
    description: 'Buy and sell anything in UAE and Uganda.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0EA5E9' },
    { media: '(prefers-color-scheme: dark)', color: '#0EA5E9' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* 3. Removed the manual <head> link tags */}
      <body className="font-sans">
        <CountryProvider>
          <AuthProvider>
            <CartProvider>
            <ToastProvider>
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-1 pt-0 has-bottom-nav md:pb-0">
                  {children}
                </main>
                <Footer />
                <MobileBottomNav />
              </div>
            </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </CountryProvider>
      </body>
    </html>
  );
}