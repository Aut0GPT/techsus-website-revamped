import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Building2, Factory, Leaf, Award, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-900 via-stone-800 to-amber-900 text-white py-20 lg:py-32">
        <div className="absolute inset-0">
          <Image
            src="/images/imagenscomdescricao/paisagem-urbana-sao-paulo-ponte-estaiada.png"
            alt="Paisagem urbana de São Paulo com a Ponte Estaiada"
            layout="fill"
            objectFit="cover"
            className="opacity-30"
          />
        </div>
        <div className="relative container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 text-white shadow-lg">
                Construção Industrializada com Tecnologia Sustentável
              </h1>
              <p className="text-xl text-stone-200 leading-relaxed mb-8">
                Inovação e eficiência para a construção civil moderna, do projeto à entrega.
              </p>
              <Link
                href="/contato"
                className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors shadow-lg"
              >
                Entre em Contato
                <ChevronRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Bem-vindo à TECHSUS</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Industrializamos paredes e lajes em concreto para executar grandes volumes de edificações em tempo reduzido, com desperdício zero e mão de obra qualificada.
            </p>
          </div>
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow">
              <Factory className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Velocidade</h3>
              <p className="text-stone-600">Redução de até 40% no tempo total da obra.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Leaf className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sustentabilidade</h3>
              <p className="text-stone-600">Economia de recursos naturais e zero desperdício.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <Award className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Qualidade Superior</h3>
              <p className="text-stone-600">Controle industrial que elimina patologias e manutenções.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Nosso Processo em Ação</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">Da fábrica ao canteiro de obras, nosso método garante eficiência e precisão.</p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <Image src="/images/imagenscomdescricao/linha-de-producao-automatizada-paineis-concreto.png" alt="Linha de produção de painéis" width={400} height={300} className="rounded-lg shadow-lg mb-4" />
              <h3 className="text-xl font-semibold">1. Fabricação</h3>
              <p className="text-stone-600">Painéis produzidos em ambiente fabril controlado.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Image src="/images/imagenscomdescricao/transporte-de-painel-concreto-em-caminhao-especial.png" alt="Transporte de painel" width={400} height={300} className="rounded-lg shadow-lg mb-4" />
              <h3 className="text-xl font-semibold">2. Logística</h3>
              <p className="text-stone-600">Transporte seguro e otimizado para o canteiro.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Image src="/images/imagenscomdescricao/guindaste-icando-painel-de-concreto-na-fundacao.png" alt="Montagem de painel no canteiro" width={400} height={300} className="rounded-lg shadow-lg mb-4" />
              <h3 className="text-xl font-semibold">3. Montagem</h3>
              <p className="text-stone-600">Estrutura erguida com rapidez e precisão.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies & Success Stories Section */}
      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Cases de Sucesso e Resultados Comprovados</h2>
            <p className="text-lg text-stone-700 max-w-4xl mx-auto">
              Nossos projetos demonstram consistentemente uma redução de 40% no tempo de construção, zero desperdício de materiais e qualidade superior comprovada.
            </p>
            <div className="w-20 h-1 bg-orange-600 mx-auto mt-4"></div>
          </div>
          
          {/* Key Metrics Dashboard */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">40%</div>
              <div className="text-sm text-stone-600">Redução de Tempo</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">0%</div>
              <div className="text-sm text-stone-600">Desperdício de Material</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-sm text-stone-600">Controle de Qualidade</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">4+</div>
              <div className="text-sm text-stone-600">Projetos Entregues</div>
            </div>
          </div>

          {/* Detailed Case Studies */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-12">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <Image src="/images/imagenscomdescricao/familia-em-frente-a-casa-nova-com-detalhe-laranja.png" alt="Família em frente ao protótipo em São Simão" width={500} height={300} className="w-full h-64 object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-stone-900">Casa Protótipo - São Simão/SP</h3>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">ENTREGUE</span>
                </div>
                <p className="text-stone-700 mb-4">
                  Projeto-piloto entregue em Fevereiro de 2025 demonstrando nossa capacidade de execução com qualidade superior e prazos acelerados.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">47.97m²</div>
                    <div className="text-xs text-stone-600">Área Construída</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">60 dias</div>
                    <div className="text-xs text-stone-600">Tempo Total</div>
                  </div>
                </div>
                <blockquote className="border-l-4 border-orange-500 pl-4 italic text-stone-700 text-sm">
                  "A casa ficou exatamente como planejamos, com acabamento perfeito e foi entregue muito mais rápido do que esperávamos."
                </blockquote>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <Image src="/images/imagenscomdescricao/fileira-de-predios-residenciais-novos-de-dois-andares.png" alt="Conjunto habitacional T+3 em Rio Claro" width={500} height={300} className="w-full h-64 object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-stone-900">Edifício T+3 - Rio Claro/SP</h3>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">VERTICAL</span>
                </div>
                <p className="text-stone-700 mb-4">
                  Primeiro projeto vertical demonstrando a aplicação da tecnologia em construções de múltiplos pavimentos com eficiência estrutural.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">891.76m²</div>
                    <div className="text-xs text-stone-600">Área Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">18 apts</div>
                    <div className="text-xs text-stone-600">Unidades</div>
                  </div>
                </div>
                <div className="text-sm text-stone-600 bg-stone-50 p-3 rounded">
                  <strong>Resultado:</strong> Estrutura completa montada em 45% menos tempo que construção tradicional.
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Projects Grid */}
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image src="/images/imagenscomdescricao/exterior-de-casa-terrea-quase-acabada-com-telhado-ceramico.png" alt="Casa em Várzea Paulista" width={400} height={240} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h4 className="text-lg font-bold text-stone-900 mb-2">Casa - Várzea Paulista/SP</h4>
                <p className="text-stone-600 text-sm mb-3">Residência unifamiliar demonstrando versatilidade arquitetônica do sistema.</p>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>✓ Acabamento Premium</span>
                  <span>✓ Prazo Cumprido</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Image src="/images/imagenscomdescricao/predios-residenciais-novos-com-tela-de-protecao-laranja.png" alt="Edifício em Duque de Caxias" width={400} height={240} className="w-full h-48 object-cover" />
              <div className="p-4">
                <h4 className="text-lg font-bold text-stone-900 mb-2">Edifício T+3 - Duque de Caxias/RJ</h4>
                <p className="text-stone-600 text-sm mb-3">Expansão regional demonstrando escalabilidade do sistema construtivo.</p>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>✓ Logística Otimizada</span>
                  <span>✓ Qualidade Certificada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="mt-12 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Impacto dos Nossos Projetos</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-bold mb-2">1,200+</div>
                <div className="text-orange-200">m² Construídos</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">24</div>
                <div className="text-orange-200">Famílias Atendidas</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">0</div>
                <div className="text-orange-200">Retrabalhos Necessários</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Patented Technology Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">Tecnologia Patenteada e Comprovada</h2>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                Nosso sistema construtivo possui proteção intelectual no Brasil e nos EUA, além de ser validado por rigorosos testes em laboratórios credenciados como o IPT.
              </p>
              <div className="flex items-start space-x-4">
                <ShieldCheck className="h-8 w-8 text-orange-600 mt-1" />
                <p className="text-stone-700">As certificações técnicas atestam a conformidade normativa e a qualidade superior do nosso processo industrializado, garantindo segurança e durabilidade.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Image src="/images/imagenscomdescricao/documento-patente-brasil-inpi.png" alt="Patente do Brasil" width={300} height={400} className="rounded-lg shadow-lg border" />
              <Image src="/images/imagenscomdescricao/documento-patente-estados-unidos.png" alt="Patente dos Estados Unidos" width={300} height={400} className="rounded-lg shadow-lg border" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-stone-800 text-white">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Transforme sua Construção com a TECHSUS</h2>
          <p className="text-xl text-stone-300 mb-8 max-w-3xl mx-auto">
            Entre em contato e descubra como nossa tecnologia pode acelerar seus projetos com mais qualidade e sustentabilidade.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Solicitar uma Proposta
            <ChevronRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}