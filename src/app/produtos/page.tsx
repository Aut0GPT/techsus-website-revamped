
import PageHeader from "@/components/PageHeader";
import Image from "next/image";

const projects = [
  {
    category: "Residencial Unifamiliar",
    title: "Casas Térreas e Sobrados",
    description: "Modelos de residências que demonstram a versatilidade e a qualidade de acabamento do sistema TECHSUS para moradias unifamiliares.",
    images: [
      "/images/imagenscomdescricao/familia-em-frente-a-casa-nova-com-detalhe-laranja.png",
      "/images/imagenscomdescricao/casa-nova-com-detalhe-laranja-e-grama-nova.png",
      "/images/imagenscomdescricao/render-casa-terrea-com-detalhe-em-vermelho.png",
      "/images/imagenscomdescricao/render-casa-terrea-com-faixa-vermelha-vertical.png",
    ],
  },
  {
    category: "Edifícios Multifamiliares",
    title: "Prédios Habitacionais",
    description: "Edifícios residenciais de múltiplos andares construídos com o sistema, provando sua eficácia em projetos verticais de grande escala.",
    images: [
      "/images/imagenscomdescricao/perspectivas-de-habitacional-vertical-multifamiliar.png",
      "/images/imagenscomdescricao/fileira-de-predios-residenciais-novos-de-dois-andares.png",
      "/images/imagenscomdescricao/predios-residenciais-novos-com-tela-de-protecao-laranja.png",
      "/images/imagenscomdescricao/canteiro-de-obras-com-predio-em-construcao-e-predios-acabados.png",
    ],
  },
  {
    category: "Fases da Construção",
    title: "Do Alicerce ao Acabamento",
    description: "Visão geral das etapas de construção, desde a fundação até a montagem final dos painéis no canteiro de obras.",
    images: [
      "/images/imagenscomdescricao/guindaste-icando-painel-de-concreto-na-fundacao.png",
      "/images/imagenscomdescricao/guindaste-posicionando-painel-de-canto-na-fundacao.png",
      "/images/imagenscomdescricao/trabalhadores-montando-as-paredes-de-uma-casa-de-concreto.png",
      "/images/imagenscomdescricao/trabalhadores-montando-casa-de-paineis-de-concreto.png",
    ],
  },
];

export default function Produtos() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Produtos e Soluções"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Produtos" }
        ]}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Nossos Projetos</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              O sistema TECHSUS é aplicável a uma vasta gama de projetos, desde casas unifamiliares a grandes complexos residenciais e comerciais.
            </p>
          </div>

          <div className="space-y-16">
            {projects.map((project, index) => (
              <div key={index}>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-stone-900">{project.category}</h3>
                  <p className="text-lg text-stone-700">{project.title}</p>
                  <p className="text-stone-600 mt-1">{project.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {project.images.map((image, imgIndex) => (
                    <div key={imgIndex} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border">
                      <Image 
                        src={image}
                        alt={`${project.title} - Imagem ${imgIndex + 1}`}
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
