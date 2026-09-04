import { getDictionary } from "@/dictionaries/get-dictionary";
import { PortalLayoutClient } from "@/components/PortalLayoutClient";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <PortalLayoutClient locale={locale} dict={dict.nav}>
      {children}
    </PortalLayoutClient>
  );
}