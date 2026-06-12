import HeaderProfilGuru from "../sections/HeaderProfilGuru";
import HeaderGuruSection from "../sections/HeaderGuruSection";
import GuruTopbar from "./GuruTopbar";

export default function GuruDashboardView() {
  return (
    <main className="min-h-screen w-full bg-white">
      <GuruTopbar />
      <section className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.72fr)] lg:gap-7 xl:grid-cols-[minmax(300px,0.78fr)_minmax(0,1.8fr)] xl:gap-8">
          <div className="lg:max-w-[24rem]">
            <HeaderProfilGuru />
          </div>

          <div className="lg:pl-2 xl:pl-4">
            <HeaderGuruSection />
          </div>
        </div>
      </section>
    </main>
  );
}
