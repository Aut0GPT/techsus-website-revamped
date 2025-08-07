
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { TrendingUp, ShieldCheck, Globe, BarChart } from "lucide-react";
import Link from "next/link";

export default function Investidores() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Relações com Investidores"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Investidores" }
        ]}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">Investindo na Construção do Futuro</h2>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                A TECHSUS representa uma oportunidade única de investimento em um setor tradicional com enorme potencial de disrupção. Nossa tecnologia patenteada e modelo de negócio escalável nos posicionam para capturar uma parcela significativa de um dos maiores mercados da economia.
              </p>
              <p className="text-lg text-stone-700 leading-relaxed">
                Oferecemos uma tese de investimento sólida, baseada em eficiência operacional, vantagens competitivas claras e um forte alinhamento com as tendências globais de sustentabilidade (ESG).
              </p>
            </div>
            <div>
              <Image 
                src="/images/imagenscomdescricao/paisagem-urbana-sao-paulo-ponte-estaiada.png"
                alt="Skyline de São Paulo com a Ponte Estaiada"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Nossos Diferenciais Competitivos</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Nossa estratégia é fundamentada em pilares que garantem a sustentabilidade e o crescimento do negócio a longo prazo.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <ShieldCheck className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Tecnologia Patenteada</h3>
              <p className="text-stone-700">Proteção intelectual no Brasil e EUA, criando uma forte barreira de entrada e garantindo nossa exclusividade no mercado.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <TrendingUp className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Mercado de Alto Crescimento</h3>
              <p className="text-stone-700">Atuação em um setor com demanda reprimida e um déficit habitacional de mais de 6 milhões de unidades no Brasil.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Globe className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Modelo de Negócio Escalável</h3>
              <p className="text-stone-700">Expansão através de licenciamento e parcerias, permitindo um crescimento acelerado com menor necessidade de capital intensivo.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <h2 className="text-3xl font-bold text-stone-900 mb-6">Potencial de Mercado</h2>
               <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                A projeção de crescimento populacional continuará a impulsionar a demanda por novas moradias e infraestrutura. A TECHSUS está perfeitamente posicionada para atender a essa necessidade com uma solução superior.
              </p>
              <div className="bg-stone-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                <Image 
                  src="/images/imagenscomdescricao/diagrama-de-rede-de-fabricas.png"
                  alt="Diagrama de Crescimento e Expansão"
                  width={500}
                  height={300}
                  className="rounded-lg shadow-md border"
                />
              </div>
            </div>
            <div className="lg:order-1">
              <Image 
                src="/images/imagenscomdescricao/mapa-de-localizacao-de-fabricas-em-sao-paulo.png"
                alt="Mapa de localização e potencial de mercado em São Paulo"
                width={600}
                height={450}
                className="rounded-lg shadow-2xl border"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Seja nosso parceiro</h2>
          <p className="text-xl text-stone-700 mb-8 max-w-3xl mx-auto">
            Estamos abertos a conversas com investidores e parceiros estratégicos que desejam fazer parte da revolução da construção civil.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Entre em Contato
          </Link>
        </div>
      </section>
    </div>
  );
}
