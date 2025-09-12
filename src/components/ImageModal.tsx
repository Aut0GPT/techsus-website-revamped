'use client';

import Image from "next/image";
import { X } from "lucide-react";
import { useState } from "react";

interface ImageModalProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function ImageModal({ src, alt, width, height, className = "" }: ImageModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <>
      {/* Thumbnail Image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={openModal}
      />

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-orange-400 transition-colors z-10"
              aria-label="Fechar modal"
            >
              <X size={32} />
            </button>
            <div className="bg-white rounded-lg p-2 shadow-2xl">
              <Image
                src={src}
                alt={alt}
                width={800}
                height={1000}
                className="w-full h-auto max-h-[80vh] object-contain rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}