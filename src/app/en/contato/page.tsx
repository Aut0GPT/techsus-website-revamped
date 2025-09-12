import PageHeader from "@/components/PageHeader";
import { Mail, MapPin } from "lucide-react";
import { getDictionary } from "@/lib/dictionaries";

export default async function ContactEn() {
  const dict = await getDictionary('en');

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader
        title={dict.contact.title}
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">{dict.contact.subtitle}</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              {dict.contact.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Info Column */}
            <div className="bg-stone-50 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold text-stone-900 mb-8">{dict.contact.our_contacts}</h3>

              {/* Jose Eduardo Contact */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-stone-800">Jose Eduardo Amorim de Almeida</h4>
                <p className="text-stone-600">{dict.contact.contact_person}</p>
                <div className="flex items-center mt-2">
                  <Mail className="h-5 w-5 text-orange-600 mr-2" />
                  <a href="mailto:jeadawt@gmail.com" className="text-stone-600 hover:text-orange-600">jeadawt@gmail.com</a>
                </div>
              </div>

              <div className="border-t my-8"></div>

              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-orange-600 mr-4 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg">{dict.contact.location}</h3>
                  <p className="text-stone-600">{dict.contact.location_text}</p>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div>
              <div className="bg-stone-100 p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-stone-900 mb-6">{dict.contact.send_message}</h3>
                <form>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-stone-700 font-semibold mb-2">{dict.contact.name}</label>
                    <input type="text" id="name" name="name" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-stone-700 font-semibold mb-2">{dict.contact.email}</label>
                    <input type="email" id="email" name="email" className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-stone-700 font-semibold mb-2">{dict.contact.message}</label>
                    <textarea id="message" name="message" rows={5} className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-orange-600 text-white font-semibold py-3 rounded-lg hover:bg-orange-700 transition-colors">
                    {dict.contact.send_button}
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