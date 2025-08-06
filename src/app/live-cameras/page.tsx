
'use client';

import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { useState, useEffect } from "react";

const cameras = [
  { id: "CAM-01", location: "Pátio da Fábrica", image: "/images/cam1.png" },
  { id: "CAM-02", location: "Montagem Externa", image: "/images/cam2.png" },
  { id: "CAM-03", location: "Linha de Produção 1", image: "/images/cam3.png" },
  { id: "CAM-04", location: "Canteiro de Obras", image: "/images/cam4.png" },
];

export default function LiveCameras() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-stone-900">
      <PageHeader 
        title="Câmeras ao Vivo"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Câmeras ao Vivo" }
        ]}
      />
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cameras.map((camera) => (
              <div key={camera.id} className="bg-black border-2 border-stone-700 rounded-lg overflow-hidden">
                <div className="relative">
                  <Image 
                    src={camera.image}
                    alt={`Câmera ${camera.id} - ${camera.location}`}
                    width={800}
                    height={600}
                    className="w-full"
                  />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs p-1 rounded">
                    <p className="font-mono">{camera.id}</p>
                    <p className="font-mono">{camera.location}</p>
                  </div>
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold p-1 rounded flex items-center">
                    <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                    LIVE
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs p-1 rounded">
                    <p className="font-mono">{time.toLocaleDateString()} {time.toLocaleTimeString()}</p>
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
