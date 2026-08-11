import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Furr | Vet Portal",
  description: "Furr Professional Access Portal for Veterinarians",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-stone-900 antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#E65100] rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">F</span>
                </div>
                <span className="font-black text-xl tracking-tight text-[#02202B]">FURR <span className="text-stone-400 font-medium">VET</span></span>
              </div>
              <nav className="flex gap-6 items-center">
                <span className="text-sm font-semibold text-[#02202B]">Dashboard</span>
                <span className="text-sm font-medium text-stone-500 hover:text-[#02202B] cursor-pointer">Support</span>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
