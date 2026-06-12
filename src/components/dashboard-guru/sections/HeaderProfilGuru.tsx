"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import { BookOpen, CalendarDays, MapPin } from "lucide-react";

import {
  AuthRequestError,
  authService,
  clearAuthClientState,
  persistAuthUser,
  readPersistedAuthUser,
  type AuthUser,
} from "@/lib/auth";

const headerBackgrounds = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
];

type HeaderProfilGuruState = {
  nama: string;
  role: string;
  initials: string;
  subject: string;
  branch: string;
  status: string;
  activeClassesLabel: string;
};

type TodayScheduleItem = {
  id: string;
  waktu: string;
  kelas: string;
  mapel: string;
  lokasi: string;
};

type TeacherDashboardClass = {
  id?: string;
  className?: string;
  mapel?: string;
  day?: string;
  time?: string;
  room?: string;
};

type TeacherDashboardResponse = {
  success: boolean;
  message: string;
  data?: {
    teacher?: {
      name?: string;
      roleLabel?: string;
      initials?: string;
      subject?: string;
      branch?: string;
      status?: string;
      activeClasses?: number;
    };
    classes?: TeacherDashboardClass[];
    summary?: {
      totalClasses?: number;
      todaySchedules?: number;
    };
  };
};

const fallbackProfile: HeaderProfilGuruState = {
  nama: "Guru",
  role: "Memuat profil...",
  initials: "GU",
  subject: "-",
  branch: "-",
  status: "-",
  activeClassesLabel: "-",
};

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "GU"
  );
}

function formatRoleLabel(role: AuthUser["role"]) {
  switch (role) {
    case "guru":
      return "Guru";
    case "admin":
      return "Admin";
    case "owner":
      return "Owner";
    case "siswa":
      return "Siswa";
    default:
      return "Guru";
  }
}

function buildProfileFromAuthUser(user: AuthUser): HeaderProfilGuruState {
  return {
    nama: user.nama,
    role: formatRoleLabel(user.role),
    initials: getInitials(user.nama),
    subject: "-",
    branch: "-",
    status: "-",
    activeClassesLabel: "-",
  };
}

function getCurrentIndonesianDay() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

function toMinuteValue(timeRange: string) {
  const [startTime = "00:00"] = timeRange.split("-").map((item) => item.trim());
  const normalized = startTime.replace(".", ":");
  const [hour, minute] = normalized.split(":").map((value) => Number(value));

  return hour * 60 + minute;
}

function buildTodaySchedules(
  classes?: TeacherDashboardClass[],
) {
  if (!classes || !Array.isArray(classes)) {
    return [];
  }

  const todayLabel = getCurrentIndonesianDay().trim().toLowerCase();

  return classes
    .filter((item) => item?.day?.trim().toLowerCase() === todayLabel)
    .sort((left, right) => {
      const leftTime = left?.time ?? "00:00";
      const rightTime = right?.time ?? "00:00";
      return toMinuteValue(leftTime) - toMinuteValue(rightTime);
    })
    .map((item, index) => ({
      id: item?.id?.trim() || `today-schedule-${index}`,
      waktu: item?.time?.trim() ? `${item.time.trim()} WIB` : "Jadwal belum diatur",
      kelas: item?.className?.trim() || "Kelas belum diatur",
      mapel: item?.mapel?.trim() || "Mapel belum diatur",
      lokasi: item?.room?.trim() || "Ruangan belum diatur",
    }));
}

function buildProfileFromTeacherPayload(
  payload: TeacherDashboardResponse["data"],
): HeaderProfilGuruState | null {
  const teacher = payload?.teacher;
  const teacherName = teacher?.name?.trim();

  if (!teacherName) {
    return null;
  }

  const totalClasses =
    payload?.summary?.totalClasses ??
    teacher?.activeClasses ??
    0;

  return {
    nama: teacherName,
    role: teacher?.roleLabel?.trim() || "Guru",
    initials: teacher?.initials?.trim() || getInitials(teacherName),
    subject: teacher?.subject?.trim() || "-",
    branch: teacher?.branch?.trim() || "-",
    status: teacher?.status?.trim() || "-",
    activeClassesLabel:
      totalClasses > 0 ? `${totalClasses} kelas` : "Belum ada kelas",
  };
}

