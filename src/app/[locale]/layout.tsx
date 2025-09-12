import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { getDictionary } from "@/lib/dictionaries";

type Props = {
  params: { locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dict = await getDictionary(params.locale as 'pt' | 'en' | 'es')

  return {
    title: dict.meta.title,
    description: dict.meta.description,
  }
}

export async function generateStaticParams() {
  return [{ locale: 'pt' }, { locale: 'en' }, { locale: 'es' }]
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const langMap: { [key: string]: string } = {
    pt: 'pt-BR',
    en: 'en-US',
    es: 'es-ES'
  };

  const dict = await getDictionary(params.locale as 'pt' | 'en' | 'es');

  return (
    <html lang={langMap[params.locale] || 'pt-BR'}>
      <body
        className={`${GeistSans.className} antialiased bg-stone-50 text-stone-900`}
      >
        <Navigation locale={params.locale} dict={dict} />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer locale={params.locale} />
        <ScrollToTop />
      </body>
    </html>
  );
}