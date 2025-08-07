import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { Target, ShieldCheck, Globe, Users, BarChart, Factory, Building2, Recycle, CloudSun } from "lucide-react";

export default function Estrategia() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Nossa Estratégia"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Estratégia" }
        ]}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Visão de Futuro</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Nossa estratégia é liderar a transformação da construção civil no Brasil, tornando-a mais eficiente, sustentável e alinhada às demandas do século 21.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Image 
                src="/images/imagenscomdescricao/mapa-de-localizacao-de-fabricas-em-sao-paulo.png"
                alt="Mapa com a localização de fábricas no estado de São Paulo"
                width={600}
                height={450}
                className="rounded-lg shadow-2xl"
              />
            </div>
            <div>
              <div className="flex items-center mb-4">
                <Target className="h-10 w-10 text-orange-600" />
                <h3 className="text-2xl font-bold text-stone-900 ml-4">Expansão e Escalabilidade</h3>
              </div>
              <p className="text-lg text-stone-700 leading-relaxed mb-6">
                Planejamos expandir nossa capacidade produtiva através de uma rede de fábricas estrategicamente localizadas, operando em um modelo de licenciamento e parceria. Isso nos permitirá atender a projetos em todo o território nacional com agilidade e custos logísticos reduzidos.
              </p>
              <div className="flex items-center mb-4">
                <Users className="h-10 w-10 text-orange-600" />
                <h3 className="text-2xl font-bold text-stone-900 ml-4">Parcerias Estratégicas</h3>
              </div>
              <p className="text-lg text-stone-700 leading-relaxed">
                Acreditamos no poder da colaboração. Buscamos parcerias com construtoras, incorporadoras, governos e instituições de pesquisa para acelerar a adoção da construção industrializada.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Compromisso ESG e Alinhamento com os ODS da ONU</h2>
            <p className="text-lg text-stone-700 max-w-4xl mx-auto">
              Na vanguarda da Revolução Industrial 4.0, nosso modelo de negócio evolui em total consonância com os Objetivos de Desenvolvimento Sustentável (ODS), gerando impacto positivo e atendendo à agenda ESG.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Factory className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900">ODS 9</h3>
              <p className="text-stone-600 mt-2 font-semibold">Indústria, Inovação e Infraestrutura</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Building2 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900">ODS 11</h3>
              <p className="text-stone-600 mt-2 font-semibold">Cidades e Comunidades Sustentáveis</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <Recycle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900">ODS 12</h3>
              <p className="text-stone-600 mt-2 font-semibold">Consumo e Produção Responsáveis</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <CloudSun className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900">ODS 13</h3>
              <p className="text-stone-600 mt-2 font-semibold">Ação Contra a Mudança Global do Clima</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg text-stone-700 max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
              Além dos benefícios econômicos e de escala, nosso método construtivo atende à agenda ESG, pois promove uma substancial economia de recursos naturais e a consequente diminuição de atividades poluentes.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <h2 className="text-3xl font-bold text-stone-900 mb-6">Projeções de Crescimento</h2>
               <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                O crescimento contínuo da população e a necessidade de infraestrutura em setores chave como hotelaria, hospitais e escolas, representam uma demanda crescente que nosso sistema está pronto para atender.
              </p>
            </div>
            <div className="lg:order-1 grid grid-cols-3 gap-4 items-center">
              <Image 
                src="/images/imagenscomdescricao/diagrama-de-rede-de-fabricas.png"
                alt="Diagrama da rede de fábricas e crescimento"
                width={300}
                height={225}
                className="rounded-lg shadow-lg border col-span-1"
              />
              <Image 
                src="/images/imagenscomdescricao/mapa-de-localizacao-de-fabricas-em-sao-paulo.png"
                alt="Mapa de localização de fabricas em São Paulo"
                width={500}
                height={375}
                className="rounded-lg shadow-lg border col-span-2"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}