export default function HeaderProfilGuru() {
  const [bgImage, setBgImage] = useState(headerBackgrounds[0]);
  const [profile, setProfile] =
    useState<HeaderProfilGuruState>(fallbackProfile);
  const [todaySchedules, setTodaySchedules] = useState<TodayScheduleItem[]>([]);

  const loadAuthProfile = useEffectEvent(async () => {
    try {
      const response = await authService.me();

      if (response.data?.user) {
        persistAuthUser(response.data.user);
        setProfile(buildProfileFromAuthUser(response.data.user));
      }
    } catch (error) {
      if (error instanceof AuthRequestError && error.status === 401) {
        clearAuthClientState();
        setProfile(fallbackProfile);
        setTodaySchedules([]);
        return;
      }

      console.error("[header-profil-guru] load_auth_profile_failed", error);
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
        const nextProfile = buildProfileFromTeacherPayload(payload.data);

        if (nextProfile) {
          setProfile(nextProfile);
        } else {
          await loadAuthProfile();
        }

        setTodaySchedules(buildTodaySchedules(payload.data?.classes));
        return;
      }

      if (response.status === 401) {
        clearAuthClientState();
        setProfile(fallbackProfile);
        setTodaySchedules([]);
        return;
      }

      await loadAuthProfile();
      setTodaySchedules([]);
    } catch (error) {
      console.error("[header-profil-guru] load_teacher_profile_failed", error);
      await loadAuthProfile();
      setTodaySchedules([]);
    }
  });

  useEffect(() => {
    queueMicrotask(() => {
      setBgImage(
        headerBackgrounds[Math.floor(Math.random() * headerBackgrounds.length)] ??
          headerBackgrounds[0],
      );

      const persistedUser = readPersistedAuthUser();

      if (persistedUser) {
        setProfile(buildProfileFromAuthUser(persistedUser));
      }

      void loadTeacherProfile();
    });
  }, []);

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <div
          className="relative flex items-center gap-4 px-4 py-4 text-white md:px-5"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 via-orange-700/70 to-amber-500/70" />

          <div className="relative flex w-full items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-lg font-bold text-orange-700 shadow">
              {profile.initials}
            </div>

            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold md:text-base">
                {profile.nama}
              </p>
              <p className="mt-1 text-xs opacity-90 md:text-sm">
                {profile.role}
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs md:text-sm">
          {[
            ["Mapel", profile.subject],
            ["Status", profile.status],
            ["Cabang", profile.branch],
            ["Kelas Aktif", profile.activeClassesLabel],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-white/40 px-4 py-3 last:border-none md:px-5"
            >
              <span className="text-gray-500">{label}</span>
              <span
                className={`text-right font-medium ${
                  label === "Status" ? "text-orange-600" : "text-gray-800"
                }`}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="h-1 bg-gradient-to-r from-red-800 via-orange-600 to-amber-500" />

        <div className="flex h-full flex-col p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-gray-700 md:text-sm">
                Jadwal Guru Hari Ini
              </h3>
              <p className="mt-1 text-[11px] text-slate-500">
                {todaySchedules.length > 0
                  ? `${todaySchedules.length} sesi terjadwal untuk hari ini.`
                  : "Belum ada jadwal mengajar untuk hari ini."}
              </p>
            </div>

            <Link
              href="/dashboard-guru/jadwal"
              className="text-[10px] font-medium text-orange-600 transition hover:text-orange-700 md:text-xs"
            >
              Lihat Semua Jadwal
            </Link>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1">
            {todaySchedules.length > 0 ? (
              todaySchedules.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-100 p-3 transition hover:shadow-sm"
                >
                  <p className="text-[11px] font-semibold text-orange-600 md:text-xs">
                    {item.waktu}
                  </p>

                  <h4 className="mt-1 text-sm font-semibold text-gray-800 md:text-base">
                    {item.kelas}
                  </h4>

                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-500 md:text-xs">
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-orange-500" />
                      {item.mapel}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-orange-500" />
                      {item.lokasi}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-5 text-center">
                <CalendarDays className="mx-auto h-5 w-5 text-orange-400" />
                <p className="mt-2 text-xs font-semibold text-orange-600">
                  Belum ada jadwal mengajar untuk hari ini.
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Cek halaman jadwal untuk melihat sesi di hari lain.
                </p>
              </div>
            )}

            <Link
              href="/dashboard-guru/jadwal"
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-orange-200 bg-orange-50/60 px-4 py-3 text-xs font-semibold text-orange-700 transition hover:bg-orange-100/70"
            >
              <CalendarDays className="h-4 w-4" />
              Buka halaman jadwal lengkap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
