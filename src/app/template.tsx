import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/dictionaries";

export default async function PortugueseTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  const dict = await getDictionary('pt');

  return (
    <>
      <Navigation locale="pt" dict={dict} />
      {children}
      <Footer locale="pt" />
    </>
  );
}