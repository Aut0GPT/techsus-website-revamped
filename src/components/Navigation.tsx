'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const navigationLinks = [
  { href: '/', label: 'Início' },
  { href: '/quem-somos', label: 'Empresa' },
  { href: '/sistema', label: 'Sistema' },
  { href: '/processo', label: 'Processo' },
  { href: '/produtos', label: 'Produtos' },
  { href: '/mercado', label: 'Mercado' },
  { href: '/estrategia', label: 'Estratégia' },
  { href: '/investidores', label: 'Investidores' },
  { href: '/live-cameras', label: 'Câmeras ao Vivo' },
  { href: '/contato', label: 'Contato' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-black shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <Image src="/images/imagenscomdescricao/logo-techsus.png" alt="TECHSUS Logo" width={150} height={45} />
          </Link>
          <nav className="hidden lg:flex items-center space-x-6">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-white hover:text-orange-400 transition-colors font-medium">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="lg:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white hover:text-orange-400">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="lg:hidden bg-black py-4 border-t border-stone-800">
          <nav className="flex flex-col items-center space-y-4">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-white hover:text-orange-400 transition-colors font-medium" onClick={() => setIsOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}