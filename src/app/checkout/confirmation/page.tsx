import { PaymentSlipUploader } from "@/components/PaymentSlipUploader";

// 1. Define searchParams as a Promise
type ConfirmationPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

// 2. Make the component function `async`
export default async function ConfirmationPage({
  searchParams,
}: ConfirmationPageProps) {
  // 3. Await searchParams before accessing properties
  const resolvedParams = await searchParams;
  const orderId = resolvedParams.orderId || "ORD-001";

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <PaymentSlipUploader orderId={orderId} />
    </div>
  );
}
