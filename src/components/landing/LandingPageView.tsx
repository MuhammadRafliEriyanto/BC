import { Poppins } from "next/font/google";

import LandingChatbot from "@/components/landing/LandingChatbot";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingAbout from "@/components/landing/sections/LandingAbout";
import LandingFooter from "@/components/landing/sections/LandingFooter";
import LandingEventsSection from "@/components/landing/sections/LandingEventsSection";
import LandingHeroSection from "@/components/landing/sections/LandingHeroSection";
import LandingPaket from "@/components/landing/sections/LandingPaket";
import LandingRegistrationSection from "@/components/landing/sections/LandingRegistrationSection";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function LandingPageView() {
  return (
    <main
      className={`${poppins.className} min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_48%,#ffffff_100%)] text-slate-950`}
    >
      <LandingNavbar />
      <LandingHeroSection />
      <LandingAbout />
      <LandingEventsSection />
      <LandingRegistrationSection />
      <LandingPaket />
      <LandingFooter />
      <LandingChatbot />
    </main>
  );
}
