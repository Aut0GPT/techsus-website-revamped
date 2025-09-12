'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NavigationProps {
  locale: string;
  dict?: any;
}

const languages = [
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

// Default navigation for fallback
const defaultNavigation = {
  pt: [
    { href: '/', label: 'Início' },
    { href: '/quem-somos', label: 'Empresa' },
    { href: '/sistema', label: 'Sistema' },
    { href: '/processo', label: 'Processo' },
    { href: '/produtos', label: 'Produtos' },
    { href: '/mercado', label: 'Mercado' },
    { href: '/estrategia', label: 'Estratégia' },
    { href: '/parcerias', label: 'Parcerias' },
    { href: '/investidores', label: 'Investidores' },
    { href: '/live-cameras', label: 'Câmeras ao Vivo' },
    { href: '/contato', label: 'Contato' },
  ],
  en: [
    { href: '/', label: 'Home' },
    { href: '/quem-somos', label: 'About Us' },
    { href: '/sistema', label: 'System' },
    { href: '/processo', label: 'Process' },
    { href: '/produtos', label: 'Products' },
    { href: '/mercado', label: 'Market' },
    { href: '/estrategia', label: 'Strategy' },
    { href: '/parcerias', label: 'Partnerships' },
    { href: '/investidores', label: 'Investors' },
    { href: '/live-cameras', label: 'Live Cameras' },
    { href: '/contato', label: 'Contact' },
  ],
  es: [
    { href: '/', label: 'Inicio' },
    { href: '/quem-somos', label: 'Quiénes Somos' },
    { href: '/sistema', label: 'Sistema' },
    { href: '/processo', label: 'Proceso' },
    { href: '/produtos', label: 'Productos' },
    { href: '/mercado', label: 'Mercado' },
    { href: '/estrategia', label: 'Estrategia' },
    { href: '/parcerias', label: 'Asociaciones' },
    { href: '/investidores', label: 'Inversores' },
    { href: '/live-cameras', label: 'Cámaras en Vivo' },
    { href: '/contato', label: 'Contacto' },
  ],
};

export default function Navigation({ locale, dict }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const router = useRouter();

  // Use dict navigation if available, otherwise fall back to default
  const navigationLinks = dict?.navigation ? [
    { href: '/', label: dict.navigation.home },
    { href: '/quem-somos', label: dict.navigation.about },
    { href: '/sistema', label: dict.navigation.system },
    { href: '/processo', label: dict.navigation.process },
    { href: '/produtos', label: dict.navigation.products },
    { href: '/mercado', label: dict.navigation.market },
    { href: '/estrategia', label: dict.navigation.strategy },
    { href: '/parcerias', label: dict.navigation.partnerships },
    { href: '/investidores', label: dict.navigation.investors },
    { href: '/live-cameras', label: dict.navigation.live_cameras },
    { href: '/contato', label: dict.navigation.contact },
  ] : defaultNavigation[locale as keyof typeof defaultNavigation] || defaultNavigation.pt;

  const switchLanguage = (newLocale: string) => {
    const currentPathname = window.location.pathname;
    let cleanPath = currentPathname;

    // Remove current locale prefix to get clean path
    if (currentPathname.startsWith('/en/')) {
      cleanPath = currentPathname.substring(3); // Remove '/en'
    } else if (currentPathname.startsWith('/es/')) {
      cleanPath = currentPathname.substring(3); // Remove '/es'
    }

    // Handle exact /en or /es paths
    if (currentPathname === '/en' || currentPathname === '/es') {
      cleanPath = '/';
    }

    // Build new path
    let newPath;
    if (newLocale === 'pt') {
      newPath = cleanPath || '/';
    } else {
      newPath = `/${newLocale}${cleanPath}`;
    }

    router.push(newPath);
    setIsLangOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  return (
    <header className="bg-black shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href={locale === 'pt' ? '/' : `/${locale}`} className="flex items-center">
            <Image src="/images/imagenscomdescricao/logo-techsus.png" alt="TECHSUS Logo" width={150} height={45} />
          </Link>

          <nav className="hidden lg:flex items-center space-x-6">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={locale === 'pt' ? link.href : `/${locale}${link.href}`} className="text-white hover:text-orange-400 transition-colors font-medium">
                {link.label}
              </Link>
            ))}

            {/* Language Switcher - Desktop */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors font-medium"
              >
                <Globe size={20} />
                <span>{currentLanguage.flag}</span>
                <span className="hidden xl:block">{currentLanguage.label}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 hover:bg-orange-50 transition-colors flex items-center space-x-3 ${
                        locale === lang.code ? 'text-orange-600 bg-orange-50' : 'text-gray-800'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-orange-400">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-black py-4 border-t border-stone-800">
          <nav className="flex flex-col items-center space-y-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={locale === 'pt' ? link.href : `/${locale}${link.href}`}
                className="text-white hover:text-orange-400 transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Language Switcher - Mobile */}
            <div className="w-full border-t border-stone-800 pt-4">
              <div className="flex flex-col items-center space-y-2">
                <div className="text-stone-400 text-sm flex items-center space-x-2">
                  <Globe size={16} />
                  <span>Language / Idioma</span>
                </div>
                <div className="flex space-x-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLanguage(lang.code)}
                      className={`px-3 py-1 rounded transition-colors flex items-center space-x-1 ${
                        locale === lang.code
                          ? 'text-orange-400 bg-stone-800'
                          : 'text-stone-300 hover:text-orange-400'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="text-xs">{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
      )}

      {/* Click outside to close language dropdown */}
      {isLangOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsLangOpen(false)}
        />
      )}
    </header>
  );
}