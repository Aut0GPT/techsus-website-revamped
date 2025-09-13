import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getDictionary } from "@/lib/dictionaries";

export default async function EnglishLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dict = await getDictionary('en');

  return (
    <>
      <Navigation locale="en" dict={dict} />
      {children}
      <Footer locale="en" />
    </>
  );
}