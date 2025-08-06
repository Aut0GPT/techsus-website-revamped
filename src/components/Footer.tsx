
import Link from 'next/link';
import { Facebook, Linkedin, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-800 text-white">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">TECHSUS</h3>
            <p className="text-stone-400">
              Construção industrializada com tecnologia sustentável e altamente escalável.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="/quem-somos" className="text-stone-400 hover:text-orange-500">Empresa</Link></li>
              <li><Link href="/sistema" className="text-stone-400 hover:text-orange-500">Sistema</Link></li>
              <li><Link href="/contato" className="text-stone-400 hover:text-orange-500">Contato</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Siga-nos</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-stone-400 hover:text-orange-500"><Facebook size={24} /></a>
              <a href="#" className="text-stone-400 hover:text-orange-500"><Linkedin size={24} /></a>
              <a href="#" className="text-stone-400 hover:text-orange-500"><Instagram size={24} /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-stone-700 pt-6 text-center text-stone-500">
          <p>&copy; {new Date().getFullYear()} TECHSUS. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
