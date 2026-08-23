import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CredentialsBar } from "@/components/home/CredentialsBar";
import { FeatureCards } from "@/components/home/FeatureCards";
import { NewsletterForm } from "@/components/home/NewsletterForm";

interface HomePageProps {
  currentLocale: string;
}

export function HomePage({ currentLocale }: HomePageProps) {
  return (
    <div className="bg-slate-50 text-slate-800">
      <Breadcrumbs currentLocale={currentLocale} />
      <HeroCarousel currentLocale={currentLocale} />
      <CredentialsBar />
      <FeatureCards currentLocale={currentLocale} />
      <NewsletterForm currentLocale={currentLocale} />
    </div>
  );
}
