import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "../globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { getDictionary } from "@/lib/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary('es')

  return {
    title: dict.meta.title,
    description: dict.meta.description,
  }
}

export default async function SpanishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = await getDictionary('es');

  return (
    <html lang="es-ES">
      <body
        className={`${GeistSans.className} antialiased bg-stone-50 text-stone-900`}
      >
        <Navigation locale="es" dict={dict} />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer locale="es" />
        <ScrollToTop />
      </body>
    </html>
  );
}