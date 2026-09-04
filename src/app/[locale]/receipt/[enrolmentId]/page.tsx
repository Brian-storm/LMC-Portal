import { getDictionary } from "@/dictionaries/get-dictionary";
import { ReceiptView } from "@/components/receipt/ReceiptView";

/**
 * Receipt page at /[locale]/receipt/[enrolmentId].
 *
 * Phase 1 route (outside (portal) route group) that displays receipt data
 * loaded from the API. Provides PDF download via S3 presigned URL and print.
 */
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