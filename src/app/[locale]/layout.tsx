// src/app/[locale]/layout.tsx
import { getDictionary, Locale } from "@/dictionaries/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // Change Locale -> string here
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as Locale; // Cast to your custom Locale type
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
      
      {/* Cookie Consent Dialogue*/}
      <CookieConsent locale={locale} />

      <Footer dict={dict.footer} currentLocale={locale} />
    </div>
  );
}
