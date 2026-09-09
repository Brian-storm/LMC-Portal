import Link from "next/link";
import { Mail, MessageCircle, FileText, CheckCircle2 } from "lucide-react";
import { PaymentSlipUploader } from "@/components/PaymentSlipUploader";
import { getDictionary } from "@/dictionaries/get-dictionary";
import type { EnrollPageDict, PaymentUploadDict } from "@/dictionaries/types";

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
  const enrollDict: EnrollPageDict = dict.enrollPage;
  const uploadDict: PaymentUploadDict = dict.paymentUpload;
  const c = enrollDict.confirmation;

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg space-y-6">
      {registrantId ? (
        <>
          {/* Confirmation message block */}
          <div className="bg-emerald-50 border border-emerald-300 rounded-xs p-5 space-y-3 text-sm">
            <div className="flex items-center gap-2 text-emerald-900 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>{c.title}</span>
            </div>
            <p className="text-slate-700">{c.message}</p>
            <p className="text-slate-700">{c.receiptNotice}</p>
            <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-emerald-200">
              <p>
                {c.contactPrompt}{" "}
                <a href={`mailto:${c.contactEmail}`} className="text-primary underline font-semibold">
                  {c.contactEmail}
                </a>{" "}
                {c.orVia}{" "}
                <a
                  href={`https://wa.me/${c.contactWhatsApp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline font-semibold"
                >
                  {c.contactWhatsApp}
                </a>
              </p>
              <a
                href={c.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary underline font-semibold"
              >
                <FileText className="w-3 h-3" />
                {c.brochureLink}
              </a>
            </div>
          </div>

          <PaymentSlipUploader dict={uploadDict} registrantId={registrantId} email={email} />
        </>
      ) : (
        <p className="text-xs text-slate-500 text-center">
          {uploadDict.noRegistration}
        </p>
      )}
    </div>
  );
}