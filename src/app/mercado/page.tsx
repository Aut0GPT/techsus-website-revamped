import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { Briefcase, Home, School, TrendingUp } from "lucide-react";

const marketSegments = [
  {
    icon: <Home className="h-10 w-10 text-orange-600" />,
    title: "Residencial",
    description: "Construção de casas e edifícios de apartamentos em larga escala, atendendo ao déficit habitacional com velocidade e qualidade."
  },
  {
    icon: <Briefcase className="h-10 w-10 text-orange-600" />,
    title: "Comercial e Industrial",
    description: "Edificação de galpões, centros de distribuição, lojas e outras estruturas comerciais com prazos de entrega reduzidos."
  },
  {
    icon: <School className="h-10 w-10 text-orange-600" />,
    title: "Institucional",
    description: "Construção de escolas, hospitais, creches e outros equipamentos públicos, garantindo agilidade para a administração pública."
  }
];

export default function Mercado() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Oportunidades de Mercado"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Mercado" }
        ]}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">A Revolução da Construção Civil</h2>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                O mercado da construção civil enfrenta um grande desafio: a necessidade de construir mais, mais rápido e com maior sustentabilidade. A construção tradicional, com seus longos prazos, desperdício de material e baixa produtividade, não consegue atender a essa demanda crescente.
              </p>
              <p className="text-lg text-stone-700 leading-relaxed">
                A TECHSUS se posiciona como a solução para este gargalo. Nossa tecnologia de construção industrializada oferece uma alternativa viável e altamente competitiva.
              </p>
            </div>
            <div>
              <Image 
                src="/images/imagenscomdescricao/infografico-desafios-industria-construcao-civil.png"
                alt="Infográfico sobre os desafios da construção civil"
                width={600}
                height={450}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Segmentos de Atuação</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Nossa tecnologia é versátil e pode ser aplicada em uma ampla gama de projetos, atendendo a diversas demandas do mercado.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {marketSegments.map((segment, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-lg text-center hover:scale-105 transition-transform">
                <div className="flex justify-center mb-4">
                  {segment.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">{segment.title}</h3>
                <p className="text-stone-700">{segment.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity Dashboard */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Dashboard de Oportunidades de Mercado</h2>
            <p className="text-lg text-stone-700 max-w-4xl mx-auto">
              Dados consolidados que demonstram o imenso potencial de mercado e a urgente necessidade de soluções industrializadas para a construção civil brasileira.
            </p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>

          {/* Key Market Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white border border-stone-200 p-6 rounded-lg text-center shadow-lg">
              <div className="text-3xl font-bold text-stone-900 mb-2">6.2M</div>
              <div className="text-sm text-stone-700 font-medium">Déficit Habitacional Brasil</div>
              <div className="text-xs text-stone-600 mt-1">8.3% do total nacional</div>
            </div>
            <div className="bg-white border border-stone-200 p-6 rounded-lg text-center shadow-lg">
              <div className="text-3xl font-bold text-stone-900 mb-2">1.2M</div>
              <div className="text-sm text-stone-700 font-medium">Déficit São Paulo</div>
              <div className="text-xs text-stone-600 mt-1">Maior do país</div>
            </div>
            <div className="bg-white border border-stone-200 p-6 rounded-lg text-center shadow-lg">
              <div className="text-3xl font-bold text-stone-900 mb-2">45.97M</div>
              <div className="text-sm text-stone-700 font-medium">População SP (2024)</div>
              <div className="text-xs text-stone-600 mt-1">+6.3% até 2030</div>
            </div>
            <div className="bg-white border border-stone-200 p-6 rounded-lg text-center shadow-lg">
              <div className="text-3xl font-bold text-stone-900 mb-2">R$10.54T</div>
              <div className="text-sm text-stone-700 font-medium">Mercado Global</div>
              <div className="text-xs text-stone-600 mt-1">10% do PIB mundial</div>
            </div>
          </div>

          {/* Growth Projections by Segment */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-6">Hospitais</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-700">Novos até 2030:</span>
                  <span className="font-bold text-stone-900">+60 unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Investimentos:</span>
                  <span className="font-bold text-stone-900">R$ 4.2 bi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Déficit atual:</span>
                  <span className="font-bold text-stone-900">2.0 leitos/1000hab</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-6">Educação</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-700">Escolas até 2030:</span>
                  <span className="font-bold text-stone-900">+135 unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Creches até 2030:</span>
                  <span className="font-bold text-stone-900">+67 unidades</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Investimentos:</span>
                  <span className="font-bold text-stone-900">R$ 3.8 bi</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-6">Hotelaria</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-stone-700">Segmento:</span>
                  <span className="font-bold text-stone-900">Corporativo/Luxo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Interior:</span>
                  <span className="font-bold text-stone-900">Resorts/Lazer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-700">Investimentos:</span>
                  <span className="font-bold text-stone-900">R$ 2.8 bi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Housing Programs Dashboard */}
          <div className="bg-stone-100 rounded-lg p-8 mb-16">
            <h3 className="text-2xl font-bold text-stone-900 mb-6">Programas Habitacionais em Andamento</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-lg">
                <h4 className="text-lg font-bold text-stone-900 mb-4">CDHU - Metas 2025</h4>
                <ul className="space-y-3 text-stone-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    80 provas de conceito para homologação
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    5.000 projetos habitacionais baseados em industrialização
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    10.000 atendimentos em 2024
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    12.000 atendimentos/ano (próximos 5 anos)
                  </li>
                </ul>
              </div>
              <div className="bg-white border border-stone-200 rounded-lg p-6 shadow-lg">
                <h4 className="text-lg font-bold text-stone-900 mb-6">Parceria CAIXA + Gov. SP</h4>
                <div className="space-y-6">
                  <div>
                    <div className="text-2xl font-bold text-stone-900 mb-2">R$ 1 bilhão</div>
                    <div className="text-sm text-stone-600">Investimento Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-900 mb-2">~20 mil unidades</div>
                    <div className="text-sm text-stone-600">Unidades Habitacionais</div>
                  </div>
                  <div className="text-xs text-stone-500 pt-4 border-t border-stone-200">
                    Publicado em 08/04/2025
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deficit Visualization */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <h2 className="text-3xl font-bold text-stone-900 mb-6">Dimensão do Déficit Habitacional</h2>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                O Brasil enfrenta um déficit habitacional de 6.215.313 domicílios, representando 8,3% do total nacional. São Paulo lidera com 1,2 milhão de moradias em falta, enquanto 3,19 milhões de habitações não oferecem condições dignas.
              </p>
              <p className="text-lg text-stone-700 leading-relaxed mb-6">
                A construção industrializada é a única solução capaz de atender essa demanda com a velocidade, qualidade e controle de custos necessários.
              </p>
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <p className="text-stone-700 font-medium">
                  <strong>Impacto:</strong> O déficit pode afetar até 3,7 milhões de pessoas só em São Paulo, representando mais de 10% do total brasileiro.
                </p>
              </div>
            </div>
            <div className="lg:order-1">
              <Image 
                src="/images/imagenscomdescricao/infografico-mapa-deficit-habitacional-brasil.png"
                alt="Infográfico completo do déficit habitacional brasileiro"
                width={600}
                height={450}
                className="rounded-lg shadow-2xl border"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}