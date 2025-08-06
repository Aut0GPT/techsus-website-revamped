
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "TECHSUS - Construção Industrializada Sustentável",
  description: "Sistema construtivo industrializado que revoluciona a construção civil com sustentabilidade, eficiência e qualidade industrial. Painéis de concreto autoportantes com tecnologia patenteada.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${GeistSans.className} antialiased bg-stone-50 text-stone-900`}
      >
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
