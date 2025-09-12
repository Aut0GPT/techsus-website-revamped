'use client';

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionaries";

export default function InvestidoresEs() {
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary('es').then(setDict);
  }, []);

  if (!dict) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-xl text-stone-600">{dict?.common?.loading || 'Cargando...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader
        title={dict.investors.title}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">{dict.investors.investing_future_title}</h2>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                {dict.investors.investing_future_description_1}
              </p>
              <p className="text-lg text-stone-700 leading-relaxed">
                {dict.investors.investing_future_description_2}
              </p>
            </div>
            <div>
              <Image
                src="/images/imagenscomdescricao/paisagem-urbana-sao-paulo-ponte-estaiada.png"
                alt={dict.investors.sao_paulo_skyline_alt}
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.investors.competitive_advantages_title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.investors.competitive_advantages_description}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-3">{dict.investors.patented_technology_title}</h3>
              <p className="text-stone-700">{dict.investors.patented_technology_description}</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-3">{dict.investors.high_growth_market_title}</h3>
              <p className="text-stone-700">{dict.investors.high_growth_market_description}</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-3">{dict.investors.scalable_business_title}</h3>
              <p className="text-stone-700">{dict.investors.scalable_business_description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">{dict.investors.be_our_partner_title}</h2>
          <p className="text-xl text-stone-700 mb-8 max-w-3xl mx-auto">
            {dict.investors.be_our_partner_description}
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            {dict.investors.contact_button}
          </Link>
        </div>
      </section>
    </div>
  );
}