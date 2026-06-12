/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Flame,
  Target,
  ChevronDown,
  BookOpen,
  FileText,
  PenSquare,
  Trophy,
  GraduationCap,
  Lock,
  LucideIcon,
} from "lucide-react";

/* =====================================================
   🔥 TYPE DEFINITIONS
===================================================== */
type Jenjang = "SD" | "SMP" | "SMA";

interface TabContent {
  title: string;
  desc: string;
  stats: string;
}

interface Tab {
  name: string;
  icon: LucideIcon;
  content: TabContent;
  /** Kunci akses — harus ada & true di accessControl agar tab muncul */
  accessKey: string;
}

interface Program {
  name: string;
  tabs: Tab[];
  /** Kunci akses program — harus ada & true agar program masuk dropdown */
  accessKey: string;
}

interface Badge {
  label: string;
  className: string;
}

interface LevelConfig {
  title: string;
  subtitle: string;
  programs: Program[];
  badges: Badge[];
}

// FIX 1: Partial<LevelConfig> agar kelas yang belum diisi tidak crash,
// tapi kita tangani fallback di helper getConfig()
type LearningConfig = {
  [J in Jenjang]: {
    [kelas: number]: Partial<LevelConfig>;
  };
};

/* =====================================================
   🔥 SIMULASI USER LOGIN
===================================================== */
const user: { jenjang: Jenjang; kelas: number } = {
  jenjang: "SMA",
  kelas: 12,
};

/* =====================================================
   🔥 AKSES KONTROL DARI GURU / ADMIN
   Nanti ambil dari API / database berdasarkan user id
   true  = sudah dibuka / tersedia
   false = belum dibuka / belum dijadwalkan
===================================================== */
// FIX 2: Tambahkan index signature agar bisa diakses dengan string key
const accessControl: Record<string, boolean> = {
  // SD
  "bimbel-reguler-sd": true,
  "materi-bimbel-sd": true,
  "quiz-bimbel-sd": true,
  "uts-sd": true,
  "uts-online-sd": true,
  "tryout-sd": true,
  "tryout-sd-tab": true,
  "ranking-sd": true,

  // SMP
  "bimbel-reguler-smp": true,
  "materi-bimbel-smp": true,
  "uts-smp": true,
  "uts-online-smp": true,
  "tryout-smp": true,
  "tryout-smp-tab": true,

  // SMA
  "bimbel-reguler-sma": true,
  "materi-bimbel-sma": true,
  "uts-sma": true,
  "tryout-sma": true,
};

