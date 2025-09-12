'use client';

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { Briefcase, Home, School, Hotel } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";

export default function MarketEn() {
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

  const marketSegments = [
    {
      icon: <Home className="h-10 w-10 text-orange-600" />,
      title: dict.market.residential_title,
      description: dict.market.residential_description
    },
    {
      icon: <Briefcase className="h-10 w-10 text-orange-600" />,
      title: dict.market.commercial_industrial_title,
      description: dict.market.commercial_industrial_description
    },
    {
      icon: <School className="h-10 w-10 text-orange-600" />,
      title: dict.market.institutional_title,
      description: dict.market.institutional_description
    },
    {
      icon: <Hotel className="h-10 w-10 text-orange-600" />,
      title: dict.market.hotel_title,
      description: dict.market.hotel_description
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader
        title={dict.market.title}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">{dict.market.construction_revolution_title}</h2>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                {dict.market.construction_revolution_description_1}
              </p>
              <p className="text-lg text-stone-700 leading-relaxed">
                {dict.market.construction_revolution_description_2}
              </p>
            </div>
            <div>
              <Image
                src="/images/imagenscomdescricao/infografico-desafios-industria-construcao-civil - Editada.jpg"
                alt={dict.market.construction_challenges_alt}
                width={660}
                height={495}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.market.market_segments_title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.market.market_segments_description}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {marketSegments.map((segment, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg text-center hover:scale-105 transition-transform">
                <div className="flex justify-center mb-4">
                  {segment.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{segment.title}</h3>
                <p className="text-stone-700">{segment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity Dashboard */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.market.market_dashboard_title}</h2>
            <p className="text-lg text-stone-700 max-w-4xl mx-auto">
              {dict.market.market_dashboard_description}
            </p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>

          {/* Key Market Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white border border-stone-200 p-6 rounded-lg text-center shadow-lg">
              <div className="text-3xl font-bold text-stone-900 mb-2">{dict.market.global_market}</div>
              <div className="text-sm text-stone-700 font-medium">{dict.market.global_market_description}</div>
              <div className="text-xs text-stone-600 mt-1">{dict.market.global_market_detail}</div>
            </div>
            <div className="bg-white border border-stone-200 p-6 rounded-lg text-center shadow-lg">
              <div className="text-3xl font-bold text-stone-900 mb-2">{dict.market.sp_population}</div>
              <div className="text-sm text-stone-700 font-medium">{dict.market.sp_population_description}</div>
              <div className="text-xs text-stone-600 mt-1">{dict.market.sp_population_detail}</div>
            </div>
            <div className="bg-white border border-stone-200 p-6 rounded-lg text-center shadow-lg">
              <div className="text-3xl font-bold text-stone-900 mb-2">{dict.market.housing_deficit_brazil}</div>
              <div className="text-sm text-stone-700 font-medium">{dict.market.housing_deficit_brazil_description}</div>
              <div className="text-xs text-stone-600 mt-1">{dict.market.housing_deficit_brazil_detail}</div>
            </div>
            <div className="bg-white border border-stone-200 p-6 rounded-lg text-center shadow-lg">
              <div className="text-3xl font-bold text-stone-900 mb-2">{dict.market.housing_deficit_sp}</div>
              <div className="text-sm text-stone-700 font-medium">{dict.market.housing_deficit_sp_description}</div>
              <div className="text-xs text-stone-600 mt-1">{dict.market.housing_deficit_sp_detail}</div>
            </div>
          </div>

          {/* Growth Projections by Segment */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-6">{dict.market.hospitals_title}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-700">{dict.market.hospitals_new_units}</span>
                  <span className="font-bold text-stone-900">{dict.market.hospitals_new_units_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">{dict.market.hospitals_investment}</span>
                  <span className="font-bold text-stone-900">{dict.market.hospitals_investment_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">{dict.market.hospitals_deficit}</span>
                  <span className="font-bold text-stone-900">{dict.market.hospitals_deficit_value}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-6">{dict.market.education_title}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-700">{dict.market.education_schools}</span>
                  <span className="font-bold text-stone-900">{dict.market.education_schools_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">{dict.market.education_daycare}</span>
                  <span className="font-bold text-stone-900">{dict.market.education_daycare_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">{dict.market.education_investment}</span>
                  <span className="font-bold text-stone-900">{dict.market.education_investment_value}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-6">{dict.market.hospitality_title}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-700">{dict.market.hospitality_segment}</span>
                  <span className="font-bold text-stone-900">{dict.market.hospitality_segment_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">{dict.market.hospitality_interior}</span>
                  <span className="font-bold text-stone-900">{dict.market.hospitality_interior_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">{dict.market.hospitality_investment}</span>
                  <span className="font-bold text-stone-900">{dict.market.hospitality_investment_value}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Housing Programs Dashboard */}
          <div className="bg-stone-100 rounded-lg p-8 mb-16">
            <h3 className="text-2xl font-bold text-stone-900 mb-6 text-center">{dict.market.housing_programs_title}</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-lg">
                <h4 className="text-lg font-bold text-stone-900 mb-4 text-center">{dict.market.cdhu_goals_title}</h4>
                <div className="flex justify-center mb-4">
                  <Image
                    src="/images/imagenscomdescricao/cdhusp_logo.jpg"
                    alt={dict.market.cdhu_logo_alt}
                    width={120}
                    height={80}
                    className="object-contain"
                  />
                </div>
                <ul className="space-y-3 text-stone-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {dict.market.cdhu_goal_1}
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {dict.market.cdhu_goal_2}
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {dict.market.cdhu_goal_3}
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {dict.market.cdhu_goal_4}
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-lg flex flex-col h-full">
                <h4 className="text-lg font-bold text-stone-900 mb-4 text-center">{dict.market.caixa_partnership_title}</h4>
                <div className="flex justify-center mb-4">
                  <Image
                    src="/images/imagenscomdescricao/CaixaLogo.png"
                    alt={dict.market.caixa_logo_alt}
                    width={200}
                    height={100}
                    className="object-contain w-full h-20"
                  />
                </div>
                <div className="space-y-4 mt-auto">
                  <div>
                    <div className="text-2xl font-bold text-stone-900 mb-1">{dict.market.caixa_investment}</div>
                    <div className="text-sm text-stone-600">{dict.market.caixa_investment_description}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-900 mb-1">{dict.market.caixa_units}</div>
                    <div className="text-sm text-stone-600">{dict.market.caixa_units_description}</div>
                  </div>
                  <div className="text-xs text-stone-500 pt-3 border-t border-stone-200 mt-3">
                    {dict.market.caixa_date}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deficit Visualization */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <h2 className="text-3xl font-bold text-stone-900 mb-6">{dict.market.housing_deficit_dimension_title}</h2>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                {dict.market.housing_deficit_dimension_description_1}
              </p>
              <p className="text-lg text-stone-700 leading-relaxed mb-6">
                {dict.market.housing_deficit_dimension_description_2}
              </p>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <p className="text-stone-700 font-medium">
                  <strong>Impact:</strong> {dict.market.housing_deficit_impact}
                </p>
              </div>
            </div>
            <div className="lg:order-1">
              <Image
                src="/images/imagenscomdescricao/infografico-mapa-deficit-habitacional-brasil.png"
                alt={dict.market.housing_deficit_map_alt}
                width={600}
                height={450}
                className="rounded-lg shadow-2xl border"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}