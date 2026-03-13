import type { Metadata, Viewport } from 'next';
import './globals.css';
import '../style.css';
import { AuthProvider } from '@/context/AuthContext';
import { CountryProvider } from '@/context/CountryContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: '3R-Elite Marketplace - UAE & Uganda',
  description: 'Buy and sell anything in UAE and Uganda. Find the best deals on electronics, vehicles, real estate, and more. Millions of listings.',
  keywords: 'marketplace, buy, sell, UAE, Uganda, Dubai, Kampala, classifieds, deals, electronics, vehicles',
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
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0c4a6e' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap"
        />
      </head>
      <body className="font-sans">
        <CountryProvider>
          <AuthProvider>
            <ToastProvider>
              <div className="min-h-screen flex flex-col bg-white">
                <Header />
                <main className="flex-1 has-bottom-nav md:pb-0">
                  {children}
                </main>
                <Footer />
                <MobileBottomNav />
              </div>
            </ToastProvider>
          </AuthProvider>
        </CountryProvider>
      </body>
    </html>
  );
}

