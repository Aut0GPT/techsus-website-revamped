
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { Factory, Truck, HardHat, CheckCircle } from "lucide-react";

const processSteps = [
  {
    icon: <Factory className="h-12 w-12 text-orange-600" />,
    title: "1. Fabricação Industrial (Off-site)",
    description: "O processo começa em nossa fábrica, onde os painéis de concreto são produzidos em um ambiente controlado. Utilizando moldes de alta precisão e maquinário automatizado, garantimos a perfeição dimensional, a qualidade do concreto e a integração de todos os componentes, como dutos e vãos.",
    image: "/images/imagenscomdescricao/vista-ampla-chao-fabrica-paineis.png",
    alt: "Fábrica de painéis de concreto TECHSUS"
  },
  {
    icon: <Truck className="h-12 w-12 text-orange-600" />,
    title: "2. Logística e Transporte",
    description: "Após a cura e um rigoroso controle de qualidade, os painéis são cuidadosamente carregados em veículos especiais. A logística é planejada para otimizar o tempo de transporte e garantir que os painéis cheguem ao canteiro de obras em perfeitas condições e na ordem correta para a montagem.",
    image: "/images/imagenscomdescricao/transporte-de-painel-concreto-em-caminhao-especial.png",
    alt: "Transporte de painel de concreto em caminhão"
  },
  {
    icon: <HardHat className="h-12 w-12 text-orange-600" />,
    title: "3. Montagem Rápida (On-site)",
    description: "No canteiro de obras, a magia acontece. Com o auxílio de um guindaste, os painéis são rapidamente içados e posicionados. Nossa equipe especializada realiza a montagem, conectando os painéis para formar a estrutura da edificação em uma fração do tempo de uma construção convencional.",
    image: "/images/imagenscomdescricao/trabalhadores-montando-casa-de-paineis-de-concreto.png",
    alt: "Montagem de painéis de concreto no canteiro de obras"
  }
];

export default function Processo() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Nosso Processo Construtivo"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Processo" }
        ]}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Do Projeto à Realidade: Eficiência em 3 Etapas</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              O sistema TECHSUS revoluciona a construção civil através de um processo otimizado que garante velocidade, qualidade e sustentabilidade.
            </p>
          </div>

          <div className="space-y-20">
            {processSteps.map((step, index) => (
              <div key={index} className="grid lg:grid-cols-2 gap-12 items-center">
                <div className={`lg:order-${index % 2 === 0 ? '1' : '2'}`}>
                  <div className="flex items-center mb-4">
                    {step.icon}
                    <h3 className="text-2xl font-bold text-stone-900 ml-4">{step.title}</h3>
                  </div>
                  <p className="text-lg text-stone-700 leading-relaxed">{step.description}</p>
                </div>
                <div className={`lg:order-${index % 2 === 0 ? '2' : '1'}`}>
                  <Image 
                    src={step.image}
                    alt={step.alt}
                    width={600}
                    height={400}
                    className="rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center bg-stone-100 p-12 rounded-lg">
            <h2 className="text-3xl font-bold text-stone-900 mb-6">Vantagens do Nosso Processo</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center">
                <CheckCircle className="h-10 w-10 text-green-600 mb-3" />
                <h4 className="text-xl font-semibold mb-2">Velocidade</h4>
                <p className="text-stone-700">Redução de até 40% no tempo total da obra.</p>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="h-10 w-10 text-green-600 mb-3" />
                <h4 className="text-xl font-semibold mb-2">Qualidade Controlada</h4>
                <p className="text-stone-700">Produção industrial garante padrão e precisão.</p>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="h-10 w-10 text-green-600 mb-3" />
                <h4 className="text-xl font-semibold mb-2">Sustentabilidade</h4>
                <p className="text-stone-700">Zero desperdício de materiais no canteiro.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