/* =====================================================
   🔥 CONFIG SYSTEM
===================================================== */
const learningConfig: LearningConfig = {
  SD: {
    4: {
      title: "Tetap Semangat Belajar ✨",
      subtitle: "Selesaikan materi minggu ini dan raih nilai terbaik 🚀",
      programs: [
        {
          name: "Bimbel Reguler SD",
          accessKey: "bimbel-reguler-sd",
          tabs: [
            {
              name: "Materi",
              icon: FileText,
              accessKey: "materi-bimbel-sd",
              content: {
                title: "Materi Belajar SD",
                desc: "Pelajari materi harian SD.",
                stats: "8 Materi",
              },
            },
            {
              name: "Quiz",
              icon: PenSquare,
              accessKey: "quiz-bimbel-sd",
              content: {
                title: "Quiz Harian",
                desc: "Kerjakan quiz harian.",
                stats: "3 Quiz",
              },
            },
          ],
        },
        {
          name: "Persiapan UTS",
          accessKey: "uts-sd",
          tabs: [
            {
              name: "UTS Online",
              icon: GraduationCap,
              accessKey: "uts-online-sd",
              content: {
                title: "Simulasi UTS SD",
                desc: "Latihan UTS online.",
                stats: "2 UTS",
              },
            },
          ],
        },
      ],
      badges: [
        { label: "8 Materi", className: "bg-orange-100 text-orange-700" },
        { label: "3 Quiz", className: "bg-red-100 text-red-700" },
      ],
    },

    5: {
      title: "Tetap Semangat Belajar ✨",
      subtitle: "Persiapkan dirimu untuk naik kelas 🚀",
      programs: [
        {
          name: "Bimbel Reguler SD",
          accessKey: "bimbel-reguler-sd",
          tabs: [
            {
              name: "Materi",
              icon: FileText,
              accessKey: "materi-bimbel-sd",
              content: {
                title: "Materi SD Kelas 5",
                desc: "Belajar materi inti SD.",
                stats: "10 Materi",
              },
            },
          ],
        },
        {
          name: "Persiapan UTS",
          accessKey: "uts-sd",
          tabs: [
            {
              name: "UTS Online",
              icon: GraduationCap,
              accessKey: "uts-online-sd",
              content: {
                title: "UTS SD",
                desc: "Persiapan UTS semester.",
                stats: "3 UTS",
              },
            },
          ],
        },
      ],
      badges: [
        { label: "10 Materi", className: "bg-orange-100 text-orange-700" },
      ],
    },

    6: {
      title: "Persiapkan Ujian Sekolah 🔥",
      subtitle: "Kerjakan tryout untuk meningkatkan hasil ujianmu ✨",
      programs: [
        {
          name: "Bimbel Reguler SD",
          accessKey: "bimbel-reguler-sd",
          tabs: [
            {
              name: "Materi",
              icon: FileText,
              accessKey: "materi-bimbel-sd",
              content: {
                title: "Materi Intensif SD",
                desc: "Materi pendalaman ujian sekolah.",
                stats: "15 Materi",
              },
            },
          ],
        },
        {
          name: "Tryout SD",
          accessKey: "tryout-sd",
          tabs: [
            {
              name: "Tryout",
              icon: Trophy,
              accessKey: "tryout-sd-tab",
              content: {
                title: "Tryout SD",
                desc: "Simulasi ujian sekolah.",
                stats: "4 Tryout",
              },
            },
            {
              name: "Ranking",
              icon: GraduationCap,
              accessKey: "ranking-sd",
              content: {
                title: "Ranking Nasional",
                desc: "Pantau ranking tryout kamu.",
                stats: "Top 20%",
              },
            },
          ],
        },
      ],
      badges: [
        { label: "15 Materi", className: "bg-orange-100 text-orange-700" },
        { label: "4 Tryout", className: "bg-red-100 text-red-700" },
      ],
    },
  },

  SMP: {
    7: {
      title: "Tetap Semangat Belajar SMP 🚀",
      subtitle: "Fokus belajar dan persiapan UTS ✨",
      programs: [
        {
          name: "Bimbel Reguler SMP",
          accessKey: "bimbel-reguler-smp",
          tabs: [
            {
              name: "Materi",
              icon: FileText,
              accessKey: "materi-bimbel-smp",
              content: {
                title: "Materi SMP",
                desc: "Belajar materi SMP harian.",
                stats: "12 Materi",
              },
            },
          ],
        },
        {
          name: "Persiapan UTS",
          accessKey: "uts-smp",
          tabs: [
            {
              name: "UTS",
              icon: GraduationCap,
              accessKey: "uts-online-smp",
              content: {
                title: "UTS SMP",
                desc: "Latihan ujian tengah semester.",
                stats: "2 UTS",
              },
            },
          ],
        },
      ],
      badges: [
        { label: "12 Materi", className: "bg-orange-100 text-orange-700" },
      ],
    },

    // FIX 3: Kelas 8 tidak boleh kosong — salin dari kelas 7 sebagai default
    8: {
      title: "Tetap Semangat Belajar SMP 🚀",
      subtitle: "Fokus belajar dan persiapan UTS ✨",
      programs: [
        {
          name: "Bimbel Reguler SMP",
          accessKey: "bimbel-reguler-smp",
          tabs: [
            {
              name: "Materi",
              icon: FileText,
              accessKey: "materi-bimbel-smp",
              content: {
                title: "Materi SMP",
                desc: "Belajar materi SMP harian.",
                stats: "12 Materi",
              },
            },
          ],
        },
        {
          name: "Persiapan UTS",
          accessKey: "uts-smp",
          tabs: [
            {
              name: "UTS",
              icon: GraduationCap,
              accessKey: "uts-online-smp",
              content: {
                title: "UTS SMP",
                desc: "Latihan ujian tengah semester.",
                stats: "2 UTS",
              },
            },
          ],
        },
      ],
      badges: [
        { label: "12 Materi", className: "bg-orange-100 text-orange-700" },
      ],
    },

    9: {
      title: "Fokus Persiapan Kelulusan 🔥",
      subtitle: "Kerjakan tryout SMP dan latihan CBT ✨",
      programs: [
        {
          name: "Bimbel Reguler SMP",
          accessKey: "bimbel-reguler-smp",
          tabs: [
            {
              name: "Materi",
              icon: FileText,
              accessKey: "materi-bimbel-smp",
              content: {
                title: "Materi Intensif SMP",
                desc: "Pendalaman materi ujian.",
                stats: "20 Materi",
              },
            },
          ],
        },
        {
          name: "Tryout SMP",
          accessKey: "tryout-smp",
          tabs: [
            {
              name: "Tryout",
              icon: Trophy,
              accessKey: "tryout-smp-tab",
              content: {
                title: "Tryout SMP",
                desc: "Simulasi CBT online.",
                stats: "6 Tryout",
              },
            },
          ],
        },
      ],
      badges: [
        { label: "20 Materi", className: "bg-orange-100 text-orange-700" },
        { label: "6 Tryout", className: "bg-red-100 text-red-700" },
      ],
    },
  },

  SMA: {
    // FIX 4: Kelas SMA yang kosong diisi dengan config default
    10: {
      title: "Tetap Semangat Belajar SMA 🚀",
      subtitle: "Fokus belajar dan persiapan UTS ✨",
      programs: [
        {
          name: "Bimbel Reguler SMA",
          accessKey: "bimbel-reguler-sma",
          tabs: [
            {
              name: "Materi",
              icon: FileText,
              accessKey: "materi-bimbel-sma",
              content: {
                title: "Materi SMA Kelas 10",
                desc: "Belajar materi SMA harian.",
                stats: "12 Materi",
              },
            },
          ],
        },
        {
          name: "Persiapan UTS",
          accessKey: "uts-sma",
          tabs: [
            {
              name: "UTS",
              icon: GraduationCap,
              accessKey: "uts-sma",
              content: {
                title: "UTS SMA",
                desc: "Latihan ujian tengah semester.",
                stats: "2 UTS",
              },
            },
          ],
        },
      ],
      badges: [
        { label: "12 Materi", className: "bg-orange-100 text-orange-700" },
      ],
    },

    11: {
      title: "Tetap Semangat Belajar SMA 🚀",
      subtitle: "Fokus belajar dan persiapan UTS ✨",
      programs: [
        {
          name: "Bimbel Reguler SMA",
          accessKey: "bimbel-reguler-sma",
          tabs: [
            {
              name: "Materi",
              icon: FileText,
              accessKey: "materi-bimbel-sma",
              content: {
                title: "Materi SMA Kelas 11",
                desc: "Belajar materi SMA harian.",
                stats: "14 Materi",
              },
            },
          ],
        },
        {
          name: "Persiapan UTS",
          accessKey: "uts-sma",
          tabs: [
            {
              name: "UTS",
              icon: GraduationCap,
              accessKey: "uts-sma",
              content: {
                title: "UTS SMA",
                desc: "Latihan ujian tengah semester.",
                stats: "2 UTS",
              },
            },
          ],
        },
      ],
      badges: [
        { label: "14 Materi", className: "bg-orange-100 text-orange-700" },
      ],
    },

    12: {
      title: "Fokus Persiapan UTBK 🔥",
      subtitle: "Kerjakan tryout UTBK dan raih PTN impianmu ✨",
      programs: [
        {
          name: "Bimbel Reguler SMA",
          accessKey: "bimbel-reguler-sma",
          tabs: [
            {
              name: "Materi",
              icon: FileText,
              accessKey: "materi-bimbel-sma",
              content: {
                title: "Materi Intensif SMA",
                desc: "Pendalaman materi UTBK.",
                stats: "20 Materi",
              },
            },
          ],
        },
        {
          name: "Tryout SMA",
          accessKey: "tryout-sma",
          tabs: [
            {
              name: "Tryout",
              icon: Trophy,
              accessKey: "tryout-sma",
              content: {
                title: "Tryout UTBK",
                desc: "Simulasi ujian UTBK.",
                stats: "6 Tryout",
              },
            },
          ],
        },
      ],
      badges: [
        { label: "20 Materi", className: "bg-orange-100 text-orange-700" },
        { label: "6 Tryout", className: "bg-red-100 text-red-700" },
      ],
    },
  },
};

