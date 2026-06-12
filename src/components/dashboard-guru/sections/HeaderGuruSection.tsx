/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useEffectEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Flame,
  Lock,
  PenSquare,
  Target,
  Trophy,
} from "lucide-react";

import {
  AuthRequestError,
  authService,
  clearAuthClientState,
  persistAuthUser,
  readPersistedAuthUser,
  type AuthUser,
} from "@/lib/auth";

type RoleTabContent = {
  title: string;
  desc: string;
  stats: string;
};

type GuruTab = {
  name: string;
  icon: LucideIcon;
  content: RoleTabContent;
  href: string;
  enabled: boolean;
};

type GuruProgram = {
  name: string;
  tabs: GuruTab[];
};

type HeaderGuruProfileState = {
  nama: string;
  subject: string;
  branch: string;
  totalClasses: number;
  todaySchedules: number;
};

type TeacherDashboardResponse = {
  success: boolean;
  message: string;
  data?: {
    teacher?: {
      name?: string;
      subject?: string;
      branch?: string;
    };
    summary?: {
      totalClasses?: number;
      todaySchedules?: number;
    };
  };
};

const accessControl = {
  jadwal: true,
  kelas: true,
  materi: true,
  tugas: true,
  tryout: true,
  evaluasi: true,
};

const fallbackHeaderProfile: HeaderGuruProfileState = {
  nama: "Guru",
  subject: "",
  branch: "",
  totalClasses: 0,
  todaySchedules: 0,
};

function buildHeaderProfileFromAuthUser(user: AuthUser): HeaderGuruProfileState {
  return {
    ...fallbackHeaderProfile,
    nama: user.nama,
  };
}

function buildHeaderProfileFromTeacherPayload(
  payload: TeacherDashboardResponse["data"],
): HeaderGuruProfileState | null {
  const teacherName = payload?.teacher?.name?.trim();

  if (!teacherName) {
    return null;
  }

  return {
    nama: teacherName,
    subject: payload?.teacher?.subject?.trim() ?? "",
    branch: payload?.teacher?.branch?.trim() ?? "",
    totalClasses: payload?.summary?.totalClasses ?? 0,
    todaySchedules: payload?.summary?.todaySchedules ?? 0,
  };
}

function EmptyProgramState({ message }: { message: string }) {
  return (
    <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-5 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
        <Lock className="h-4 w-4 text-orange-400" />
      </div>
      <p className="text-xs font-semibold text-orange-500">{message}</p>
      <p className="text-[11px] text-gray-400">
        Akses menu ini disesuaikan dengan kesiapan modul pada dashboard guru.
      </p>
    </div>
  );
}

