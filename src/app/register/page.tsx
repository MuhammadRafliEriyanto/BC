import type { Metadata } from "next";

import RegisterOnlineView from "@/components/register-online/RegisterOnlineView";
import { ONLINE_PACKAGES, type OnlinePackageKey } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "Register",
  description: "Pendaftaran siswa baru dengan paket membership bimbel.",
};

type RegisterPageProps = {
  searchParams: Promise<{ package?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const requestedPackage = params.package;
  const initialPackageKey = ONLINE_PACKAGES.some((item) => item.packageKey === requestedPackage)
    ? (requestedPackage as OnlinePackageKey)
    : undefined;

  return (
    <RegisterOnlineView
      key={initialPackageKey ?? "default-package"}
      initialPackageKey={initialPackageKey}
    />
  );
}
