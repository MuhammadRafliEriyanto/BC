"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X } from "lucide-react";
import { useEffect, useEffectEvent, useState } from "react";

import {
  AuthRequestError,
  authService,
  clearAuthClientState,
  persistAuthUser,
  readPersistedAuthUser,
  type AuthUser,
} from "@/lib/auth";

const menus = [
  { name: "Beranda", path: "/dashboard-guru" },
  { name: "Tryout", path: "/dashboard-guru/tryout" },
];

type GuruTopbarProfile = {
  nama: string;
  role: string;
  initials: string;
};

type TeacherDashboardResponse = {
  success: boolean;
  message: string;
  data?: {
    teacher?: {
      name?: string;
      roleLabel?: string;
      initials?: string;
    };
  };
};

type TeacherDashboardProfile = NonNullable<
  NonNullable<TeacherDashboardResponse["data"]>["teacher"]
>;

const fallbackProfile: GuruTopbarProfile = {
  nama: "Guru",
  role: "Memuat profil...",
  initials: "GU",
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

function buildProfileFromAuthUser(user: AuthUser): GuruTopbarProfile {
  return {
    nama: user.nama,
    role: formatRoleLabel(user.role),
    initials: getInitials(user.nama),
  };
}

function buildProfileFromTeacherResponse(
  teacher?: TeacherDashboardProfile,
) {
  const teacherName = teacher?.name?.trim();

  if (!teacherName) {
    return null;
  }

  const roleLabel = teacher?.roleLabel?.trim() || "Guru";
  const initials = teacher?.initials?.trim() || getInitials(teacherName);

  return {
    nama: teacherName,
    role: roleLabel,
    initials,
  } satisfies GuruTopbarProfile;
}

export default function GuruTopbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profile, setProfile] = useState<GuruTopbarProfile>(fallbackProfile);

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
        return;
      }

      console.error("[guru-topbar] load_auth_profile_failed", error);
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
        const teacherProfile = buildProfileFromTeacherResponse(
          payload.data?.teacher,
        );

        if (teacherProfile) {
          setProfile(teacherProfile);
          return;
        }
      }

      if (response.status === 401) {
        clearAuthClientState();
        setProfile(fallbackProfile);
        return;
      }

      await loadAuthProfile();
    } catch (error) {
      console.error("[guru-topbar] load_teacher_profile_failed", error);
      await loadAuthProfile();
    }
  });

  useEffect(() => {
    queueMicrotask(() => {
      const persistedUser = readPersistedAuthUser();

      if (persistedUser) {
        setProfile(buildProfileFromAuthUser(persistedUser));
      }

      void loadTeacherProfile();
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-red-800/95 via-orange-600/95 to-amber-500/95 shadow-[0_6px_30px_rgba(255,140,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/dashboard-guru" className="group flex items-center gap-3">
            <Image
              src="/logobc.png"
              alt="Logo Bina Cendekia"
              width={40}
              height={40}
              className="transition group-hover:scale-105"
              priority
            />

            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-bold text-yellow-300">Bina</p>
              <p className="-mt-1 text-xs text-yellow-200">Cendekia</p>
            </div>
          </Link>

          <nav className="hidden items-center space-x-3 md:flex">
            {menus.map((menu) => {
              const isActive = pathname === menu.path;

              return (
                <Link
                  key={menu.path}
                  href={menu.path}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all hover:scale-[1.03] hover:bg-white/10 hover:text-yellow-300 ${
                    isActive ? "bg-white/10 text-yellow-300" : "text-white/80"
                  }`}
                >
                  {menu.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <button
            type="button"
            className="relative cursor-default text-white/60"
            aria-label="Notifikasi guru akan diaktifkan pada tahap berikutnya"
            title="Notifikasi guru akan diaktifkan pada tahap berikutnya"
            disabled
          >
            <Bell className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white text-sm font-bold text-orange-700">
              {profile.initials}
            </div>

            <div className="hidden leading-tight md:block">
              <p className="text-sm font-medium text-white">{profile.nama}</p>
              <p className="text-[11px] text-white/70">{profile.role}</p>
            </div>
          </div>

          <button
            type="button"
            className="text-white md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle menu guru"
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="space-y-2 px-6 pb-4 md:hidden">
          {menus.map((menu) => {
            const isActive = pathname === menu.path;

            return (
              <Link
                key={menu.path}
                href={menu.path}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-white/10 text-yellow-300"
                    : "text-white/80 hover:bg-white/10 hover:text-yellow-300"
                }`}
              >
                {menu.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
