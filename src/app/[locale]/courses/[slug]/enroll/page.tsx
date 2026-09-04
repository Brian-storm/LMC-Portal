/**
 * CourseEnrollmentPage — Server component that loads the dictionary
 * and passes it to the EnrollmentWizard client component.
 */

import { getDictionary } from "@/dictionaries/get-dictionary";
import EnrollmentWizard from "@/components/enrollment/EnrollmentWizard";

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function CourseEnrollmentPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const dict = await getDictionary(locale);

  return (
    <EnrollmentWizard
      dict={dict.enrollPage}
      currentLocale={locale}
      slug={slug}
    />
  );
}