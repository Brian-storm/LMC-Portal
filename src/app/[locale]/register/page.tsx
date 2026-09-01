import { getDictionary } from "@/dictionaries/get-dictionary";
import { RegisterForm } from "./register-form";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function RegisterPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return <RegisterForm locale={locale} dict={dict.registerPage} />;
}