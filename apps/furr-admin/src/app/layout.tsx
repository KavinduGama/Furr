import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AdminGate } from "@/components/AdminGate";
import { AdminNavLink } from "@/components/AdminNavLink";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Furr | Admin Operations Suite",
  description: "Furr Internal Administration & Operations Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen flex bg-stone-100 text-stone-900`}>
        {/* Sidebar */}
        <aside className="admin-sidebar w-64 bg-[#02202B] text-white flex flex-col flex-shrink-0 min-h-screen border-r border-stone-800">
          <div className="admin-brand p-6 border-b border-stone-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#006B78] to-[#62A48C] flex items-center justify-center font-black text-white text-base shadow-md">
              F
            </div>
            <div>
              <span className="font-black tracking-tight text-white block text-sm">FURR <em className="text-[#62A48C] not-italic font-extrabold text-xs ml-1">ADMIN</em></span>
              <span className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase block">Operations Desk</span>
            </div>
          </div>

          <nav className="admin-nav p-4 space-y-1 flex-1 overflow-y-auto">
            <p className="text-[10px] font-black tracking-wider text-stone-500 uppercase px-3 py-1.5">Core Operations</p>
            <AdminNavLink href="/">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Overview
            </AdminNavLink>
            <AdminNavLink href="/vet-desk" badge="Queue">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Vet Desk
            </AdminNavLink>
            <AdminNavLink href="/clinics">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              Clinics & Hospitals
            </AdminNavLink>

            <p className="text-[10px] font-black tracking-wider text-stone-500 uppercase px-3 py-1.5 mt-4">Commerce & Ecosystem</p>
            <AdminNavLink href="/marketplace">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
              Marketplace & Orders
            </AdminNavLink>
            <AdminNavLink href="/services">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Services & Providers
            </AdminNavLink>
            <AdminNavLink href="/community">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Community & Alerts
            </AdminNavLink>

            <p className="text-[10px] font-black tracking-wider text-stone-500 uppercase px-3 py-1.5 mt-4">Trust, Safety & Governance</p>
            <AdminNavLink href="/disputes">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Disputes & Refunds
            </AdminNavLink>
            <AdminNavLink href="/finance">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              Finance & Settlements
            </AdminNavLink>
            <AdminNavLink href="/users">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              User Support Desk
            </AdminNavLink>
            <AdminNavLink href="/analytics">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Analytics & Telemetry
            </AdminNavLink>
            <AdminNavLink href="/audit-logs">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-75" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Audit Logs & Security
            </AdminNavLink>
          </nav>

          <div className="admin-footer p-4 border-t border-stone-800/80 text-[11px] text-stone-400">
            <span className="font-bold text-stone-300">Furr Platform Operations</span>
            <p className="mt-0.5 text-[10px] text-stone-500">v2.4.0 · SLVC Compliant</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <AdminGate>{children}</AdminGate>
        </main>
      </body>
    </html>
  );
}
