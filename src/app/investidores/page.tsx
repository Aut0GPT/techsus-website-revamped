
import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { TrendingUp, ShieldCheck, Globe, BarChart, GraduationCap, BookOpen, Users, Award } from "lucide-react";
import Link from "next/link";

export default function Investidores() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Relações com Investidores"
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">Investindo na Construção do Futuro</h2>
              <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                A TECHSUS representa uma oportunidade única de investimento em um setor tradicional com enorme potencial de disrupção. Nossa tecnologia patenteada e modelo de negócio escalável nos posicionam para capturar uma parcela significativa de um dos maiores mercados da economia.
              </p>
              <p className="text-lg text-stone-700 leading-relaxed">
                Oferecemos uma tese de investimento sólida, baseada em eficiência operacional, vantagens competitivas claras e um forte alinhamento com as tendências globais de sustentabilidade (ESG).
              </p>
            </div>
            <div>
              <Image 
                src="/images/imagenscomdescricao/paisagem-urbana-sao-paulo-ponte-estaiada.png"
                alt="Skyline de São Paulo com a Ponte Estaiada"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Nossos Diferenciais Competitivos</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Nossa estratégia é fundamentada em pilares que garantem a sustentabilidade e o crescimento do negócio a longo prazo.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <ShieldCheck className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Tecnologia Patenteada</h3>
              <p className="text-stone-700">Proteção intelectual no Brasil e EUA, criando uma forte barreira de entrada e garantindo nossa exclusividade no mercado.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <TrendingUp className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Mercado de Alto Crescimento</h3>
              <p className="text-stone-700">Atuação em um setor com demanda reprimida e um déficit habitacional de mais de 6 milhões de unidades no Brasil.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <Globe className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold text-stone-900 mb-3">Modelo de Negócio Escalável</h3>
              <p className="text-stone-700">Expansão através de licenciamento e parcerias, permitindo um crescimento acelerado com menor necessidade de capital intensivo.</p>
            </div>
          </div>
        </div>
      </section>

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
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h4 className="text-lg font-bold text-orange-600 mb-3">IPT - Instituto de Pesquisas Tecnológicas</h4>
                <ul className="text-stone-700 text-sm space-y-2">
                  <li>• Validação de desempenho estrutural</li>
                  <li>• Testes de durabilidade e resistência</li>
                  <li>• Certificações técnicas oficiais</li>
                  <li>• Desenvolvimento de novos materiais</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h4 className="text-lg font-bold text-orange-600 mb-3">Universidades de Engenharia</h4>
                <ul className="text-stone-700 text-sm space-y-2">
                  <li>• Pesquisa em sustentabilidade</li>
                  <li>• Otimização de processos industriais</li>
                  <li>• Formação de mão de obra especializada</li>
                  <li>• Desenvolvimento de protótipos</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h4 className="text-lg font-bold text-orange-600 mb-3">Centros de Inovação</h4>
                <ul className="text-stone-700 text-sm space-y-2">
                  <li>• Automação e Indústria 4.0</li>
                  <li>• Tecnologias emergentes</li>
                  <li>• Análise de dados e eficiência</li>
                  <li>• Sustentabilidade e ESG</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-8">
              <h4 className="text-xl font-bold text-stone-900 mb-4">Valor para Investidores</h4>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div>
                  <h5 className="font-semibold text-stone-900 mb-2">Redução de Riscos</h5>
                  <p className="text-stone-700 text-sm">Validação científica minimiza riscos tecnológicos e acelera adoção no mercado</p>
                </div>
                <div>
                  <h5 className="font-semibold text-stone-900 mb-2">Pipeline de Inovação</h5>
                  <p className="text-stone-700 text-sm">Desenvolvimento contínuo garante vantagem competitiva sustentável</p>
                </div>
                <div>
                  <h5 className="font-semibold text-stone-900 mb-2">Credibilidade Institucional</h5>
                  <p className="text-stone-700 text-sm">Parcerias acadêmicas fortalecem a reputação e confiança do mercado</p>
                </div>
                <div>
                  <h5 className="font-semibold text-stone-900 mb-2">Acesso a Talentos</h5>
                  <p className="text-stone-700 text-sm">Conexão com os melhores profissionais e pesquisadores do setor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <h2 className="text-3xl font-bold text-stone-900 mb-6">Potencial de Mercado</h2>
               <p className="text-lg text-stone-700 mb-4 leading-relaxed">
                A projeção de crescimento populacional continuará a impulsionar a demanda por novas moradias e infraestrutura. A TECHSUS está perfeitamente posicionada para atender a essa necessidade com uma solução superior.
              </p>
              <div className="bg-stone-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                <Image 
                  src="/images/imagenscomdescricao/infografico-mapa-deficit-habitacional-brasil.png"
                  alt="Infográfico do Déficit Habitacional no Brasil - Oportunidade de Mercado"
                  width={500}
                  height={300}
                  className="rounded-lg shadow-md border"
                />
              </div>
            </div>
            <div className="lg:order-1">
              <Image 
                src="/images/imagenscomdescricao/slide-case-cnbm-housing-china.png"
                alt="Case internacional de sucesso - CNBM Housing na China"
                width={600}
                height={450}
                className="rounded-lg shadow-2xl border"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-100">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Seja nosso parceiro</h2>
          <p className="text-xl text-stone-700 mb-8 max-w-3xl mx-auto">
            Estamos abertos a conversas com investidores e parceiros estratégicos que desejam fazer parte da revolução da construção civil.
          </p>
          <Link
            href="/contato"
            className="inline-flex items-center justify-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors"
          >
            Entre em Contato
          </Link>
        </div>
      </section>
    </div>
  );
}
