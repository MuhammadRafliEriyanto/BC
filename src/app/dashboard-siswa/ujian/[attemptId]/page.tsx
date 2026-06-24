import type { Metadata } from "next";

import TryoutSiswaPageView from "@/components/dashboard-siswa/pages/TryoutSiswaPageView";

export const metadata: Metadata = {
  title: "Pengerjaan Ujian Siswa",
  description:
    "Halaman pengerjaan UTS, UAS, atau Tryout berdasarkan sesi ujian siswa.",
};

type DashboardSiswaExamAttemptPageProps = {
  params: Promise<{
    attemptId: string;
  }>;
};

export default async function DashboardSiswaExamAttemptPage({
  params,
}: DashboardSiswaExamAttemptPageProps) {
  const { attemptId } = await params;

  return <TryoutSiswaPageView attemptId={attemptId} />;
}
