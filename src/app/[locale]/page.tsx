import { HomePage } from "@/components/HomePage"; // Adjust path to where HomePage resides

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  return <HomePage currentLocale={locale} />;
}
