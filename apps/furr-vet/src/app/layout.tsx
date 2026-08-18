import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth";
import { VetGate } from "@/components/VetGate";

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
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-[#FAF9F5]`}>
        <AuthProvider>
          <VetGate>
            {children}
          </VetGate>
        </AuthProvider>
      </body>
    </html>
  );
}
