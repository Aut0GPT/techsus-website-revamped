'use client';

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Shield, TrendingUp, Globe, Users } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";

export default function InvestorsEn() {
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary('en').then(setDict);
  }, []);

  if (!dict) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-xl text-stone-600">Loading...</div>
      </div>
    );
  }

  const competitiveAdvantages = [
    {
      icon: <Shield className="h-12 w-12 text-orange-600" />,
      title: dict.investors.patented_technology_title,
      description: dict.investors.patented_technology_description
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-orange-600" />,
      title: dict.investors.high_growth_market_title,
      description: dict.investors.high_growth_market_description
    },
    {
      icon: <Globe className="h-12 w-12 text-orange-600" />,
      title: dict.investors.scalable_business_title,
      description: dict.investors.scalable_business_description
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader
        title={dict.investors.title}
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-6">{dict.investors.investing_future_title}</h2>
            <div className="max-w-4xl mx-auto space-y-4">
              <p className="text-lg text-stone-700">
                {dict.investors.investing_future_description_1}
              </p>
              <p className="text-lg text-stone-700">
                {dict.investors.investing_future_description_2}
              </p>
            </div>
          </div>

          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.investors.competitive_advantages_title}</h2>
              <p className="text-lg text-stone-700 max-w-3xl mx-auto">
                {dict.investors.competitive_advantages_description}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {competitiveAdvantages.map((advantage, index) => (
                <div key={index} className="bg-gradient-to-br from-orange-50 to-stone-100 p-8 rounded-lg text-center">
                  <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    {advantage.icon}
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-4">{advantage.title}</h3>
                  <p className="text-stone-700">{advantage.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-12 rounded-lg text-center">
            <Users className="h-16 w-16 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl font-bold mb-4">{dict.investors.partnership_cta_title}</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              {dict.investors.partnership_cta_description}
            </p>
            <div className="bg-white text-orange-600 px-8 py-4 rounded-lg inline-block">
              <span className="text-lg font-semibold">{dict.investors.partnership_cta_button}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}