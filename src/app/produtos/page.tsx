import PageHeader from "@/components/PageHeader";
import Image from "next/image";

const projects = [
  {
    category: "Residencial Unifamiliar",
    title: "Casa Protótipo - São Simão/SP",
    description: "Um modelo de residência unifamiliar que demonstra a versatilidade e a qualidade do acabamento do sistema TECHSUS.",
    images: [
      "/images/slide_23_imagem_1.png",
      "/images/slide_23_imagem_2.png",
    ],
  },
  {
    category: "Edifícios Multifamiliares",
    title: "Prédio T+3 - Rio Claro/SP",
    description: "Edifício residencial de 4 andares construído com o sistema, provando sua eficácia em projetos verticais de maior escala.",
    images: [
      "/images/slide_29_imagem_1.png",
      "/images/slide_31_imagem_1.png",
      "/images/slide_31_imagem_2.png",
      "/images/slide_31_imagem_3.png",
    ],
  },
  {
    category: "Projetos em Andamento",
    title: "Fases da Construção",
    description: "Visão geral das etapas de construção, desde a fundação até a montagem final dos painéis.",
    images: [
      "/images/slide_32_imagem_1.png",
      "/images/slide_32_imagem_2.png",
      "/images/slide_28_imagem_1.png",
      "/images/slide_28_imagem_2.png",
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Nossos Projetos</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              O sistema TECHSUS é aplicável a uma vasta gama de projetos, desde casas unifamiliares a grandes complexos residenciais e comerciais.
            </p>
          </div>

          <div className="space-y-16">
            {projects.map((project, index) => (
              <div key={index}>
                <h3 className="text-2xl font-bold text-stone-900 mb-2">{project.category}</h3>
                <p className="text-lg text-stone-700 mb-6">{project.title} - <span className="text-stone-600">{project.description}</span></p>
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