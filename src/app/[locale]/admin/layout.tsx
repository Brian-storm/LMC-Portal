import { getDictionary } from "@/dictionaries/get-dictionary";
import { AdminLayoutClient } from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <AdminLayoutClient locale={locale} dict={dict.admin}>
      {children}
    </AdminLayoutClient>
  );
}