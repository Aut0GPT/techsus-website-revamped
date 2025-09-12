import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Factory, Leaf, Award, ShieldCheck } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";
import ImageModal from "@/components/ImageModal";

export default async function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const dict = await getDictionary(locale as 'pt' | 'en' | 'es');

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-900 via-stone-800 to-amber-900 text-white py-20 lg:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/imagenscomdescricao/paisagem-urbana-sao-paulo-ponte-estaiada.png"
            alt="Paisagem urbana de São Paulo com a Ponte Estaiada"
            layout="fill"
            objectFit="cover"
            className="opacity-30"
          />
        </div>
        <div className="relative container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 text-white shadow-lg">
                {dict.hero.title}
              </h1>
              <p className="text-xl text-stone-200 leading-relaxed mb-8">
                {dict.hero.subtitle}
              </p>
              <Link
                href={`/${locale}/contato`}
                className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-lg"
              >
                {dict.hero.cta}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.introduction.title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.introduction.subtitle}
            </p>
          </div>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <Factory className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{dict.introduction.speed_title}</h3>
              <p className="text-stone-600">{dict.introduction.speed_description}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{dict.introduction.sustainability_title}</h3>
              <p className="text-stone-600">{dict.introduction.sustainability_description}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Award className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{dict.introduction.quality_title}</h3>
              <p className="text-stone-600">{dict.introduction.quality_description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.process.title}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">{dict.process.subtitle}</p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center bg-stone-50 p-6 rounded-lg">
              <div className="w-full h-48 mb-4 overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="/images/imagenscomdescricao/planta-baixa-de-implantacao-de-complexo-residencial.png"
                  alt="Planejamento e compatibilização de projetos"
                  width={300}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{dict.process.planning_title}</h3>
              <p className="text-stone-600 text-sm">{dict.process.planning_description}</p>
            </div>
            <div className="flex flex-col items-center text-center bg-stone-50 p-6 rounded-lg">
              <div className="w-full h-48 mb-4 overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="/images/imagenscomdescricao/linha-de-producao-automatizada-paineis-concreto.png"
                  alt="Fabricação industrial de painéis"
                  width={300}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{dict.process.manufacturing_title}</h3>
              <p className="text-stone-600 text-sm">{dict.process.manufacturing_description}</p>
            </div>
            <div className="flex flex-col items-center text-center bg-stone-50 p-6 rounded-lg">
              <div className="w-full h-48 mb-4 overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="/images/imagenscomdescricao/transporte-de-painel-concreto-em-caminhao-especial.png"
                  alt="Logística e transporte especializado"
                  width={300}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{dict.process.logistics_title}</h3>
              <p className="text-stone-600 text-sm">{dict.process.logistics_description}</p>
            </div>
            <div className="flex flex-col items-center text-center bg-stone-50 p-6 rounded-lg">
              <div className="w-full h-48 mb-4 overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="/images/imagenscomdescricao/trabalhadores-montando-casa-de-paineis-de-concreto.png"
                  alt="Montagem rápida no canteiro"
                  width={300}
                  height={200}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2">{dict.process.assembly_title}</h3>
              <p className="text-stone-600 text-sm">{dict.process.assembly_description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies & Success Stories Section */}
      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.case_studies.title}</h2>
            <p className="text-lg text-stone-700 max-w-4xl mx-auto">
              {dict.case_studies.subtitle}
            </p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">40%</div>
              <div className="text-sm text-stone-600">{dict.case_studies.metrics.time_reduction}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">0%</div>
              <div className="text-sm text-stone-600">{dict.case_studies.metrics.waste}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-sm text-stone-600">{dict.case_studies.metrics.quality_control}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">4+</div>
              <div className="text-sm text-stone-600">{dict.case_studies.metrics.projects}</div>
            </div>
          </div>

          {/* Detailed Case Studies */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <Image src="/images/imagenscomdescricao/familia-em-frente-a-casa-nova-com-detalhe-laranja.png" alt="Família em frente ao protótipo em São Simão" width={500} height={300} className="w-full h-64 object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-stone-900">{dict.case_studies.prototype_title}</h3>
                </div>
                <p className="text-stone-700 mb-4">
                  {dict.case_studies.prototype_description}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">47.97m²</div>
                    <div className="text-xs text-stone-600">{dict.case_studies.prototype_area}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">60 dias</div>
                    <div className="text-xs text-stone-600">{dict.case_studies.prototype_time}</div>
                  </div>
                </div>
                <blockquote className="border-l-4 border-orange-500 pl-4 italic text-stone-700 text-sm">
                  "{dict.case_studies.prototype_testimonial}"
                </blockquote>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <Image src="/images/imagenscomdescricao/fileira-de-predios-residenciais-novos-de-dois-andares.png" alt="Conjunto habitacional T+3 em Rio Claro" width={500} height={300} className="w-full h-64 object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-stone-900">{dict.case_studies.building_title}</h3>
                </div>
                <p className="text-stone-700 mb-4">
                  {dict.case_studies.building_description}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">891.76m²</div>
                    <div className="text-xs text-stone-600">{dict.case_studies.building_area}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">18 apts</div>
                    <div className="text-xs text-stone-600">{dict.case_studies.building_units}</div>
                  </div>
                </div>
                <div className="text-sm text-stone-600 bg-stone-50 p-3 rounded">
                  <strong>Resultado:</strong> {dict.case_studies.building_result}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Projects Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image src="/images/imagenscomdescricao/exterior-de-casa-terrea-quase-acabada-com-telhado-ceramico.png" alt="Casa em Várzea Paulista" width={400} height={240} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h4 className="text-lg font-bold text-stone-900 mb-2">{dict.case_studies.varzea_title}</h4>
                <p className="text-stone-600 text-sm mb-3">{dict.case_studies.varzea_description}</p>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>✓ {dict.case_studies.premium_finish}</span>
                  <span>✓ {dict.case_studies.deadline_met}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid grid-cols-2 gap-1 h-48">
                <Image src="/images/imagenscomdescricao/duque1.jpg" alt="Edifício em Duque de Caxias - Vista 1" width={200} height={240} className="w-full h-full object-cover" />
                <Image src="/images/imagenscomdescricao/duque2.jpg" alt="Edifício em Duque de Caxias - Vista 2" width={200} height={240} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h4 className="text-lg font-bold text-stone-900 mb-2">{dict.case_studies.duque_title}</h4>
                <p className="text-stone-600 text-sm mb-3">{dict.case_studies.duque_description}</p>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>✓ {dict.case_studies.optimized_logistics}</span>
                  <span>✓ {dict.case_studies.certified_quality}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patented Technology Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">{dict.technology.title}</h2>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                {dict.technology.description}
              </p>
              <div className="flex items-start space-x-4">
                <ShieldCheck className="h-8 w-8 text-orange-600 mt-1" />
                <p className="text-stone-700">{dict.technology.certification_text}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <ImageModal
                src="/images/imagenscomdescricao/documento-patente-brasil-inpi.png"
                alt="Patente do Brasil - INPI"
                width={250}
                height={350}
                className="rounded-lg shadow-lg border"
              />
              <ImageModal
                src="/images/imagenscomdescricao/documento-patente-estados-unidos.png"
                alt="Patente dos Estados Unidos - USPTO"
                width={250}
                height={350}
                className="rounded-lg shadow-lg border"
              />
              <ImageModal
                src="/images/imagenscomdescricao/Certificado de Patente - CHINA nº 2017800928093.jpg"
                alt="Patente da China - SIPO"
                width={250}
                height={350}
                className="rounded-lg shadow-lg border"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-stone-800 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">{dict.cta.title}</h2>
          <p className="text-xl text-stone-300 mb-8 max-w-3xl mx-auto">
            {dict.cta.subtitle}
          </p>
          <Link
            href={`/${locale}/contato`}
            className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            {dict.cta.button}
            <ChevronRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}