import PageHeader from "@/components/PageHeader";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contato() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Contato"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Contato" }
        ]}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">Fale Conosco</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              Estamos à disposição para esclarecer dúvidas, agendar reuniões e apresentar nossas soluções inovadoras para a construção civil.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Info Column */}
            <div className="bg-stone-50 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-stone-900 mb-8">Nossos Contatos</h3>
              
              {/* Michel Zenni Contact */}
              <div className="flex items-center mb-8">
                <Image 
                  src="/images/imagenscomdescricao/Michel Zeenni.png"
                  alt="Retrato de Michel Zenni"
                  width={100}
                  height={100}
                  className="rounded-full mr-6"
                />
                <div>
                  <h4 className="text-xl font-bold text-stone-800">Michel Zenni</h4>
                  <p className="text-stone-600">Fundador</p>
                  <div className="flex items-center mt-2">
                    <Mail className="h-5 w-5 text-orange-600 mr-2" />
                    <a href="mailto:michel@zeenni.com.br" className="text-stone-600 hover:text-orange-600">michel@zeenni.com.br</a>
                  </div>
                  <div className="flex items-center mt-1">
                    <Phone className="h-5 w-5 text-orange-600 mr-2" />
                    <p className="text-stone-600">(11) 98222-6111</p>
                  </div>
                </div>
              </div>

              {/* Jose Eduardo Contact */}
              <div className="flex items-center">
                <Image 
                  src="/images/imagenscomdescricao/joseeduardo.png"
                  alt="Retrato de Jose Eduardo Amorim de Almeida"
                  width={100}
                  height={100}
                  className="rounded-full mr-6"
                />
                <div>
                  <h4 className="text-xl font-bold text-stone-800">Jose Eduardo Amorim de Almeida</h4>
                  <p className="text-stone-600">Contato</p>
                  <div className="flex items-center mt-2">
                    <Mail className="h-5 w-5 text-orange-600 mr-2" />
                    <a href="mailto:jeadwt@hotmail.com" className="text-stone-600 hover:text-orange-600">jeadwt@hotmail.com</a>
                  </div>
                  <div className="flex items-center mt-1">
                    <Phone className="h-5 w-5 text-orange-600 mr-2" />
                    <p className="text-stone-600">+55 11 98850-3415</p>
                  </div>
                </div>
              </div>

              <div className="border-t my-8"></div>

              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-orange-600 mr-4 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">Localização</h3>
                  <p className="text-stone-600">São Paulo - SP, Brasil</p>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div>
              <div className="bg-stone-100 p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-stone-900 mb-6">Envie uma Mensagem</h3>
                <form>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-stone-700 font-semibold mb-2">Nome</label>
                    <input type="text" id="name" name="name" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-stone-700 font-semibold mb-2">E-mail</label>
                    <input type="email" id="email" name="email" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-stone-700 font-semibold mb-2">Mensagem</label>
                    <textarea id="message" name="message" rows={5} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg hover:bg-orange-700 transition-colors">
                    Enviar Mensagem
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}