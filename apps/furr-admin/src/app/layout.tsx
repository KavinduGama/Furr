import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdminGate } from "@/components/AdminGate";

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
      <body className={`${inter.className} antialiased min-h-screen flex`}>
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="admin-brand">
             <div className="admin-logo">
                <span className="text-white font-black text-sm">F</span>
             </div>
             <span>FURR <em>ADMIN</em></span>
          </div>
          <nav className="admin-nav">
            <Link href="/" className="admin-link active">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Overview
            </Link>
            <Link href="/vet-desk" className="admin-link">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Vet Desk
              <span className="admin-badge">Queue</span>
            </Link>
            <Link href="/users" className="admin-link">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Support
            </Link>
          </nav>
          <div className="admin-footer">
            Furr operations<br/>Role-gated workspace
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main">
          <header className="admin-header">
            <h2>Global operations</h2>
            <span>Secure role required</span>
          </header>
          <div className="admin-content">
            <AdminGate>{children}</AdminGate>
          </div>
        </main>
      </body>
    </html>
  );
}
