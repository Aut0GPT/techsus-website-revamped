
import PageHeader from "@/components/PageHeader";

export default function Investidores() {
  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader 
        title="Informações para Investidores"
        breadcrumb={[
          { label: "Início", href: "/" },
          { label: "Investidores" }
        ]}
      />
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-4">Em Desenvolvimento</h2>
          <p className="text-lg text-stone-700">Esta página está sendo construída e estará disponível em breve.</p>
        </div>
      </div>
    </div>
  );
}
