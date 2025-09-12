'use client';

import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { Factory, Truck, HardHat, CheckCircle, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";
import { getDictionary } from "@/lib/dictionaries";

const processSteps = [
  {
    icon: <ClipboardList className="h-12 w-12 text-orange-600" />,
    mediaType: "image",
    mediaSrc: "/images/imagenscomdescricao/planta-baixa-de-implantacao-de-complexo-residencial.png",
    alt: "Planta del complejo residencial"
  },
  {
    icon: <Factory className="h-12 w-12 text-orange-600" />,
    mediaType: "video",
    mediaSrc: "/images/imagenscomdescricao/FabricaAustriaSistemaCarrosselVideomostrandosistemacarrossel.mp4",
    alt: "Video del sistema carrusel en la fábrica de Austria"
  },
  {
    icon: <Truck className="h-12 w-12 text-orange-600" />,
    mediaType: "image",
    mediaSrc: "/images/imagenscomdescricao/transporte-de-painel-concreto-em-caminhao-especial.png",
    alt: "Transporte de panel de concreto en camión"
  },
  {
    icon: <HardHat className="h-12 w-12 text-orange-600" />,
    mediaType: "image",
    mediaSrc: "/images/imagenscomdescricao/trabalhadores-montando-casa-de-paineis-de-concreto.png",
    alt: "Montaje de paneles de concreto en el sitio de construcción"
  }
];

export default function ProcessoEs() {
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary('es').then(setDict);
  }, []);

  if (!dict) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader
        title={dict.process.title}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.process.main_title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.process.main_description}
            </p>
          </div>

          <div className="space-y-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-1">
                <div className="flex items-center mb-4">
                  {processSteps[0].icon}
                  <h3 className="text-2xl font-bold text-stone-900 ml-4">{dict.process.step1_title}</h3>
                </div>
                <p className="text-lg text-stone-700 leading-relaxed">{dict.process.step1_description}</p>
              </div>
              <div className="lg:order-2">
                <Image
                  src={processSteps[0].mediaSrc}
                  alt={processSteps[0].alt}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <div className="flex items-center mb-4">
                  {processSteps[1].icon}
                  <h3 className="text-2xl font-bold text-stone-900 ml-4">{dict.process.step2_title}</h3>
                </div>
                <p className="text-lg text-stone-700 leading-relaxed">{dict.process.step2_description}</p>
              </div>
              <div className="lg:order-1">
                <video
                  src={processSteps[1].mediaSrc}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-1">
                <div className="flex items-center mb-4">
                  {processSteps[2].icon}
                  <h3 className="text-2xl font-bold text-stone-900 ml-4">{dict.process.step3_title}</h3>
                </div>
                <p className="text-lg text-stone-700 leading-relaxed">{dict.process.step3_description}</p>
              </div>
              <div className="lg:order-2">
                <Image
                  src={processSteps[2].mediaSrc}
                  alt={processSteps[2].alt}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="lg:order-2">
                <div className="flex items-center mb-4">
                  {processSteps[3].icon}
                  <h3 className="text-2xl font-bold text-stone-900 ml-4">{dict.process.step4_title}</h3>
                </div>
                <p className="text-lg text-stone-700 leading-relaxed">{dict.process.step4_description}</p>
              </div>
              <div className="lg:order-1">
                <Image
                  src={processSteps[3].mediaSrc}
                  alt={processSteps[3].alt}
                  width={600}
                  height={400}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>

          <div className="mt-20 text-center bg-stone-100 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-stone-900 mb-6">{dict.process.advantages_title}</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center">
                <CheckCircle className="h-10 w-10 text-green-600 mb-3" />
                <h4 className="text-xl font-semibold mb-2">{dict.process.advantage1_title}</h4>
                <p className="text-stone-700">{dict.process.advantage1_description}</p>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="h-10 w-10 text-green-600 mb-3" />
                <h4 className="text-xl font-semibold mb-2">{dict.process.advantage2_title}</h4>
                <p className="text-stone-700">{dict.process.advantage2_description}</p>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="h-10 w-10 text-green-600 mb-3" />
                <h4 className="text-xl font-semibold mb-2">{dict.process.advantage3_title}</h4>
                <p className="text-stone-700">{dict.process.advantage3_description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}