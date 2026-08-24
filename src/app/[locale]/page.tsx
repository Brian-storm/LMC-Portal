import { HomePage } from "@/components/HomePage"; // Adjust path to where HomePage resides
import { getDictionary } from "@/dictionaries/get-dictionary"; // Adjust path to your getDictionary helper

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  // 1. Fetch the dictionary for the active locale
  const dict = await getDictionary(locale);

  // 2. Pass dict down to HomePage
  return <HomePage currentLocale={locale} dict={dict} />;
}