export default function HeaderGuruSection() {
  const router = useRouter();
  const [profile, setProfile] = useState<HeaderGuruProfileState>(
    fallbackHeaderProfile,
  );

  const guruConfig = useMemo<GuruProgram[]>(
    () => [
      {
        name: "Manajemen Kelas",
        tabs: [
          {
            name: "Jadwal",
            icon: BookOpen,
            href: "/dashboard-guru/jadwal",
            enabled: accessControl.jadwal,
            content: {
              title: "Jadwal Mengajar",
              desc: "Pantau sesi berjalan, ruangan, dan kelas yang akan dimulai.",
              stats:
                profile.todaySchedules > 0
                  ? `${profile.todaySchedules} sesi hari ini`
                  : "Belum ada sesi hari ini",
            },
          },
          {
            name: "Semua Kelas",
            icon: FileText,
            href: "/dashboard-guru/kelas",
            enabled: accessControl.kelas,
            content: {
              title: "Kelas yang Diampu",
              desc: "Lihat ringkasan kelas, peserta, dan progres pertemuan aktif.",
              stats:
                profile.totalClasses > 0
                  ? `${profile.totalClasses} kelas aktif`
                  : "Belum ada kelas aktif",
            },
          },
        ],
      },
      {
        name: "Materi Pembelajaran",
        tabs: [
          {
            name: "Materi",
            icon: PenSquare,
            href: "/dashboard-guru/kelas",
            enabled: accessControl.materi,
            content: {
              title: "Materi Pembelajaran",
              desc: "Pilih kelas untuk mengelola materi per pertemuan, link, dan lampiran pembelajaran.",
              stats:
                profile.totalClasses > 0
                  ? `${profile.totalClasses} kelas siap dikelola`
                  : "Mulai dari Semua Kelas",
            },
          },
        ],
      },
      {
        name: "Tugas & Penilaian",
        tabs: [
          {
            name: "Tugas",
            icon: FileText,
            href: "/dashboard-guru/kelas",
            enabled: accessControl.tugas,
            content: {
              title: "Tugas dan Penilaian",
              desc: "Masuk ke daftar kelas untuk mengatur tugas per pertemuan dan progres penilaian siswa.",
              stats:
                profile.totalClasses > 0
                  ? `${profile.totalClasses} kelas siap dinilai`
                  : "Mulai dari Semua Kelas",
            },
          },
        ],
      },
      {
        name: "Evaluasi",
        tabs: [
          {
            name: "Tryout",
            icon: Trophy,
            href: "/dashboard-guru/tryout",
            enabled: accessControl.tryout,
            content: {
              title: "Program Tryout",
              desc: "Kelola tryout akhir, publish, dan cek hasil siswa dari satu panel.",
              stats: "Fitur aktif",
            },
          },
          {
            name: "Evaluasi",
            icon: Target,
            href: "/dashboard-guru/kelas",
            enabled: accessControl.evaluasi,
            content: {
              title: "Evaluasi Pembelajaran",
              desc: "Buka kelas yang diampu untuk melihat nilai tugas dan tindak lanjut evaluasi pembelajaran.",
              stats:
                profile.totalClasses > 0
                  ? `${profile.totalClasses} kelas siap dievaluasi`
                  : "Mulai dari Semua Kelas",
            },
          },
        ],
      },
    ],
    [profile.todaySchedules, profile.totalClasses],
  );

  const [program, setProgram] = useState<string>(guruConfig[0]?.name ?? "");
  const selectedProgram = useMemo(
    () => guruConfig.find((item) => item.name === program) ?? guruConfig[0],
    [guruConfig, program],
  );
  const tabs = useMemo(() => selectedProgram?.tabs ?? [], [selectedProgram]);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.name ?? "");
  const selectedTab = tabs.find((tab) => tab.name === activeTab) ?? tabs[0];

  const loadAuthProfile = useEffectEvent(async () => {
    try {
      const response = await authService.me();

      if (response.data?.user) {
        persistAuthUser(response.data.user);
        setProfile(buildHeaderProfileFromAuthUser(response.data.user));
      }
    } catch (error) {
      if (error instanceof AuthRequestError && error.status === 401) {
        clearAuthClientState();
        setProfile(fallbackHeaderProfile);
        return;
      }

      console.error("[header-guru-section] load_auth_profile_failed", error);
    }
  });

  const loadTeacherProfile = useEffectEvent(async () => {
    try {
      const response = await fetch("/api/teacher/me/dashboard", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as
        | TeacherDashboardResponse
        | null;

      if (response.ok && payload?.success) {
        const nextProfile = buildHeaderProfileFromTeacherPayload(payload.data);

        if (nextProfile) {
          setProfile(nextProfile);
        } else {
          await loadAuthProfile();
        }

        return;
      }

      if (response.status === 401) {
        clearAuthClientState();
        setProfile(fallbackHeaderProfile);
        return;
      }

      await loadAuthProfile();
    } catch (error) {
      console.error("[header-guru-section] load_teacher_profile_failed", error);
      await loadAuthProfile();
    }
  });

  useEffect(() => {
    queueMicrotask(() => {
      const persistedUser = readPersistedAuthUser();

      if (persistedUser) {
        setProfile(buildHeaderProfileFromAuthUser(persistedUser));
      }

      void loadTeacherProfile();
    });
  }, []);

  useEffect(() => {
    if (!tabs.some((tab) => tab.name === activeTab)) {
      setActiveTab(tabs[0]?.name ?? "");
    }
  }, [activeTab, tabs]);

  return (
    <div className="flex h-full w-full flex-col gap-5 lg:gap-6">
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_18px_36px_-28px_rgba(249,115,22,0.75)]">
        <div className="absolute -right-4 top-0 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-4 px-5 py-4 md:gap-5 md:px-6 md:py-5 lg:px-7">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur md:h-14 md:w-14">
            <Flame className="h-6 w-6 text-white md:h-7 md:w-7" />
          </div>
          <div className="min-w-0 flex-1 overflow-hidden text-white">
            <p className="text-sm font-semibold md:text-base">
              Halo, {profile.nama}
            </p>
            <p className="mt-1 text-xs text-white/90 md:text-sm">
              {profile.subject || profile.branch
                ? `Kelola kelas ${profile.subject || "guru"}${
                    profile.branch ? ` di cabang ${profile.branch}` : ""
                  } dari satu panel kerja yang ringkas.`
                : "Kelola kelas, materi, penilaian, dan evaluasi dari satu panel kerja yang ringkas."}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.5)]">
        <div className="flex items-stretch">
          <div className="flex w-14 items-center justify-center bg-gradient-to-b from-orange-500 to-amber-500 sm:w-16 md:w-20 lg:w-24">
            <BookOpen className="h-6 w-6 text-white md:h-7 md:w-7" />
          </div>

          <div className="flex-1 px-5 py-4 md:px-6 md:py-5 lg:px-7">
            <div className="mb-2.5 flex items-center gap-2.5">
              <Target className="h-4 w-4 text-orange-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Panel Guru
              </p>
            </div>

            <div className="relative mt-3">
              <select
                value={selectedProgram?.name ?? ""}
                onChange={(event) => {
                  setProgram(event.target.value);
                  const nextProgram = guruConfig.find(
                    (item) => item.name === event.target.value,
                  );
                  setActiveTab(nextProgram?.tabs[0]?.name ?? "");
                }}
                className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-11 text-sm font-medium text-slate-700 transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 md:h-12 md:px-5"
              >
                {guruConfig.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>

            {tabs.length > 0 ? (
              <>
                <div className="mt-5 flex flex-wrap gap-2.5 md:gap-3">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;

                    return (
                      <button
                        key={tab.name}
                        type="button"
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-medium transition-all active:scale-95 ${
                          activeTab === tab.name
                            ? "bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.name}
                      </button>
                    );
                  })}
                </div>

                {selectedTab ? (
                  <div className="mt-5 rounded-[24px] border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4 md:items-center">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-slate-800 md:text-base">
                          {selectedTab.content.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 md:text-sm">
                          {selectedTab.content.desc}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-2 text-xs font-bold text-white shadow-sm">
                        {selectedTab.content.stats}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2.5">
                      {selectedTab.enabled ? (
                        <>
                          <button
                            type="button"
                            onClick={() => router.push(selectedTab.href)}
                            className="h-10 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 text-sm font-bold text-white shadow-sm transition-all hover:from-orange-500 hover:to-amber-400 hover:shadow-orange-500/20 active:scale-95 md:h-11 md:px-6"
                          >
                            Buka Sekarang
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(selectedTab.href)}
                            className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-800 active:scale-95 md:h-11 md:px-6"
                          >
                            Lihat Detail
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex h-10 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-5 text-sm font-semibold text-orange-700 md:h-11 md:px-6"
                          disabled
                        >
                          <Lock className="h-4 w-4" />
                          Menunggu Integrasi
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <EmptyProgramState message="Belum ada menu aktif untuk program ini." />
                )}
              </>
            ) : (
              <EmptyProgramState message="Belum ada tab yang tersedia untuk program ini." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
