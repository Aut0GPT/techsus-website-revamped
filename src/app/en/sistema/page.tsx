'use client';

import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getDictionary } from "@/lib/dictionaries";

export default function SystemEn() {
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary('en').then(setDict);
  }, []);

  if (!dict) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader
        title={dict.system.title}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.system.main_title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.system.main_description}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-4">{dict.system.panel_title}</h3>
              <p className="text-stone-700 mb-4">
                {dict.system.panel_description}
              </p>
              <ul className="space-y-3">
                <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" /><span>{dict.system.panel_feature_1}</span></li>
                <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" /><span>{dict.system.panel_feature_2}</span></li>
                <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" /><span>{dict.system.panel_feature_3}</span></li>
              </ul>
            </div>
            <div className="space-y-6">
              <Image
                src="/images/imagenscomdescricao/WhatsApp Image 2025-09-10 at 10.06.40_18ced841.jpg"
                alt="Technical diagram of concrete panel - Part 1"
                width={600}
                height={450}
                className="rounded-lg shadow-lg border"
              />
              <Image
                src="/images/imagenscomdescricao/WhatsApp Image 2025-09-10 at 10.12.33_e844e3ba.jpg"
                alt="Technical diagram of concrete panel - Part 2"
                width={600}
                height={450}
                className="rounded-lg shadow-lg border"
              />
            </div>
          </div>

          <div className="text-center my-16">
            <h3 className="text-2xl font-bold text-stone-900 mb-4">{dict.system.connections_title}</h3>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.system.connections_description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center">
              <Image
                src="/images/imagenscomdescricao/desenhos-tecnicos-de-conexoes-entre-paineis.png"
                alt="Technical details of ribs and connections"
                width={630}
                height={504}
                className="rounded-lg shadow-lg border"
              />
              <p className="text-sm text-stone-600 mt-2">{dict.system.connections_detail_1}</p>
            </div>
             <div className="text-center">
              <Image
                src="/images/imagenscomdescricao/durodurocerto.jpg"
                alt="Technical detail of connection between slab and panels"
                width={500}
                height={400}
                className="rounded-lg shadow-lg border"
              />
               <p className="text-sm text-stone-600 mt-2">{dict.system.connections_detail_2}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.system.production_title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.system.production_description}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="text-center">
              <div className="relative h-96 w-full mb-4 overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="/images/imagenscomdescricao/linha-de-producao-automatizada-paineis-concreto.png"
                  alt="Panel production in factory"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-lg font-semibold text-stone-800 mb-2">{dict.system.offsite_title}</p>
              <p className="text-stone-600 text-base">{dict.system.offsite_description}</p>
            </div>
            <div className="text-center">
              <div className="relative h-96 w-full mb-4 overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="/images/imagenscomdescricao/painel-premoldado-sendo-icado-em-arranha-ceu.png"
                  alt="Precast panel being lifted in skyscraper"
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-lg font-semibold text-stone-800 mb-2">{dict.system.onsite_title}</p>
              <p className="text-stone-600 text-base">{dict.system.onsite_description}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}