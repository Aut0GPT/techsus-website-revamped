import PageHeader from "@/components/PageHeader";
import { getDictionary } from "@/lib/dictionaries";

export default async function PageEn() {
  const dict = await getDictionary('en');

  return (
    <div className="min-h-screen bg-stone-50">
      <PageHeader
        title="Coming Soon"
      />
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-stone-900 mb-6">Coming Soon</h2>
            <p className="text-lg text-stone-700 max-w-3xl mx-auto">
              This page is under construction. Please visit again soon.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
