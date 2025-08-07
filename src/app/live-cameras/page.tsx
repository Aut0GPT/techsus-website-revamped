'use client';

import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { useState, useEffect } from "react";

const cameras = [
  { id: "CAM-01", location: "Linha de Produção", image: "/images/imagenscomdescricao/linha-de-producao-automatizada-paineis-concreto.png" },
  { id: "CAM-02", location: "Montagem de Painel", image: "/images/imagenscomdescricao/guindaste-icando-painel-de-concreto-na-fundacao.png" },
  { id: "CAM-03", location: "Canteiro de Obras", image: "/images/imagenscomdescricao/trabalhadores-montando-casa-de-paineis-de-concreto.png" },
  { id: "CAM-04", location: "Pátio da Fábrica", image: "/images/imagenscomdescricao/foto-vintage-paineis-de-concreto-acabados-empilhados.png" },
];

export default function LiveCameras() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-stone-100">
      <PageHeader 
        title="Câmeras ao Vivo"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Câmeras ao Vivo" }
        ]}
      />
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Acompanhe Nossas Operações</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Veja em tempo real a eficiência e a precisão do nosso sistema construtivo em ação. (Imagens ilustrativas)
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cameras.map((camera) => (
              <div key={camera.id} className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-lg">
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image 
                    src={camera.image}
                    alt={`Câmera ${camera.id} - ${camera.location}`}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/60 text-white text-sm p-2 rounded-md">
                    <p className="font-mono font-bold">{camera.id}</p>
                    <p className="font-mono">{camera.location}</p>
                  </div>
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold p-2 rounded-md flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    LIVE
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm p-2 rounded-md">
                    <p className="font-mono">
                      {mounted ? `${time.toLocaleDateString('pt-BR')} ${time.toLocaleTimeString('pt-BR')}` : '--:--:--'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}