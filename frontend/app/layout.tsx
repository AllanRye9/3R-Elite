import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CountryProvider } from '@/context/CountryContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ToastProvider } from '@/components/ui/Toast';

// Primary font: Geist Variable — clean modern sans-serif, bundled locally
const geist = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-inter', // keep the CSS variable name so Tailwind `font-sans` picks it up
  weight: '100 900',
  display: 'swap',
});

// Accent / display font: Geist Mono used as a distinctive serif-style accent
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-playfair',
  weight: '100 900',
  display: 'swap',
});

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
    { media: '(prefers-color-scheme: light)', color: '#0EA5E9' },
    { media: '(prefers-color-scheme: dark)', color: '#0EA5E9' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* 3. Font variables injected via body className */}
      <body className={`${geist.variable} ${geistMono.variable} font-sans`}>
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