import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { Target, ShieldCheck, Globe, Users, BarChart } from "lucide-react";

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
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Compromisso ESG</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              A sustentabilidade está no centro de nossa estratégia. Nosso modelo de negócio foi desenhado para gerar impacto positivo nos pilares Ambiental, Social e de Governança.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="h-48 w-full mb-4 overflow-hidden rounded-md">
                <Image src="/images/imagenscomdescricao/paisagem-urbana-sao-paulo-ponte-estaiada.png" alt="Cidades sustentáveis - Paisagem urbana de São Paulo" width={400} height={300} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900">ODS da ONU</h3>
              <p className="text-stone-700 mt-2">Contribuímos para cidades e comunidades sustentáveis, indústria, inovação e infraestrutura.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="h-48 w-full mb-4 overflow-hidden rounded-md">
                <Image src="/images/imagenscomdescricao/infografico-mapa-deficit-habitacional-brasil.png" alt="Infográfico do Déficit Habitacional" width={400} height={300} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900">Impacto Social</h3>
              <p className="text-stone-700 mt-2">Ajudamos a reduzir o déficit habitacional e geramos empregos qualificados na indústria.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="h-48 w-full mb-4 overflow-hidden rounded-md">
                <Image src="/images/imagenscomdescricao/logo-do-grupo-piccini-sa.png" alt="Logo do Grupo Piccini" width={400} height={300} className="w-full h-full object-contain bg-stone-50" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900">Governança Sólida</h3>
              <p className="text-stone-700 mt-2">Integramos o Grupo Piccini, um conglomerado com sólida governança e experiência internacional.</p>
            </div>
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
            <div className="lg:order-1 grid grid-cols-2 gap-4">
              <Image 
                src="/images/imagenscomdescricao/diagrama-de-rede-de-fabricas.png"
                alt="Diagrama da rede de fábricas e crescimento"
                width={400}
                height={300}
                className="rounded-lg shadow-lg border"
              />
              <Image 
                src="/images/imagenscomdescricao/perspectivas-de-habitacional-vertical-multifamiliar.png"
                alt="Perspectivas de crescimento habitacional vertical"
                width={400}
                height={300}
                className="rounded-lg shadow-lg border"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}