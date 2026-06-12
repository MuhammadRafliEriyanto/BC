import type { Metadata } from "next";

import { VerifyEmailView } from "@/components/auth/VerifyEmailView";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verifikasi email akun LMS Bimbel.",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;

  return <VerifyEmailView token={params.token ?? null} />;
}
