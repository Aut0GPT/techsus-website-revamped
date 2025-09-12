import Link from 'next/link';
import { Facebook, Linkedin, Instagram } from 'lucide-react';
import { getDictionary } from '@/lib/dictionaries';

interface FooterProps {
  locale: string;
}

export default async function Footer({ locale }: FooterProps) {
  const dict = await getDictionary(locale as 'pt' | 'en' | 'es');

  return (
    <footer className="bg-stone-800 text-white">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">TECHSUS</h3>
            <p className="text-stone-400">
              {dict.footer.company_description}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{dict.footer.quick_links}</h3>
            <ul className="space-y-2">
              <li><Link href={locale === 'pt' ? '/quem-somos' : `/${locale}/quem-somos`} className="text-stone-400 hover:text-orange-500">{dict.footer.company}</Link></li>
              <li><Link href={locale === 'pt' ? '/sistema' : `/${locale}/sistema`} className="text-stone-400 hover:text-orange-500">{dict.footer.system}</Link></li>
              <li><Link href={locale === 'pt' ? '/contato' : `/${locale}/contato`} className="text-stone-400 hover:text-orange-500">{dict.footer.contact}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">{dict.footer.follow_us}</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-stone-400 hover:text-orange-500"><Facebook size={24} /></a>
              <a href="#" className="text-stone-400 hover:text-orange-500"><Linkedin size={24} /></a>
              <a href="#" className="text-stone-400 hover:text-orange-500"><Instagram size={24} /></a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-stone-700 pt-6 text-center text-stone-500">
          <p>&copy; {new Date().getFullYear()} TECHSUS. {dict.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
}