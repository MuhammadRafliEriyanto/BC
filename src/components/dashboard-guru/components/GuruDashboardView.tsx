import HeaderProfilGuru from "../sections/HeaderProfilGuru";
import HeaderGuruSection from "../sections/HeaderGuruSection";

export default function GuruDashboardView() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] lg:gap-6">
        <div className="w-full">
          <HeaderProfilGuru />
        </div>

        <div className="flex w-full flex-col gap-5">
          <HeaderGuruSection />
        </div>
      </div>
    </section>
  );
}
