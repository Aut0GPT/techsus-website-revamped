'use client';

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { Target, ShieldCheck, Globe, Users, BarChart, Factory, Building2, Recycle, CloudSun } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";

export default function StrategyEn() {
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary('en').then(setDict);
  }, []);

  if (!dict) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-xl text-stone-600">{dict?.common?.loading || 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader
        title={dict.strategy.title}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.strategy.future_vision_title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.strategy.future_vision_description}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="/images/imagenscomdescricao/WhatsApp Image 2025-09-10 at 11.09.01_d3d5abe4.jpg"
                alt={dict.strategy.strategic_expansion_map_alt}
                width={600}
                height={450}
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div>
              <div className="flex items-center mb-4">
                <Target className="h-10 w-10 text-orange-600" />
                <h3 className="text-2xl font-bold text-stone-900 ml-4">{dict.strategy.expansion_title}</h3>
              </div>
              <p className="text-lg text-stone-700 leading-relaxed mb-6">
                {dict.strategy.expansion_description}
              </p>
              <div className="flex items-center mb-4">
                <Users className="h-10 w-10 text-orange-600" />
                <h3 className="text-2xl font-bold text-stone-900 ml-4">{dict.strategy.strategic_partnerships_title}</h3>
              </div>
              <p className="text-lg text-stone-700 leading-relaxed">
                {dict.strategy.strategic_partnerships_description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.strategy.esg_commitment_title}</h2>
            <p className="text-lg text-stone-700 max-w-4xl mx-auto">
              {dict.strategy.esg_commitment_description}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Factory className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900">{dict.strategy.ods_9_title}</h3>
              <p className="text-stone-600 mt-2 font-semibold">{dict.strategy.ods_9_description}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Building2 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900">{dict.strategy.ods_11_title}</h3>
              <p className="text-stone-600 mt-2 font-semibold">{dict.strategy.ods_11_description}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Recycle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900">{dict.strategy.ods_12_title}</h3>
              <p className="text-stone-600 mt-2 font-semibold">{dict.strategy.ods_12_description}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <CloudSun className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900">{dict.strategy.ods_13_title}</h3>
              <p className="text-stone-600 mt-2 font-semibold">{dict.strategy.ods_13_description}</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg text-stone-700 max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
              {dict.strategy.esg_benefits}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <h2 className="text-3xl font-bold text-stone-900 mb-6">{dict.strategy.short_term_expansion_title}</h2>
              <ul className="text-lg text-stone-700 leading-relaxed mb-8 space-y-3">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-3 mr-4 flex-shrink-0"></span>
                  {dict.strategy.short_term_goal_1}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-3 mr-4 flex-shrink-0"></span>
                  {dict.strategy.short_term_goal_2}
                </li>
              </ul>
              <h3 className="text-2xl font-bold text-stone-900 mb-4">{dict.strategy.model_advantages_title}</h3>
              <ul className="text-lg text-stone-700 leading-relaxed space-y-3">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-3 mr-4 flex-shrink-0"></span>
                  {dict.strategy.model_advantage_1}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-3 mr-4 flex-shrink-0"></span>
                  {dict.strategy.model_advantage_2}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-3 mr-4 flex-shrink-0"></span>
                  {dict.strategy.model_advantage_3}
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-3 mr-4 flex-shrink-0"></span>
                  {dict.strategy.model_advantage_4}
                </li>
              </ul>
            </div>
            <div className="lg:order-1">
              <Image
                src="/images/imagenscomdescricao/Fabricas Localizacao.PNG"
                alt={dict.strategy.factory_location_map_alt}
                width={600}
                height={450}
                className="rounded-lg shadow-lg border"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}