import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "TECHSUS - Construção Industrializada",
  description: "Revolucionando a construção civil com tecnologia patenteada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${GeistSans.className} antialiased bg-stone-50 text-stone-900 overflow-hidden`}
      >
        <main className="min-h-screen overflow-hidden">
          {children}
        </main>
        <ScrollToTop />
      </body>
    </html>
  );
}