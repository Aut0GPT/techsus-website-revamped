
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { CheckCircle } from "lucide-react";

export default function Sistema() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Sistema Construtivo"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Sistema" }
        ]}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Tecnologia e Inovação no DNA</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Nosso sistema é baseado em painéis de concreto autoportantes, produzidos industrialmente para garantir máxima qualidade, precisão e desempenho.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-4">O Painel TECHSUS</h3>
              <p className="text-stone-700 mb-4">
                O coração do nosso sistema é o painel nervurado de concreto armado. Ele é composto por duas placas de concreto conectadas por nervuras treliçadas, criando um núcleo oco que pode ser preenchido com material isolante ou concreto, conforme a necessidade do projeto.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" /><span>Leveza e resistência estrutural.</span></li>
                <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" /><span>Excelente desempenho térmico e acústico.</span></li>
                <li className="flex items-start"><CheckCircle className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" /><span>Instalações elétricas e hidráulicas já embutidas.</span></li>
              </ul>
            </div>
            <div>
              <Image 
                src="/images/imagenscomdescricao/desenho-tecnico-esquema-geral-do-painel.png" 
                alt="Esquema geral do painel de concreto" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-lg border"
              />
            </div>
          </div>

          <div className="text-center my-16">
            <h3 className="text-2xl font-bold text-stone-900 mb-4">Conexões Inteligentes</h3>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              A inovação do sistema reside na forma como os painéis se conectam, criando uma estrutura monolítica robusta e de alta performance através do grauteamento das juntas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
             <div className="text-center">
              <Image 
                src="/images/imagenscomdescricao/desenho-tecnico-da-conexao-entre-laje-e-paineis.png" 
                alt="Detalhe técnico da conexão entre laje e painéis" 
                width={500} 
                height={400} 
                className="rounded-lg shadow-lg border"
              />
               <p className="text-sm text-stone-600 mt-2">Seção transversal da conexão entre painel e laje.</p>
            </div>
            <div className="text-center">
              <Image 
                src="/images/imagenscomdescricao/desenhos-tecnicos-de-conexoes-entre-paineis.png" 
                alt="Detalhes técnicos das nervuras e ligações" 
                width={500} 
                height={400} 
                className="rounded-lg shadow-lg border"
              />
              <p className="text-sm text-stone-600 mt-2">Tipos de nervuras e ligações entre painéis.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Do Controle da Fábrica à Agilidade na Montagem</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Unimos o melhor dos dois mundos: a precisão da indústria e a rapidez da montagem no local.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="text-center">
              <div className="relative h-64 w-full mb-4 overflow-hidden rounded-lg shadow-lg">
                <Image 
                  src="/images/imagenscomdescricao/linha-de-producao-automatizada-paineis-concreto.png" 
                  alt="Produção de painéis em fábrica" 
                  width={500} 
                  height={350} 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-lg font-semibold text-stone-800 mb-2">Produção Off-site</p>
              <p className="text-stone-600 text-base">Qualidade e precisão garantidas em ambiente industrial.</p>
            </div>
            <div className="text-center">
              <div className="relative h-64 w-full mb-4 overflow-hidden rounded-lg shadow-lg">
                <Image 
                  src="/images/imagenscomdescricao/trabalhadores-montando-casa-de-paineis-de-concreto.png" 
                  alt="Montagem de uma casa com painéis de concreto" 
                  width={500} 
                  height={350} 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-lg font-semibold text-stone-800 mb-2">Montagem On-site</p>
              <p className="text-stone-600 text-base">Estrutura montada em tempo recorde com mínimo de mão de obra.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
