import type { Metadata } from "next";

import LandingPageView from "@/components/landing/LandingPageView";

export const metadata: Metadata = {
  title: "Bimbel LMS",
  description:
    "Landing page membership siswa untuk pendaftaran online program bimbingan belajar.",
};

export default function HomePage() {
  return <LandingPageView />;
}
