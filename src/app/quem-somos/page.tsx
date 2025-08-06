import Image from "next/image";
import { Building2, Award, Target, Users, Leaf, Shield } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default function QuemSomos() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Quem Somos"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Quem Somos" }
        ]}
      />

      {/* About Company */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">A TECHSUS</h2>
              <p className="text-lg text-stone-700 mb-6">
                A TECHSUS é um grupo de empresas voltadas à gestão e implantação de um sistema inovador para a construção industrializada de painéis estruturais bioclimáticos de concreto com patentes requeridas e concedidas no Brasil, China e EUA.
              </p>
              <p className="text-lg text-stone-700">
                Posicionada na vanguarda da Revolução Industrial 4.0 com automação e modelagem de informação, esse modelo evolui em consonância com as agendas ODS - Objetivos de Desenvolvimento Sustentável.
              </p>
            </div>
            <div>
              <Image 
                src="/images/slide_2_imagem_1.png" 
                alt="Processo construtivo TECHSUS" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Founder and Team */}
      <section className="py-16 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Nosso Fundador e Equipe</h2>
            <div className="w-20 h-1 bg-orange-600 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-orange-600 mb-4">Fundador</h3>
              <p className="text-stone-700 mb-4">Com mais de 40 anos de experiência:</p>
              <ul className="space-y-3 text-stone-700">
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  Atuou como projetista estrutural e empreendedor na construção civil
                </li>
                <li className="flex items-start">
                  <Building2 className="h-5 w-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  Responsável pela construção do Shopping Frei Caneca no ano de 2000 onde iniciou a industrialização da construção
                </li>
                <li className="flex items-start">
                  <Target className="h-5 w-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  Montou a primeira fábrica estacionária de pré-fabricados em 2009, dando início à industrialização da construção habitacional com patentes concedidas, Datec, Caixa Econômica Federal e homologação no CDHU
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-orange-600 mb-4">Equipe Multidisciplinar</h3>
              <p className="text-stone-700 mb-4">Profissionais altamente qualificados:</p>
              <ul className="space-y-3 text-stone-700">
                <li className="flex items-start">
                  <Users className="h-5 w-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  Gestores com experiência nas operações industriais
                </li>
                <li className="flex items-start">
                  <Building2 className="h-5 w-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  Engenheiros estruturais e de produção
                </li>
                <li className="flex items-start">
                  <Target className="h-5 w-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  Arquitetos especializados em projetos industrializados
                </li>
                <li className="flex items-start">
                  <Shield className="h-5 w-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  Técnicos em construção civil e montagem
                </li>
                <li className="flex items-start">
                  <Leaf className="h-5 w-5 text-orange-600 mt-1 mr-3 flex-shrink-0" />
                  Especialistas em sustentabilidade e eficiência energética
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Trajectory and Milestones */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Trajetória e Marcos Alcançados</h2>
            <div className="w-20 h-1 bg-orange-600 mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-stone-50 rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-orange-600 mb-6">Desenvolvimento e Validação da Tecnologia</h3>
              <ul className="space-y-3 text-stone-700 mb-6">
                <li className="pl-4 border-l-2 border-orange-200 py-2">
                  Obtenção de patentes no Brasil, China e EUA
                </li>
                <li className="pl-4 border-l-2 border-orange-200 py-2">
                  Certificações técnicas e homologações (IPT, CDHU, CEF)
                </li>
                <li className="pl-4 border-l-2 border-orange-200 py-2">
                  Desenvolvimento de sistema construtivo inovador
                </li>
                <li className="pl-4 border-l-2 border-orange-200 py-2">
                  Criação de processos industrializados de produção
                </li>
              </ul>
            </div>

            <div className="bg-stone-50 rounded-lg p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-orange-600 mb-6">Protótipos e Projetos-Piloto</h3>
              <ul className="space-y-3 text-stone-700 mb-6">
                <li className="pl-4 border-l-2 border-orange-200 py-2">
                  Construção de unidades demonstrativas
                </li>
                <li className="pl-4 border-l-2 border-orange-200 py-2">
                  Validação do processo produtivo e montagem
                </li>
                <li className="pl-4 border-l-2 border-orange-200 py-2">
                  Projetos realizados em Rio Claro-SP, Várzea Paulista-SP e Duque de Caxias-RJ
                </li>
                <li className="pl-4 border-l-2 border-orange-200 py-2">
                  Casa Protótipo em São Simão-SP (Fev/2025)
                </li>
                <li className="pl-4 border-l-2 border-orange-200 py-2">
                  Em processo de homologação na CDHU para casa unifamiliar e edifício de 4 pisos
                </li>
              </ul>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center">
                  <Image 
                    src="/images/slide_29_imagem_1.png" 
                    alt="Protótipo São Simão" 
                    width={200} 
                    height={150} 
                    className="rounded-lg mb-2"
                  />
                  <p className="text-sm text-stone-600">Protótipo São Simão (2025)</p>
                </div>
                <div className="text-center">
                  <Image 
                    src="/images/slide_31_imagem_1.png" 
                    alt="Prédio Rio Claro" 
                    width={200} 
                    height={150} 
                    className="rounded-lg mb-2"
                  />
                  <p className="text-sm text-stone-600">Prédio T+3 Rio Claro</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values and Philosophy */}
      <section className="py-16 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Nossos Valores e Filosofia</h2>
            <div className="w-20 h-1 bg-orange-600 mx-auto"></div>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl border border-stone-200">
              <div className="bg-stone-900 text-white p-8 rounded-t-lg">
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-4">Compromisso com a Excelência</h3>
                  <p className="text-lg text-stone-200 max-w-4xl mx-auto leading-relaxed">
                    A TECHSUS fundamenta suas atividades em pilares sólidos de inovação, qualidade e responsabilidade social, 
                    sempre buscando a excelência técnica e o desenvolvimento sustentável.
                  </p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="border-l-4 border-orange-600 pl-6 hover:bg-stone-50 transition-colors duration-200 py-4">
                    <h4 className="text-xl font-bold text-stone-900 mb-3 uppercase tracking-wide">Inovação Constante</h4>
                    <p className="text-stone-700 leading-relaxed">Desenvolvimento contínuo de tecnologias e processos industriais, mantendo-se na vanguarda da construção sustentável.</p>
                  </div>
                  <div className="border-l-4 border-orange-600 pl-6 hover:bg-stone-50 transition-colors duration-200 py-4">
                    <h4 className="text-xl font-bold text-stone-900 mb-3 uppercase tracking-wide">Qualidade Técnica</h4>
                    <p className="text-stone-700 leading-relaxed">Rigor nos padrões de construção e certificações, garantindo excelência em todos os projetos executados.</p>
                  </div>
                  <div className="border-l-4 border-orange-600 pl-6 hover:bg-stone-50 transition-colors duration-200 py-4">
                    <h4 className="text-xl font-bold text-stone-900 mb-3 uppercase tracking-wide">Responsabilidade Social</h4>
                    <p className="text-stone-700 leading-relaxed">Contribuição ativa para o desenvolvimento urbano sustentável e responsabilidade socioambiental.</p>
                  </div>
                  <div className="border-l-4 border-orange-600 pl-6 hover:bg-stone-50 transition-colors duration-200 py-4">
                    <h4 className="text-xl font-bold text-stone-900 mb-3 uppercase tracking-wide">Parcerias Estratégicas</h4>
                    <p className="text-stone-700 leading-relaxed">Colaboração especializada com instituições de pesquisa, governos e parceiros do setor industrial.</p>
                  </div>
                </div>
              </div>
              <div className="bg-stone-100 px-8 py-6 rounded-b-lg border-t border-stone-200">
                <div className="text-center">
                  <p className="text-stone-600 font-medium">
                    <span className="text-orange-600 font-bold">25+ anos</span> de experiência em construção industrializada • 
                    <span className="text-orange-600 font-bold">Patentes</span> no Brasil, China e EUA • 
                    <span className="text-orange-600 font-bold">Certificações</span> IPT, CDHU, CEF
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}