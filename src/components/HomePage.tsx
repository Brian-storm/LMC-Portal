import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { CredentialsBar } from "@/components/home/CredentialsBar";
import { FeatureCards } from "@/components/home/FeatureCards";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import type { Dictionary } from "@/dictionaries/types";

interface HomePageProps {
  currentLocale: string;
  dict?: Dictionary;
}

export function HomePage({ currentLocale, dict }: HomePageProps) {
  return (
    <div className="bg-background text-foreground transition-colors duration-200">
      <Breadcrumbs currentLocale={currentLocale} dict={dict?.breadcrumbs} />
      <HeroCarousel currentLocale={currentLocale} dict={dict?.heroCarousel} />
      <CredentialsBar dict={dict?.credentialsBar} />
      <FeatureCards currentLocale={currentLocale} dict={dict?.featureCards} />
      <NewsletterForm currentLocale={currentLocale} dict={dict?.newsletterForm} />
    </div>
  );
}
