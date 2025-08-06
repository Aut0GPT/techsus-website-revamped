import PageHeader from "@/components/PageHeader";
import Image from "next/image";

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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Tecnologia e Inovação</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Nosso sistema construtivo é baseado em painéis de concreto autoportantes, produzidos em um ambiente industrial controlado para garantir a máxima qualidade e precisão.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-4">Produção Off-site</h3>
              <p className="text-stone-700 mb-4">
                A fabricação dos painéis ocorre em nossas fábricas, utilizando maquinário de ponta que garante a perfeição dimensional e a incorporação de todos os elementos necessários, como vãos para portas e janelas, e dutos para instalações elétricas e hidráulicas.
              </p>
              <p className="text-stone-700">
                Este processo industrializado elimina o desperdício de materiais, reduz o impacto ambiental e assegura um controle de qualidade rigoroso em todas as etapas.
              </p>
            </div>
            <div className="text-center">
              <Image 
                src="/images/slide_34_imagem_1.png" 
                alt="Maquinário industrial" 
                width={500} 
                height={350} 
                className="rounded-lg shadow-lg"
              />
              <p className="text-sm text-stone-600 mt-2">Equipamento de produção de painéis.</p>
            </div>
          </div>

          <div className="text-center my-12">
            <h3 className="text-2xl font-bold text-stone-900 mb-4">Detalhes Técnicos da Conexão</h3>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              A inovação do sistema TECHSUS reside também na forma como os painéis se conectam, criando uma estrutura monolítica, robusta e de alta performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
             <div className="text-center">
              <Image 
                src="/images/slide_33_imagem_1.png" 
                alt="Detalhe técnico da laje" 
                width={500} 
                height={400} 
                className="rounded-lg shadow-lg border"
              />
               <p className="text-sm text-stone-600 mt-2">Seção transversal da conexão entre painel e laje.</p>
            </div>
            <div className="text-center">
              <Image 
                src="/images/slide_33_imagem_2.png" 
                alt="Detalhes técnicos das nervuras" 
                width={500} 
                height={400} 
                className="rounded-lg shadow-lg border"
              />
              <p className="text-sm text-stone-600 mt-2">Tipos de nervuras e ligações entre painéis.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Montagem On-site</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Os painéis são transportados para o canteiro de obras e montados de forma rápida e eficiente, como um grande quebra-cabeça de alta precisão.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center">
              <Image 
                src="/images/slide_34_imagem_4.png" 
                alt="Montagem de painel com guindaste" 
                width={500} 
                height={350} 
                className="rounded-lg shadow-lg"
              />
              <p className="text-sm text-stone-600 mt-2">Operário guia painel durante a montagem.</p>
            </div>
            <div className="text-center">
              <Image 
                src="/images/slide_34_imagem_5.png" 
                alt="Montagem de uma casa" 
                width={500} 
                height={350} 
                className="rounded-lg shadow-lg"
              />
              <p className="text-sm text-stone-600 mt-2">Painéis sendo unidos para formar uma residência.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}