'use client';

import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getDictionary } from "@/lib/dictionaries";

const projects = [
  {
    media: [
      { type: "image", src: "/images/imagenscomdescricao/render-casa-terrea-com-detalhe-em-vermelho.png", alt: "Render 3D casa de una planta con detalle rojo" },
      { type: "image", src: "/images/imagenscomdescricao/render-casa-terrea-com-faixa-vermelha-vertical.png", alt: "Render 3D casa de una planta con franja roja vertical" },
      { type: "image", src: "/images/imagenscomdescricao/familia-em-frente-a-casa-nova-com-detalhe-laranja.png", alt: "Familia frente a casa nueva construida" },
      { type: "image", src: "/images/imagenscomdescricao/casa-nova-com-detalhe-laranja-e-grama-nova.png", alt: "Casa nueva con acabado y jardín" },
      { type: "video", src: "/images/imagenscomdescricao/WhatsApp Video 2025-09-10 at 10.17.53_0e18d3f6.mp4", alt: "Video demostrativo de construcción residencial" },
    ],
  },
  {
    media: [
      { type: "image", src: "/images/imagenscomdescricao/perspectivas-de-habitacional-vertical-multifamiliar.png", alt: "Perspectivas de habitacional vertical multifamiliar" },
      { type: "image", src: "/images/imagenscomdescricao/duque2.jpg", alt: "Fila de edificios residenciales nuevos de dos pisos" },
      { type: "image", src: "/images/imagenscomdescricao/fileira-de-predios-residenciais-novos-de-dois-andares.png", alt: "Edificios residenciales nuevos con malla de protección naranja" },
      { type: "image", src: "/images/imagenscomdescricao/canteiro-de-obras-com-predio-em-construcao-e-predios-acabados.png", alt: "Obra en construcción con edificio en proceso y edificios terminados" },
    ],
  },
  {
    media: [
      { type: "image", src: "/images/imagenscomdescricao/guindaste-icando-painel-de-concreto-na-fundacao.png", alt: "Grúa levantando panel de concreto en los cimientos" },
      { type: "image", src: "/images/imagenscomdescricao/guindaste.jpg", alt: "Grúa posicionando paneles de concreto" },
      { type: "image", src: "/images/imagenscomdescricao/trabalhadores-montando-casa-de-paineis-de-concreto.png", alt: "Trabajadores montando casa de paneles de concreto" },
      { type: "image", src: "/images/imagenscomdescricao/casa feita.jpg", alt: "Casa finalizada construida con paneles de concreto" },
    ],
  },
];

export default function ProdutosEs() {
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
        title={dict.products.title}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.products.main_title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.products.main_description}
            </p>
          </div>

          <div className="space-y-16">
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-stone-900">{dict.products.category1_title}</h3>
                <p className="text-lg text-stone-700">{dict.products.category1_subtitle}</p>
                <p className="text-stone-600 mt-1">{dict.products.category1_description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {projects[0].media.map((mediaItem, mediaIndex) => {
                  const is3D = mediaIndex === 0 || mediaIndex === 1;
                  const isVideoToCenter = mediaItem.type === 'video';

                  return (
                    <div key={mediaIndex} className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border relative ${is3D ? 'ring-2 ring-blue-400 ring-opacity-50' : ''} ${isVideoToCenter ? 'lg:col-start-2 lg:col-span-2' : ''}`}>
                      {mediaItem.type === 'image' ? (
                        <Image
                          src={mediaItem.src}
                          alt={mediaItem.alt}
                          width={400}
                          height={300}
                          className="w-full h-64 object-cover"
                        />
                      ) : (
                        <video
                          className="w-full h-80 object-cover"
                          controls
                          preload="metadata"
                        >
                          <source src={mediaItem.src} type="video/mp4" />
                          {dict.products.video_not_supported}
                        </video>
                      )}
                      {is3D && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg">
                            {dict.products.project_3d_label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-stone-900">{dict.products.category2_title}</h3>
                <p className="text-lg text-stone-700">{dict.products.category2_subtitle}</p>
                <p className="text-stone-600 mt-1">{dict.products.category2_description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {projects[1].media.map((mediaItem, mediaIndex) => {
                  const is3D = mediaIndex === 0;

                  return (
                    <div key={mediaIndex} className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border relative ${is3D ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}>
                      <Image
                        src={mediaItem.src}
                        alt={mediaItem.alt}
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover"
                      />
                      {is3D && (
                        <div className="absolute top-2 left-2">
                          <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg">
                            {dict.products.project_3d_label}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-stone-900">{dict.products.category3_title}</h3>
                <p className="text-lg text-stone-700">{dict.products.category3_subtitle}</p>
                <p className="text-stone-600 mt-1">{dict.products.category3_description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {projects[2].media.map((mediaItem, mediaIndex) => (
                  <div key={mediaIndex} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border">
                    <Image
                      src={mediaItem.src}
                      alt={mediaItem.alt}
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}