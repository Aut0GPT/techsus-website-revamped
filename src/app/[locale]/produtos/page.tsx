
import PageHeader from "@/components/PageHeader";
import Image from "next/image";

const projects = [
  {
    category: "Residencial Unifamiliar",
    title: "Casas Térreas e Sobrados",
    description: "Modelos de residências que demonstram a versatilidade e a qualidade de acabamento do sistema TECHSUS para moradias unifamiliares.",
    media: [
      { type: "image", src: "/images/imagenscomdescricao/render-casa-terrea-com-detalhe-em-vermelho.png", alt: "Render 3D casa térrea com detalhe vermelho" },
      { type: "image", src: "/images/imagenscomdescricao/render-casa-terrea-com-faixa-vermelha-vertical.png", alt: "Render 3D casa térrea com faixa vermelha vertical" },
      { type: "image", src: "/images/imagenscomdescricao/familia-em-frente-a-casa-nova-com-detalhe-laranja.png", alt: "Família em frente à casa nova construída" },
      { type: "image", src: "/images/imagenscomdescricao/casa-nova-com-detalhe-laranja-e-grama-nova.png", alt: "Casa nova com acabamento e jardim" },
      { type: "video", src: "/images/imagenscomdescricao/WhatsApp Video 2025-09-10 at 10.17.53_0e18d3f6.mp4", alt: "Vídeo demonstrativo da construção residencial" },
    ],
  },
  {
    category: "Edifícios Multifamiliares",
    title: "Prédios Habitacionais",
    description: "Edifícios residenciais de múltiplos andares construídos com o sistema, provando sua eficácia em projetos verticais de grande escala.",
    media: [
      { type: "image", src: "/images/imagenscomdescricao/perspectivas-de-habitacional-vertical-multifamiliar.png", alt: "Perspectivas de habitacional vertical multifamiliar" },
      { type: "image", src: "/images/imagenscomdescricao/duque2.jpg", alt: "Fileira de prédios residenciais novos de dois andares" },
      { type: "image", src: "/images/imagenscomdescricao/fileira-de-predios-residenciais-novos-de-dois-andares.png", alt: "Prédios residenciais novos com tela de proteção laranja" },
      { type: "image", src: "/images/imagenscomdescricao/canteiro-de-obras-com-predio-em-construcao-e-predios-acabados.png", alt: "Canteiro de obras com prédio em construção e prédios acabados" },
    ],
  },
  {
    category: "Etapas de Montagem",
    title: "Do alicerce até paredes estruturais de vedação",
    description: "Visão geral das etapas de construção, desde a fundação até a montagem final dos painéis no canteiro de obras.",
    media: [
      { type: "image", src: "/images/imagenscomdescricao/guindaste-icando-painel-de-concreto-na-fundacao.png", alt: "Guindaste içando painel de concreto na fundação" },
      { type: "image", src: "/images/imagenscomdescricao/guindaste.jpg", alt: "Guindaste posicionando painéis de concreto" },
      { type: "image", src: "/images/imagenscomdescricao/trabalhadores-montando-casa-de-paineis-de-concreto.png", alt: "Trabalhadores montando casa de painéis de concreto" },
      { type: "image", src: "/images/imagenscomdescricao/casa feita.jpg", alt: "Casa finalizada construída com painéis de concreto" },
    ],
  },
];

export default function Produtos() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Produtos e Soluções"
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
                  {project.media.map((mediaItem, mediaIndex) => {
                    // Determine if this media is a 3D project
                    const is3D = (index === 0 && (mediaIndex === 0 || mediaIndex === 1)) || // Residencial: first 2 media items
                                 (index === 1 && mediaIndex === 0); // Edifícios: first media item
                    
                    // Check if this is the video in the Residencial Unifamiliar section
                    const isVideoToCenter = index === 0 && mediaItem.type === 'video';
                    
                    return (
                      <div key={mediaIndex} className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border relative ${is3D ? 'ring-2 ring-blue-400 ring-opacity-50' : ''} ${isVideoToCenter ? 'lg:col-start-2 lg:col-span-2' : ''}`}>
                        {mediaItem.type === 'image' ? (
                          <Image 
                            src={mediaItem.src}
                            alt={mediaItem.alt}
                            width={400}
                            height={300}
                            className="w-full h-64 object-cover"
                          />
                        ) : (
                          <video 
                            className="w-full h-80 object-cover"
                            controls
                            preload="metadata"
                          >
                            <source src={mediaItem.src} type="video/mp4" />
                            Seu navegador não suporta o elemento de vídeo.
                          </video>
                        )}
                        {is3D && (
                          <div className="absolute top-2 left-2">
                            <span className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs font-semibold shadow-lg">
                              Projeto 3D
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