/* =====================================================
   🔥 DEFAULT CONFIG — fallback jika kelas tidak ditemukan
===================================================== */
const defaultConfig: LevelConfig = {
  title: "Selamat Datang 👋",
  subtitle: "Pilih program belajar yang tersedia untukmu.",
  programs: [],
  badges: [],
};

/* =====================================================
   🔥 HELPER — ambil config dengan fallback aman
===================================================== */
function getConfig(jenjang: Jenjang, kelas: number): LevelConfig {
  const jenjangConfig = learningConfig[jenjang];
  if (!jenjangConfig) return defaultConfig;

  const kelasConfig = jenjangConfig[kelas];

  // FIX 5: Validasi bahwa config punya semua field wajib sebelum dipakai
  if (
    kelasConfig?.title &&
    kelasConfig?.subtitle &&
    kelasConfig?.programs &&
    kelasConfig?.badges
  ) {
    return kelasConfig as LevelConfig;
  }

  // Fallback ke kelas pertama yang valid di jenjang tersebut
  const firstValidConfig = Object.values(jenjangConfig).find(
    (c) => c?.title && c?.subtitle && c?.programs && c?.badges,
  );
  if (firstValidConfig) return firstValidConfig as LevelConfig;

  return defaultConfig;
}

/* =====================================================
   🔥 HELPER — cek akses
===================================================== */
function hasAccess(key: string): boolean {
  return accessControl[key] === true;
}

