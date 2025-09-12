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

      {/* ODS and ESG Section */}
      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Compromisso com a Sustentabilidade</h2>
            <p className="text-lg text-stone-700 max-w-4xl mx-auto">
              Posicionada na vanguarda da Revolução Industrial 4.0 com automação e modelagem de informação, esse modelo evolui em consonância com as agendas ODS - Objetivos de Desenvolvimento Sustentável.
            </p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">9</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">ODS 9</h3>
              <p className="text-stone-600 text-sm">Indústria, inovação e infraestrutura</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">11</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">ODS 11</h3>
              <p className="text-stone-600 text-sm">Cidades e comunidades sustentáveis</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">12</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">ODS 12</h3>
              <p className="text-stone-600 text-sm">Consumo e produção responsáveis</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">13</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">ODS 13</h3>
              <p className="text-stone-600 text-sm">Ação contra mudança global do clima</p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-stone-900 mb-4">Agenda ESG</h3>
              <p className="text-lg text-stone-700 leading-relaxed">
                Além dos benefícios econômicos e de escala, o método construtivo atende a agenda ESG, já que há substancial economia de recursos naturais e consequente diminuição de atividades poluentes.
              </p>
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
                <div className="bg-white p-3 rounded-lg border text-center">
                  <Image
                    src="/images/imagenscomdescricao/CaixaLogo.png"
                    alt="Logo da Caixa Econômica Federal"
                    width={160}
                    height={80}
                    className="object-contain w-full h-16 mb-2 mx-auto"
                  />
                  <p className="text-sm font-semibold text-stone-900 mb-1">Caixa Econômica Federal</p>
                  <p className="text-xs text-stone-600">Homologação Oficial</p>
                </div>
                <div className="bg-white p-3 rounded-lg border text-center">
                  <Image
                    src="/images/imagenscomdescricao/cdhusp_logo.jpg"
                    alt="Logo da CDHU - Companhia de Desenvolvimento Habitacional e Urbano do Estado de São Paulo"
                    width={160}
                    height={80}
                    className="object-contain w-full h-16 mb-2 mx-auto"
                  />
                  <p className="text-sm font-semibold text-stone-900 mb-1">CDHU</p>
                  <p className="text-xs text-stone-600">Companhia de Desenvolvimento Habitacional</p>
                </div>
                <div className="bg-white p-3 rounded-lg border text-center">
                  <Image
                    src="/images/imagenscomdescricao/logo_sinat.png"
                    alt="Logo do SINAT - Sistema Nacional de Aprovações Técnicas"
                    width={160}
                    height={80}
                    className="object-contain w-full h-16 mb-2 mx-auto"
                  />
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