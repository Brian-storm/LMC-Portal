import { getDictionary } from "@/dictionaries/get-dictionary";
import { LoginForm } from "./login-form";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return <LoginForm locale={locale} dict={dict.loginPage} />;
}