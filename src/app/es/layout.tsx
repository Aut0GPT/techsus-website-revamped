import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/dictionaries";

export default async function SpanishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = await getDictionary('es');

  return (
    <>
      <Navigation locale="es" dict={dict} />
      {children}
      <Footer locale="es" />
    </>
  );
}