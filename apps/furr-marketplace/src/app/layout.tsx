import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { MarketplaceProvider } from '@/context/MarketplaceContext';
import { Navbar } from '@/components/Navbar';
import { CartDrawer } from '@/components/CartDrawer';
import { Footer } from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Furr Market | Premium Pet Food, Medicine & Care in Sri Lanka',
  description:
    'Shop veterinarian-approved pet food, prescription medicines, grooming supplies, and accessories with fast island-wide delivery.',
  openGraph: {
    title: 'Furr Market | Premium Pet Food, Medicine & Care',
    description:
      'Veterinarian-approved pet food, prescription medicines, grooming supplies, and accessories in Sri Lanka.',
    type: 'website',
    url: 'https://market.furr-labs.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased bg-[#FAF9F6] text-[#111827]">
        <AuthProvider>
          <MarketplaceProvider>
            <Navbar />
            <CartDrawer />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
          </MarketplaceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
