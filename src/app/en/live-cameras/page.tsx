'use client';

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Camera, Clock } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";

export default function LiveCamerasEn() {
  const [dict, setDict] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    getDictionary('en').then(setDict);

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleString('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!dict) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-xl text-stone-600">Loading...</div>
      </div>
    );
  }

  const cameras = [
    { id: 1, name: dict.live_cameras.camera_1_name, location: dict.live_cameras.camera_1_location },
    { id: 2, name: dict.live_cameras.camera_2_name, location: dict.live_cameras.camera_2_location },
    { id: 3, name: dict.live_cameras.camera_3_name, location: dict.live_cameras.camera_3_location },
    { id: 4, name: dict.live_cameras.camera_4_name, location: dict.live_cameras.camera_4_location },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader
        title={dict.live_cameras.title}
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.live_cameras.main_title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto mb-6">
              {dict.live_cameras.main_description}
            </p>

            <div className="bg-gradient-to-r from-orange-100 to-orange-50 p-4 rounded-lg inline-flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-stone-700 font-semibold">{dict.live_cameras.current_time}: </span>
              <span className="text-orange-600 font-mono ml-2">{currentTime} (GMT-3)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {cameras.map((camera) => (
              <div key={camera.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4">
                  <div className="flex items-center">
                    <Camera className="h-6 w-6 text-white mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{camera.name}</h3>
                      <p className="text-orange-100 text-sm">{camera.location}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">{dict.live_cameras.camera_offline}</p>
                      <p className="text-xs mt-1">{dict.live_cameras.connection_status}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">{dict.live_cameras.info_title}</h3>
              <p className="text-blue-700">{dict.live_cameras.info_description}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}