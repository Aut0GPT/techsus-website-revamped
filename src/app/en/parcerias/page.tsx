import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";

export default function Parcerias() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Parcerias"
      />
      
      {/* Knowledge Center Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Central de Conhecimentos e Parcerias Acadêmicas</h2>
            <p className="text-lg text-stone-700 max-w-4xl mx-auto">
              Nossa estratégia de inovação é fundamentada em sólidas parcerias com universidades e instituições de pesquisa, 
              garantindo validação científica, desenvolvimento contínuo e redução de riscos para nossos investidores.
            </p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-6">Ecossistema de Pesquisa e Validação</h3>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                Estabelecemos um robusto ecossistema de conhecimento através de parcerias estratégicas com as principais 
                instituições de pesquisa do país. Esta abordagem garante a validação científica de nossa tecnologia e 
                impulsiona a inovação contínua.
              </p>
              <p className="text-lg text-stone-700 leading-relaxed">
                Para os investidores, isso significa menor risco tecnológico, maior credibilidade no mercado e um 
                pipeline constante de inovações que manterão nossa vantagem competitiva.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-stone-50 p-6 rounded-lg shadow-lg text-center">
                <GraduationCap className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-bold text-stone-900 mb-2">Universidades Parceiras</h4>
                <p className="text-stone-600 text-sm">Colaboração acadêmica para pesquisa e desenvolvimento</p>
              </div>
              <div className="bg-stone-50 p-6 rounded-lg shadow-lg text-center">
                <BookOpen className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-bold text-stone-900 mb-2">Transferência de Conhecimento</h4>
                <p className="text-stone-600 text-sm">Aplicação prática de pesquisas científicas</p>
              </div>
              <div className="bg-stone-50 p-6 rounded-lg shadow-lg text-center">
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-bold text-stone-900 mb-2">Networking Institucional</h4>
                <p className="text-stone-600 text-sm">Rede de contatos estratégicos</p>
              </div>
              <div className="bg-stone-50 p-6 rounded-lg shadow-lg text-center">
                <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-bold text-stone-900 mb-2">Validação Científica</h4>
                <p className="text-stone-600 text-sm">Credibilidade através de testes rigorosos</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-stone-100 to-stone-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-stone-900 mb-6 text-center">Principais Parcerias Institucionais</h3>
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/imagenscomdescricao/iptlogo.jpg"
                      alt="Logo do IPT - Instituto de Pesquisas Tecnológicas"
                      width={120}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-orange-600 mb-4">IPT - Instituto de Pesquisas Tecnológicas</h4>
                    <p className="text-stone-700 leading-relaxed">
                      O Instituto de Pesquisas Tecnológicas do Estado de São Paulo (IPT) é uma das mais tradicionais e renomadas instituições de pesquisa e inovação do Brasil, com uma história que remonta ao ano de 1899. Com mais de 125 anos dedicados ao desenvolvimento tecnológico, à pesquisa aplicada e à inovação aberta, o IPT tem desempenhado papel fundamental na transformação industrial, tecnológica e social do país.
                    </p>
                    <p className="text-stone-700 leading-relaxed mt-4">
                      Por meio de sua atuação com a indústria da construção civil, em parceria com centros de pesquisa e outras ICTs, o IPT tem se consolidado como uma plataforma estratégica de inovação tecnológica em diversas áreas, incluindo sistemas construtivos industrializados destinados a habitações e edificações.
                    </p>
                    <div className="mt-6">
                      <ul className="text-stone-700 space-y-2">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Ensaios e certificações em laboratórios
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Validação de novas tecnologias e novas patentes
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Apoio na normatização técnica
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Redução de Riscos
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Credibilidade técnica
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Conformidade com normas
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/imagenscomdescricao/netprelogo.jpg"
                      alt="Logo do NETPre - Núcleo de Estudos e Tecnologia em Pré-Moldados de Concreto"
                      width={120}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-orange-600 mb-4">Núcleo de Estudos e Tecnologia em Pré-Moldados de Concreto (NETPre)</h4>
                    <p className="text-stone-700 leading-relaxed">
                      Núcleo de Estudos e Tecnologia em Pré-Moldados de Concreto (NETPre) da Universidade Federal de São Carlos (UFSCar) foi criado em 2004 a partir de um Programa de Pesquisa Pós-Doutoral em Centros Emergentes da FAPESP.
                    </p>
                    <p className="text-stone-700 leading-relaxed mt-4">
                      Através do Convênio Institucional de Colaboração Tecnológica entre a UFSCar com a Associação Brasileira de Construção Industrializada de Concreto (ABCIC), foi construído em 2005 na UFSCar o primeiro laboratório dedicado ao estudo das Estruturas Pré-Moldadas de Concreto no Brasil.
                    </p>
                    <div className="mt-6">
                      <ul className="text-stone-700 space-y-2">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Pesquisa em pré-moldados de concreto e novos materiais
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Validação de novas tecnologias e novas patentes
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Inovação em sistemas construtivos
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Formação de recursos humanos
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Intercâmbio com tecnologias internacionais
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Laboratórios de materiais especializados
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          Conformidade com normas
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-8 shadow-lg">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/imagenscomdescricao/Fumeplogo.jpg"
                      alt="Logo da FUMEP"
                      width={120}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-orange-600 mb-4">FUMEP</h4>
                    <p className="text-stone-700 leading-relaxed">
                      FUMEP ocupa atualmente mais de 25.000 metros quadrados de área construída, espaço utilizado por suas quatro unidades de ensino cursos de nível superior, cursos de pós-graduação, cursos técnicos e mais de cursos profissionalizantes, além do Ensino Médio.
                    </p>
                    <p className="text-stone-700 leading-relaxed mt-4">
                      A estrutura mantém 42 laboratórios, 11 anfiteatros, salão nobre, ampla biblioteca, quadra esportiva, dois campos de futebol, cantina, restaurante, academia ao ar livre com pista de caminhada e estacionamento com 1.200 vagas.
                    </p>
                    <p className="text-stone-700 leading-relaxed mt-4">
                      A FUMEP tem como principais atribuições o estímulo e o aperfeiçoamento do ensino e da pesquisa e a efetivação de convênios com universidades e entidades culturais, científicas e empresariais do setor público ou privado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}