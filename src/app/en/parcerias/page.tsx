'use client';

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";

export default function PartnershipsEn() {
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
        title={dict.partnerships.title}
      />

      {/* Knowledge Center Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.partnerships.knowledge_center_title}</h2>
            <p className="text-lg text-stone-700 max-w-4xl mx-auto">
              {dict.partnerships.knowledge_center_description}
            </p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-6">{dict.partnerships.research_ecosystem_title}</h3>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                {dict.partnerships.research_ecosystem_description_1}
              </p>
              <p className="text-lg text-stone-700 leading-relaxed">
                {dict.partnerships.research_ecosystem_description_2}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-stone-50 p-6 rounded-lg shadow-lg text-center">
                <GraduationCap className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-bold text-stone-900 mb-2">{dict.partnerships.partner_universities}</h4>
                <p className="text-stone-600 text-sm">{dict.partnerships.partner_universities_description}</p>
              </div>
              <div className="bg-stone-50 p-6 rounded-lg shadow-lg text-center">
                <BookOpen className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-bold text-stone-900 mb-2">{dict.partnerships.knowledge_transfer}</h4>
                <p className="text-stone-600 text-sm">{dict.partnerships.knowledge_transfer_description}</p>
              </div>
              <div className="bg-stone-50 p-6 rounded-lg shadow-lg text-center">
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-bold text-stone-900 mb-2">{dict.partnerships.institutional_network}</h4>
                <p className="text-stone-600 text-sm">{dict.partnerships.institutional_network_description}</p>
              </div>
              <div className="bg-stone-50 p-6 rounded-lg shadow-lg text-center">
                <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-bold text-stone-900 mb-2">{dict.partnerships.scientific_validation}</h4>
                <p className="text-stone-600 text-sm">{dict.partnerships.scientific_validation_description}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-stone-100 to-stone-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-stone-900 mb-6 text-center">{dict.partnerships.main_partnerships_title}</h3>
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/imagenscomdescricao/iptlogo.jpg"
                      alt={dict.partnerships.ipt_logo_alt}
                      width={120}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-orange-600 mb-4">{dict.partnerships.ipt_partnership_title}</h4>
                    <p className="text-stone-700 leading-relaxed">
                      {dict.partnerships.ipt_partnership_description_1}
                    </p>
                    <p className="text-stone-700 leading-relaxed mt-4">
                      {dict.partnerships.ipt_partnership_description_2}
                    </p>
                    <div className="mt-6">
                      <ul className="text-stone-700 space-y-2">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.ipt_benefit_1}
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.ipt_benefit_2}
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.ipt_benefit_3}
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.ipt_benefit_4}
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.ipt_benefit_5}
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.ipt_benefit_6}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/imagenscomdescricao/netprelogo.jpg"
                      alt={dict.partnerships.netpre_logo_alt}
                      width={120}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-orange-600 mb-4">{dict.partnerships.netpre_partnership_title}</h4>
                    <p className="text-stone-700 leading-relaxed">
                      {dict.partnerships.netpre_partnership_description_1}
                    </p>
                    <p className="text-stone-700 leading-relaxed mt-4">
                      {dict.partnerships.netpre_partnership_description_2}
                    </p>
                    <div className="mt-6">
                      <ul className="text-stone-700 space-y-2">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.netpre_benefit_1}
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.netpre_benefit_2}
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.netpre_benefit_3}
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.netpre_benefit_4}
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.netpre_benefit_5}
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.netpre_benefit_6}
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {dict.partnerships.netpre_benefit_7}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/imagenscomdescricao/Fumeplogo.jpg"
                      alt={dict.partnerships.fumep_logo_alt}
                      width={120}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-orange-600 mb-4">{dict.partnerships.fumep_partnership_title}</h4>
                    <p className="text-stone-700 leading-relaxed">
                      {dict.partnerships.fumep_partnership_description_1}
                    </p>
                    <p className="text-stone-700 leading-relaxed mt-4">
                      {dict.partnerships.fumep_partnership_description_2}
                    </p>
                    <p className="text-stone-700 leading-relaxed mt-4">
                      {dict.partnerships.fumep_partnership_description_3}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
