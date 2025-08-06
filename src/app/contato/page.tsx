
import PageHeader from "@/components/PageHeader";
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
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-6">Entre em Contato</h2>
              <p className="text-lg text-stone-700 mb-8">
                Estamos à disposição para esclarecer dúvidas, agendar reuniões e apresentar nossas soluções.
              </p>
              <div className="space-y-6">
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-orange-600 mr-4" />
                  <div>
                    <h3 className="font-semibold">E-mail</h3>
                    <a href="mailto:michel@zeenni.com.br" className="text-stone-600 hover:text-orange-600">michel@zeenni.com.br</a>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-orange-600 mr-4" />
                  <div>
                    <h3 className="font-semibold">Telefone</h3>
                    <p className="text-stone-600">(11) 98222-6111</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-orange-600 mr-4" />
                  <div>
                    <h3 className="font-semibold">Localização</h3>
                    <p className="text-stone-600">São Paulo - SP, Brasil</p>
                  </div>
                </div>
              </div>
            </div>
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
