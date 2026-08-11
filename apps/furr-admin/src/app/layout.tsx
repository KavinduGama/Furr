import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Furr | Admin",
  description: "Furr Internal Administration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-100 text-stone-900 antialiased min-h-screen flex`}>
        {/* Sidebar */}
        <aside className="w-64 bg-[#02202B] text-white flex flex-col">
          <div className="h-16 px-6 flex items-center gap-3 border-b border-white/10 shrink-0">
             <div className="w-8 h-8 bg-[#E65100] rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">F</span>
             </div>
             <span className="font-black tracking-tight text-lg">FURR <span className="text-[#62A48C] font-bold">ADMIN</span></span>
          </div>
          <nav className="flex-1 py-6 px-4 space-y-2">
            <a href="/" className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg text-white font-medium text-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Overview
            </a>
            <a href="/vet-desk" className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Vet Desk
              <span className="ml-auto bg-[#E65100] text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white">4</span>
            </a>
            <a href="/users" className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Support
            </a>
          </nav>
          <div className="p-4 border-t border-white/10 text-xs text-white/40">
            Furr Admin v0.1.0<br/>Admin: ID 88A9F
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-8 shrink-0">
            <h2 className="font-bold text-stone-500">Global Operations</h2>
            <div className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-[#02202B]">A</span>
            </div>
          </header>
          <div className="flex-1 overflow-auto bg-stone-50 p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
