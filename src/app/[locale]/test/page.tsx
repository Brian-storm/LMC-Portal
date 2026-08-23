import {
  StyledComponent,
  ExecutiveNavbar,
  CivicAcademicNavbar,
  RegulatoryNavbar,
} from "@/components/TestStyledComponents";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function TestPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="w-full max-w-none px-6 md:px-12 lg:px-16 py-10 flex flex-col space-y-12">
      <h1>Courses Related</h1>
      <StyledComponent />
          
      <h2>Navigation Bars with Different Styles</h2>
      <ExecutiveNavbar currentLocale={locale} />
      <CivicAcademicNavbar currentLocale={locale} />
      <RegulatoryNavbar currentLocale={locale} />
          
      <h1>End of Style Examples</h1>
    </div>
  );
}