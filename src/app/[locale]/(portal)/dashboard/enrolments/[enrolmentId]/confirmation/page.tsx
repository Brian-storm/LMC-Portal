import { redirect } from "next/navigation";

/**
 * Redirect old confirmation page to the new Phase 1 receipt route.
 * The old demo page has been replaced by /[locale]/receipt/[enrolmentId].
 */
export default async function ConfirmationRedirect({
  params,
}: {
  params: Promise<{ locale: string; enrolmentId: string }>;
}) {
  const { locale, enrolmentId } = await params;
  redirect(`/${locale}/receipt/${enrolmentId}`);
}
