
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  breadcrumb: {
    label: string;
    href?: string;
  }[];
}

export default function PageHeader({ title, breadcrumb }: PageHeaderProps) {
  return (
    <section className="bg-gradient-to-r from-amber-900 to-stone-800 text-white py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <nav className="text-stone-300">
            {breadcrumb.map((item, index) => (
              <span key={index}>
                {item.href ? (
                  <Link href={item.href} className="hover:text-orange-400">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-orange-400">{item.label}</span>
                )}
                {index < breadcrumb.length - 1 && <span className="mx-2">/</span>}
              </span>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
