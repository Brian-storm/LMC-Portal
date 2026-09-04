import { PaymentSlipUploader } from "@/components/PaymentSlipUploader";
import { getDictionary } from "@/dictionaries/get-dictionary";
import type { PaymentUploadDict } from "@/dictionaries/types";

type ConfirmationPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ registrantId?: string; email?: string }>;
};

export default async function ConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const { locale } = await params;
  const resolvedParams = await searchParams;
  const registrantId = resolvedParams.registrantId || "";
  const email = resolvedParams.email || "";

  const dict = await getDictionary(locale);
  const uploadDict: PaymentUploadDict = dict.paymentUpload;

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      {registrantId ? (
        <PaymentSlipUploader dict={uploadDict} registrantId={registrantId} email={email} />
      ) : (
        <p className="text-xs text-slate-500 text-center">
          {uploadDict.noRegistration}
        </p>
      )}
    </div>
  );
}