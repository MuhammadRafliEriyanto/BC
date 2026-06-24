import type { Metadata } from "next";

import RegisterOnlinePaymentView from "@/components/register-online/RegisterOnlinePaymentView";

export const metadata: Metadata = {
  title: "Pembayaran Paket",
  description: "Selesaikan pembayaran paket membership siswa baru.",
};

type RegisterPaymentPageProps = {
  params: Promise<{ paymentId: string }>;
};

export default async function RegisterPaymentPage({ params }: RegisterPaymentPageProps) {
  const { paymentId } = await params;

  return <RegisterOnlinePaymentView paymentId={paymentId} />;
}
