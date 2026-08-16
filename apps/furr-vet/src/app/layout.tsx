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
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <AuthProvider>
          <header className="bg-[#FFFEFC] border-b border-[#E8E6E0] sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#006B78] rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm">F</span>
                </div>
                <span className="font-black text-xl tracking-tight text-[#10242D]">FURR <span className="text-[#66757C] font-medium">VET</span></span>
              </div>
              <nav className="flex gap-4 items-center">
                <span className="text-sm font-semibold text-[#10242D]">Workspace</span>
                <span className="hidden sm:block text-sm font-medium text-[#66757C]">Owner-controlled access</span>
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
