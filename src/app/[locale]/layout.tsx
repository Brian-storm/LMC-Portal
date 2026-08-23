// src/app/[locale]/layout.tsx
import { getDictionary, Locale } from "@/dictionaries/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Single, Unified Navbar handling links, accessibility, and i18n */}
      <Navbar
        dict={dict.nav}
        accessDict={dict.accessibility}
        currentLocale={locale}
      />

      <main className="flex-1">{children}</main>

      <Footer dict={dict.footer} currentLocale={locale} />
    </div>
  );
}
