import type { Metadata } from "next";

import RegisterOnlineStatusView from "@/components/register-online/RegisterOnlineStatusView";

export const metadata: Metadata = {
  title: "Status Membership",
  description: "Ringkasan pembayaran dan status membership siswa.",
};

export default async function RegisterOnlineStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string; access?: string }>;
}) {
  const params = await searchParams;

  return (
    <RegisterOnlineStatusView
      paymentId={params.paymentId ?? null}
      access={params.access ?? null}
    />
  );
}
