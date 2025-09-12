'use client';

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { getDictionary } from "@/lib/dictionaries";

export default function LiveCamerasEs() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary('es').then(setDict);
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!dict) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-xl text-stone-600">{dict?.common?.loading || 'Cargando...'}</div>
      </div>
    );
  }

  const cameras = [
    {
      id: "CAM-01",
      location: dict.live_cameras.production_line_location,
      image: "/images/imagenscomdescricao/linha-de-producao-automatizada-paineis-concreto.png"
    },
    {
      id: "CAM-02",
      location: dict.live_cameras.panel_assembly_location,
      image: "/images/imagenscomdescricao/guindaste-icando-painel-de-concreto-na-fundacao.png"
    },
    {
      id: "CAM-03",
      location: dict.live_cameras.construction_site_location,
      image: "/images/imagenscomdescricao/trabalhadores-montando-casa-de-paineis-de-concreto.png"
    },
    {
      id: "CAM-04",
      location: dict.live_cameras.factory_yard_location,
      image: "/images/imagenscomdescricao/foto-vintage-paineis-de-concreto-acabados-empilhados.png"
    },
  ];

  return (
    <div className="min-h-screen bg-stone-100">
      <PageHeader
        title={dict.live_cameras.title}
      />
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.live_cameras.watch_operations_title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.live_cameras.watch_operations_description}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cameras.map((camera) => (
              <div key={camera.id} className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-lg">
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image
                    src={camera.image}
                    alt={`Cámara ${camera.id} - ${camera.location}`}
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
                    {dict.live_cameras.live_indicator}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm p-2 rounded-md">
                    <p className="font-mono">
                      {mounted ? `${time.toLocaleDateString('es-ES')} ${time.toLocaleTimeString('es-ES')}` : '--:--:--'}
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