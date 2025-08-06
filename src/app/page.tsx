
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Building2, Factory, Leaf, Target, Users, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-900 via-stone-800 to-amber-900 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6 text-stone-100">
                Construção Industrializada com Tecnologia Sustentável e Altamente Escalável
              </h1>
              <p className="text-xl text-stone-200 leading-relaxed mb-8">
                Inovação e eficiência para a construção civil moderna
              </p>
              <Link
                href="/contato"
                className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
              >
                Entre em Contato
                <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
            <div>
              <Image 
                src="/images/slide_1_imagem_1.png" 
                alt="Sistema Construtivo TECHSUS" 
                width={600} 
                height={400} 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Bem-vindo à TECHSUS</h2>
            <p className="text-lg text-stone-700">Soluções inovadoras para a construção industrializada</p>
          </div>
          <div className="max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <p className="text-lg text-stone-700 mb-6">
                O sistema TECHSUS consiste em industrializar paredes e lajes em concreto que possibilitam aos construtores executar grandes quantidades de edificações em tempo reduzido, sem desperdício de matéria prima e com constante qualificação da mão-de-obra.
              </p>
              <p className="text-lg text-stone-700 mb-6">
                Com a construção industrializada, conseguimos reduzir o tempo de execução das obras, com alta qualidade, total flexibilidade arquitetônica, sem patologias e manutenções futuras, a um custo controlado em conformidade com o planejado, em conformidade com as normas brasileiras e internacionais, trazendo grande competitividade para o mercado da construção civil tradicional.
              </p>
              <p className="text-lg text-stone-700">
                Além dos benefícios econômicos e de escala o método construtivo atende a agenda ESG, já que há substancial economia de recursos naturais e consequente diminuição de atividades poluentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Advantages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Vantagens Competitivas</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              O Sistema TECHSUS oferece benefícios quantificáveis e vantagens técnicas comprovadas para a construção industrializada
            </p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>
          
          {/* Performance Indicators Table */}
          <div className="bg-white border border-stone-200 rounded-lg shadow-lg mb-12 overflow-hidden">
            <div className="bg-stone-800 text-white px-6 py-4">
              <h3 className="text-xl font-bold text-center">Indicadores de Performance Operacional</h3>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center border-r border-stone-200 last:border-r-0">
                  <div className="text-3xl font-bold text-stone-900 mb-2">40%</div>
                  <div className="text-stone-600 font-medium text-sm uppercase tracking-wide">Redução no Tempo</div>
                </div>
                <div className="text-center border-r border-stone-200 last:border-r-0">
                  <div className="text-3xl font-bold text-stone-900 mb-2">40%</div>
                  <div className="text-stone-600 font-medium text-sm uppercase tracking-wide">Redução na Mão-de-obra</div>
                </div>
                <div className="text-center border-r border-stone-200 last:border-r-0">
                  <div className="text-3xl font-bold text-stone-900 mb-2">0%</div>
                  <div className="text-stone-600 font-medium text-sm uppercase tracking-wide">Desperdício de Material</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-stone-900 mb-2">100%</div>
                  <div className="text-stone-600 font-medium text-sm uppercase tracking-wide">Controle de Qualidade</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Core Advantages */}
          <div className="space-y-8">
            <div className="bg-stone-50 border-l-4 border-orange-600 p-8 rounded-r-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-4">Tecnologia Patenteada</h3>
              <p className="text-stone-700 mb-4 leading-relaxed">
                Sistema construtivo com proteção intelectual no Brasil, China e EUA. Certificações técnicas IPT, CDHU e CEF validam a conformidade normativa e atestam a qualidade superior do processo industrializado.
              </p>
              <Link 
                href="/sistema" 
                className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700 border-b border-orange-600 hover:border-orange-700 pb-1"
              >
                Ver Especificações Técnicas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-stone-50 border-l-4 border-stone-600 p-8 rounded-r-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-4">Processo Industrializado</h3>
              <p className="text-stone-700 mb-4 leading-relaxed">
                Fabricação off-site em ambiente controlado garante precisão dimensional e qualidade consistente. Montagem on-site otimizada com redução significativa de tempo e recursos necessários.
              </p>
              <Link 
                href="/processo" 
                className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700 border-b border-orange-600 hover:border-orange-700 pb-1"
              >
                Conhecer o Processo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-stone-50 border-l-4 border-amber-600 p-8 rounded-r-lg">
              <h3 className="text-xl font-bold text-stone-900 mb-4">Versatilidade Arquitetônica</h3>
              <p className="text-stone-700 mb-4 leading-relaxed">
                Aplicável em diversas tipologias: residencial, comercial, institucional e industrial. Flexibilidade total de projeto arquitetônico sem comprometer a eficiência construtiva ou qualidade estrutural.
              </p>
              <Link 
                href="/produtos" 
                className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700 border-b border-orange-600 hover:border-orange-700 pb-1"
              >
                Ver Aplicações
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Recent Projects */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Projetos Recentes</h2>
            <p className="text-lg text-stone-700">Conheça nossas realizações mais recentes</p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-stone-50 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <Image 
                src="/images/slide_29_imagem_1.png" 
                alt="Casa Protótipo São Simão" 
                width={500} 
                height={300} 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-stone-900 mb-3">Casa Protótipo - São Simão/SP</h3>
                <p className="text-stone-700 mb-4">
                  Projeto entregue em Fevereiro de 2025, demonstrando a eficiência e qualidade do sistema construtivo TECHSUS.
                </p>
                <Link 
                  href="/produtos#prototipos" 
                  className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700"
                >
                  Ver Detalhes
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            
            <div className="bg-stone-50 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <Image 
                src="/images/slide_31_imagem_1.png" 
                alt="Prédio T+3 Rio Claro" 
                width={500} 
                height={300} 
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold text-stone-900 mb-3">Prédio T+3 - Rio Claro/SP</h3>
                <p className="text-stone-700 mb-4">
                  Edifício residencial construído com o sistema TECHSUS, demonstrando a aplicação da tecnologia em construções verticais.
                </p>
                <Link 
                  href="/produtos#experiencias" 
                  className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700"
                >
                  Ver Detalhes
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-amber-900 to-stone-800 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Transforme sua Construção com Tecnologia Comprovada
          </h2>
          <p className="text-xl text-stone-200 mb-8 max-w-3xl mx-auto">
            Sistema industrializado com patentes internacionais, certificações técnicas 
            e resultados comprovados em projetos reais.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contato"
              className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
            >
              Entre em Contato
            </Link>
            <a
              href="mailto:michel@zeenni.com.br"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-orange-400 text-orange-400 font-semibold rounded-lg hover:bg-orange-400 hover:text-white transition-colors"
            >
              Solicitar Informações
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
