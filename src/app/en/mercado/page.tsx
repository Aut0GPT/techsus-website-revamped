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
        <div className="text-xl text-stone-600">Loading...</div>
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
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.market.main_title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.market.main_description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {marketSegments.map((segment, index) => (
              <div key={index} className="text-center">
                <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  {segment.icon}
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">{segment.title}</h3>
                <p className="text-stone-600 text-sm">{segment.description}</p>
              </div>
            ))}
          </div>

          <div className="mb-16">
            <div className="bg-gradient-to-br from-orange-50 to-stone-100 p-8 rounded-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-stone-900 mb-4">{dict.market.market_opportunity_title}</h3>
                <p className="text-lg text-stone-700">{dict.market.market_opportunity_subtitle}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{dict.market.sp_population}</div>
                  <h4 className="text-sm font-semibold text-stone-900 mb-1">{dict.market.sp_population_description}</h4>
                  <p className="text-xs text-stone-600">{dict.market.sp_population_detail}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{dict.market.housing_deficit_brazil}</div>
                  <h4 className="text-sm font-semibold text-stone-900 mb-1">{dict.market.housing_deficit_brazil_description}</h4>
                  <p className="text-xs text-stone-600">{dict.market.housing_deficit_brazil_detail}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{dict.market.housing_deficit_sp}</div>
                  <h4 className="text-sm font-semibold text-stone-900 mb-1">{dict.market.housing_deficit_sp_description}</h4>
                  <p className="text-xs text-stone-600">{dict.market.housing_deficit_sp_detail}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">R$ 2.1T</div>
                  <h4 className="text-sm font-semibold text-stone-900 mb-1">{dict.market.market_size_description}</h4>
                  <p className="text-xs text-stone-600">{dict.market.market_size_detail}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <School className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-bold text-stone-900">{dict.market.hospitals_title}</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">{dict.market.hospitals_new_units}</span>
                  <span className="font-semibold text-stone-900">{dict.market.hospitals_new_units_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">{dict.market.hospitals_investment}</span>
                  <span className="font-semibold text-stone-900">{dict.market.hospitals_investment_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">{dict.market.hospitals_deficit}</span>
                  <span className="font-semibold text-stone-900">{dict.market.hospitals_deficit_value}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <School className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-stone-900">{dict.market.education_title}</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">{dict.market.education_schools}</span>
                  <span className="font-semibold text-stone-900">{dict.market.education_schools_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">{dict.market.education_daycare}</span>
                  <span className="font-semibold text-stone-900">{dict.market.education_daycare_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">{dict.market.education_investment}</span>
                  <span className="font-semibold text-stone-900">{dict.market.education_investment_value}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Hotel className="h-8 w-8 text-purple-600 mr-3" />
                <h3 className="text-xl font-bold text-stone-900">{dict.market.hospitality_title}</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">{dict.market.hospitality_segment}</span>
                  <span className="font-semibold text-stone-900">{dict.market.hospitality_segment_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">{dict.market.hospitality_interior}</span>
                  <span className="font-semibold text-stone-900">{dict.market.hospitality_interior_value}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">{dict.market.hospitality_investment}</span>
                  <span className="font-semibold text-stone-900">{dict.market.hospitality_investment_value}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.market.housing_programs_title}</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-8 rounded-lg">
                <div className="flex items-center mb-6">
                  <Image
                    src="/images/imagenscomdescricao/cdhusp_logo.jpg"
                    alt={dict.market.cdhu_logo_alt}
                    width={120}
                    height={60}
                    className="object-contain mr-4"
                  />
                  <h3 className="text-xl font-bold text-stone-900">{dict.market.cdhu_goals_title}</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                    <span>{dict.market.cdhu_goal_1}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                    <span>{dict.market.cdhu_goal_2}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                    <span>{dict.market.cdhu_goal_3}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mr-3"></div>
                    <span>{dict.market.cdhu_goal_4}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg">
                <div className="flex items-center mb-6">
                  <Image
                    src="/images/imagenscomdescricao/CaixaLogo.png"
                    alt={dict.market.caixa_logo_alt}
                    width={120}
                    height={60}
                    className="object-contain mr-4"
                  />
                  <h3 className="text-xl font-bold text-stone-900">{dict.market.caixa_partnership_title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{dict.market.caixa_investment}</div>
                    <p className="text-sm text-stone-600">{dict.market.caixa_investment_description}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{dict.market.caixa_units}</div>
                    <p className="text-sm text-stone-600">{dict.market.caixa_units_description}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-500 mt-4 text-center">{dict.market.caixa_date}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.market.housing_deficit_dimension_title}</h2>
              <p className="text-lg text-stone-700 max-w-4xl mx-auto mb-4">
                {dict.market.housing_deficit_dimension_description_1}
              </p>
              <p className="text-lg text-stone-700 max-w-4xl mx-auto mb-4">
                {dict.market.housing_deficit_dimension_description_2}
              </p>
              <div className="bg-orange-100 p-4 rounded-lg inline-block">
                <p className="text-orange-800 font-semibold">{dict.market.housing_deficit_impact}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <Image
                  src="/images/imagenscomdescricao/desafios-da-construcao-civil-infografico.png"
                  alt={dict.market.construction_challenges_alt}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg mx-auto"
                />
              </div>
              <div className="text-center">
                <Image
                  src="/images/imagenscomdescricao/infografico-completo-deficit-habitacional-brasileiro.png"
                  alt={dict.market.housing_deficit_map_alt}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-lg mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}