'use client';

import Image from "next/image";
import { Building2, Award, Target, Users, Leaf, Shield, X } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useState } from "react";

export default function QuemSomos() {
  const [selectedImage, setSelectedImage] = useState<{src: string, alt: string} | null>(null);
  
  const openImageModal = (src: string, alt: string) => {
    setSelectedImage({ src, alt });
  };
  
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Quem Somos"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Quem Somos" }
        ]}
      />

      {/* About Company */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">A TECHSUS</h2>
              <p className="text-lg text-stone-700 mb-4">
                A TECHSUS é um grupo de empresas voltadas à gestão e implantação de um sistema inovador para a construção industrializada de painéis estruturais bioclimáticos de concreto com patentes requeridas e concedidas no Brasil, China e EUA.
              </p>
              <p className="text-lg text-stone-700">
                Posicionada na vanguarda da Revolução Industrial 4.0 com automação e modelagem de informação, esse modelo evolui em consonância com as agendas ODS - Objetivos de Desenvolvimento Sustentável.
              </p>
            </div>
            <div>
              <Image 
                src="/images/imagenscomdescricao/colagem-de-fotos-vintage-do-processo-de-montagem.png" 
                alt="Processo construtivo histórico da TECHSUS" 
                width={600} 
                height={450} 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Nosso Fundador</h2>
            <div className="w-20 h-1 bg-orange-600 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-1">
              <Image 
                src="/images/imagenscomdescricao/ShoppingFreiCanecaImagemaerea.png" 
                alt="Vista aérea do Shopping Frei Caneca - projeto pioneiro de Michel Zenni" 
                width={400} 
                height={400} 
                className="rounded-lg shadow-lg mx-auto object-cover"
              />
            </div>
            <div className="md:col-span-2 bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-orange-600 mb-4">Michel Zenni</h3>
              <p className="text-stone-700 mb-4 text-lg">Com mais de 40 anos de experiência, o fundador da TECHSUS tem uma trajetória marcada pela inovação:</p>
              <ul className="space-y-3 text-stone-700">
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  Atuou como projetista estrutural e empreendedor na construção civil.
                </li>
                <li className="flex items-start">
                  <Building2 className="h-5 w-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  Foi responsável pela construção do <strong>Shopping Frei Caneca</strong>, onde iniciou a industrialização da construção.
                </li>
                <li className="flex items-start">
                  <Target className="h-5 w-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  Montou a primeira fábrica estacionária de pré-fabricados em 2009, dando início à industrialização da construção habitacional.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trajectory and Milestones */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Trajetória e Validação</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Nossa tecnologia é fruto de anos de desenvolvimento e possui validação dos mais respeitados órgãos técnicos.
            </p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Patents Section */}
            <div className="bg-stone-50 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-orange-600 mb-4">Patentes e Propriedade Intelectual</h3>
              <p className="text-stone-700 mb-6 text-sm">
                O sistema TECHSUS é protegido por patentes no Brasil e nos Estados Unidos, garantindo nossa posição de vanguarda no mercado.
              </p>
              <div className="space-y-4">
                <div className="bg-white p-3 rounded-lg border text-center">
                  <Image 
                    src="/images/imagenscomdescricao/documento-patente-brasil-inpi.png" 
                    alt="Documento de Patente Brasil - INPI" 
                    width={180} 
                    height={220} 
                    className="rounded-lg mb-2 mx-auto object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openImageModal("/images/imagenscomdescricao/documento-patente-brasil-inpi.png", "Documento de Patente Brasil - INPI")}
                  />
                  <h4 className="text-sm font-bold text-stone-900 mb-1">Patente Brasil</h4>
                  <p className="text-xs text-stone-600">Instituto Nacional da Propriedade Industrial (INPI)</p>
                </div>
                <div className="bg-white p-3 rounded-lg border text-center">
                  <Image 
                    src="/images/imagenscomdescricao/documento-patente-estados-unidos.png" 
                    alt="Documento de Patente Estados Unidos - USPTO" 
                    width={180} 
                    height={220} 
                    className="rounded-lg mb-2 mx-auto object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openImageModal("/images/imagenscomdescricao/documento-patente-estados-unidos.png", "Documento de Patente Estados Unidos - USPTO")}
                  />
                  <h4 className="text-sm font-bold text-stone-900 mb-1">Patente Estados Unidos</h4>
                  <p className="text-xs text-stone-600">United States Patent and Trademark Office (USPTO)</p>
                </div>
                <div className="bg-white p-3 rounded-lg border text-center">
                  <Image 
                    src="/images/imagenscomdescricao/Certificado de Patente - CHINA nº 2017800928093.jpg"
                    alt="Documento de Patente China"
                    width={180} 
                    height={220} 
                    className="rounded-lg mb-2 mx-auto object-cover border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openImageModal("/images/imagenscomdescricao/Certificado de Patente - CHINA nº 2017800928093.jpg", "Documento de Patente China")}
                  />
                  <h4 className="text-sm font-bold text-stone-900 mb-1">Patente China</h4>
                  <p className="text-xs text-stone-600">Escritório Estatal de Propriedade Intelectual da China (SIPO)</p>
                </div>
              </div>
            </div>

            {/* IPT Reports Section */}
            <div className="bg-stone-50 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-orange-600 mb-4">Relatórios Técnicos IPT</h3>
              <p className="text-stone-700 mb-6 text-sm">
                Validação completa do Instituto de Pesquisas Tecnológicas com ensaios de desempenho, térmica, acústica e durabilidade.
              </p>
              <div className="space-y-4">
                <div className="text-center bg-white p-3 rounded-lg border">
                  <Image 
                    src="/images/imagenscomdescricao/relatorio-tecnico-ipt-avaliacao-de-desempenho-do-sistema.png" 
                    alt="Relatório IPT #107 938-205 - Desempenho do Sistema" 
                    width={160} 
                    height={200} 
                    className="rounded-lg mb-2 object-cover border cursor-pointer hover:opacity-80 transition-opacity mx-auto"
                    onClick={() => openImageModal("/images/imagenscomdescricao/relatorio-tecnico-ipt-avaliacao-de-desempenho-do-sistema.png", "Relatório IPT #107 938-205 - Desempenho do Sistema")}
                  />
                  <p className="text-sm font-semibold text-stone-900 mb-1">IPT #107 938-205</p>
                  <p className="text-xs text-stone-600">Desempenho do Sistema</p>
                </div>
                <div className="text-center bg-white p-3 rounded-lg border">
                  <Image 
                    src="/images/imagenscomdescricao/relatorio-tecnico-ipt-avaliacao-termica-apartamentos.png" 
                    alt="Relatórios IPT #107 880-205 & #107 881-205 - Conforto Térmico" 
                    width={160} 
                    height={200} 
                    className="rounded-lg mb-2 object-cover border cursor-pointer hover:opacity-80 transition-opacity mx-auto"
                    onClick={() => openImageModal("/images/imagenscomdescricao/relatorio-tecnico-ipt-avaliacao-termica-apartamentos.png", "Relatórios IPT #107 880-205 & #107 881-205 - Conforto Térmico")}
                  />
                  <p className="text-sm font-semibold text-stone-900 mb-1">IPT #107 880-205 & #107 881-205</p>
                  <p className="text-xs text-stone-600">Conforto Térmico</p>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-sm font-semibold text-stone-900 mb-1">IPT #980 629-203</p>
                  <p className="text-xs text-stone-600">Desempenho Acústico</p>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-sm font-semibold text-stone-900 mb-1">IPT #982 659-203</p>
                  <p className="text-xs text-stone-600">Durabilidade</p>
                </div>
              </div>
            </div>

            {/* Official Certifications Section */}
            <div className="bg-stone-50 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-orange-600 mb-4">Certificações e Homologações Oficiais</h3>
              <p className="text-stone-700 mb-6 text-sm">
                Homologações dos principais órgãos técnicos e governamentais, garantindo conformidade com as normas brasileiras.
              </p>
              <div className="space-y-4">
                <div className="text-center bg-white p-3 rounded-lg border">
                  <Image 
                    src="/images/imagenscomdescricao/documento-de-avaliacao-tecnica-ipt-datec.png" 
                    alt="Certificado DATEC - Documento de Avaliação Técnica" 
                    width={200} 
                    height={140} 
                    className="rounded-lg mb-2 object-contain border cursor-pointer hover:opacity-80 transition-opacity mx-auto"
                    onClick={() => openImageModal("/images/imagenscomdescricao/documento-de-avaliacao-tecnica-ipt-datec.png", "Certificado DATEC - Documento de Avaliação Técnica")}
                  />
                  <p className="text-sm font-semibold text-stone-900 mb-1">Certificado DATEC</p>
                  <p className="text-xs text-stone-600">Documento de Avaliação Técnica</p>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-sm font-semibold text-stone-900 mb-1">Caixa Econômica Federal</p>
                  <p className="text-xs text-stone-600">Homologação Oficial</p>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-sm font-semibold text-stone-900 mb-1">CDHU</p>
                  <p className="text-xs text-stone-600">Companhia de Desenvolvimento Habitacional</p>
                </div>
                <div className="bg-white p-3 rounded-lg border">
                  <p className="text-sm font-semibold text-stone-900 mb-1">SINAT</p>
                  <p className="text-xs text-stone-600">Sistema Nacional de Aprovações Técnicas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:text-orange-400 transition-colors z-10"
              aria-label="Fechar modal"
            >
              <X size={32} />
            </button>
            <div className="bg-white rounded-lg p-2 shadow-2xl">
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                width={800}
                height={1000}
                className="w-full h-auto max-h-[80vh] object-contain rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}