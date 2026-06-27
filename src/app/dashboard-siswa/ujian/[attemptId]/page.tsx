import type { Metadata } from "next";

import ActiveTryoutPageView from "@/components/dashboard-siswa/pages/ActiveTryoutPageView";

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

  return <ActiveTryoutPageView attemptId={attemptId} />;
}
