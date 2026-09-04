import type { Metadata } from "next";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { ReceiptView } from "@/components/receipt/ReceiptView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.receiptPage.pageTitle,
    description: dict.receiptPage.pageDescription,
  };
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ locale: string; enrolmentId: string }>;
}) {
  const { locale, enrolmentId } = await params;
  const dict = await getDictionary(locale);

  return (
    <ReceiptView
      enrolmentId={enrolmentId}
      locale={locale}
      dict={dict.receiptPage}
    />
  );
}