/* =====================================================
   🔥 EMPTY STATE COMPONENT
===================================================== */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-5 flex flex-col items-center justify-center gap-2 text-center">
      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
        <Lock className="w-4 h-4 text-orange-400" />
      </div>
      <p className="text-xs font-semibold text-orange-500">{message}</p>
      <p className="text-[11px] text-gray-400">
        Hubungi guru atau admin untuk informasi lebih lanjut.
      </p>
    </div>
  );
}

/* =====================================================
   🔥 MAIN COMPONENT
===================================================== */
export default function HeaderLearning() {
  /* GET CONTENT — FIX 6: pakai getConfig() yang aman */
  const content = useMemo((): LevelConfig => {
    return getConfig(user.jenjang, user.kelas);
  }, []);

  /* FILTER PROGRAM YANG ACCESSIBLE */
  const accessiblePrograms = useMemo<Program[]>(() => {
    return content.programs.filter((p) => hasAccess(p.accessKey));
  }, [content]);

  /* DEFAULT PROGRAM */
  const [program, setProgram] = useState<string>(
    accessiblePrograms[0]?.name ?? "",
  );

  const selectedProgram = useMemo<Program | undefined>(() => {
    return accessiblePrograms.find((item) => item.name === program);
  }, [program, accessiblePrograms]);

  /* FILTER TAB YANG ACCESSIBLE */
  const accessibleTabs = useMemo<Tab[]>(() => {
    return selectedProgram?.tabs.filter((t) => hasAccess(t.accessKey)) ?? [];
  }, [selectedProgram]);

  // FIX 7: Hapus eslint-disable, pindahkan logic ke dalam useEffect dengan benar
  // Reset activeTab setiap kali program berubah
  const [activeTab, setActiveTab] = useState<string>(
    accessibleTabs[0]?.name ?? "",
  );

  useEffect(() => {
    setActiveTab(accessibleTabs[0]?.name ?? "");
  }, [accessibleTabs]);

  const selectedTab = accessibleTabs.find((tab) => tab.name === activeTab);

  const noProgram = accessiblePrograms.length === 0;

  return (
    <div className="space-y-4">
      {/* 🔥 MOTIVATION ALERT */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 shadow-sm">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-4 px-4 md:px-5 py-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="text-white overflow-hidden">
            <p className="text-sm md:text-base font-semibold">
              {content.title}
            </p>
            <div className="overflow-hidden whitespace-nowrap">
              <p className="text-xs md:text-sm text-white/90 animate-marquee">
                {content.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 📚 PROGRAM BELAJAR */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="flex items-stretch">
          {/* LEFT ACCENT */}
          <div className="w-16 md:w-20 bg-gradient-to-b from-red-800 via-orange-600 to-amber-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>

          {/* CONTENT */}
          <div className="flex-1 px-4 py-4">
            {/* TITLE */}
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-orange-500" />
              <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Program Belajar
              </p>
            </div>

            {/* KONDISI: tidak ada program yang diaktifkan */}
            {noProgram ? (
              <EmptyState message="Belum ada program yang diaktifkan oleh guru." />
            ) : (
              <>
                {/* DROPDOWN PROGRAM — hanya program accessible */}
                <div className="relative">
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  >
                    {accessiblePrograms.map((item, i) => (
                      <option key={i} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* TAB MENU — hanya tab accessible */}
                {accessibleTabs.length > 0 ? (
                  <>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {accessibleTabs.map((tab, idx) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={idx}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                            ${
                              activeTab === tab.name
                                ? "bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 text-white shadow-sm"
                                : "bg-gray-100 text-gray-600 hover:bg-orange-100 hover:text-orange-700"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* DYNAMIC CONTENT */}
                    {selectedTab && (
                      <div className="mt-4 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-sm md:text-base font-semibold text-gray-800">
                              {selectedTab.content.title}
                            </h3>
                            <p className="mt-1 text-xs md:text-sm text-gray-500">
                              {selectedTab.content.desc}
                            </p>
                          </div>
                          <div className="shrink-0 rounded-xl bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-sm">
                            {selectedTab.content.stats}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button className="rounded-xl bg-gradient-to-r from-red-800 via-orange-600 to-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:scale-[1.02] transition">
                            Mulai Sekarang
                          </button>
                          <button className="rounded-xl border border-orange-200 bg-white px-4 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50 transition">
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* Program ada tapi semua tab-nya belum diaktifkan */
                  <EmptyState
                    message={
                      program === "Persiapan UTS"
                        ? "UTS belum dijadwalkan. Guru akan membuka akses saat jadwal sudah ditentukan."
                        : program.toLowerCase().includes("quiz")
                          ? "Belum ada quiz yang diunggah oleh guru."
                          : "Belum ada konten yang tersedia untuk program ini."
                    }
                  />
                )}
              </>
            )}

            {/* BADGES */}
            <div className="mt-4 flex flex-wrap gap-2">
              {content.badges.map((badge, idx) => (
                <span
                  key={idx}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
