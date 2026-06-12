/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpenText,
  CalendarClock,
  CreditCard,
  GraduationCap,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  AuthRequestError,
  authService,
  clearAuthClientState,
  persistAuthUser,
  readPersistedAuthUser,
  type AuthUser,
} from "@/lib/auth";
import {
  MembershipRequestError,
  membershipService,
  type MembershipStatusData,
} from "@/lib/subscription";
import { cn } from "@/lib/utils";

type StudentProfile = {
  name: string;
  initials: string;
  greeting: string;
  className: string;
  status: string;
  statusNote: string;
  program: string;
  programNote: string;
  classNote: string;
  paymentValue: string;
  paymentNote: string;
};

type ProfileStat = {
  label: string;
  value: string;
  note: string;
  icon: LucideIcon;
  tone: "default" | "highlight";
};

type SubjectSchedule = {
  time: string;
  subject: string;
  teacher: string;
  room: string;
  badge: string;
};

type MembershipPaymentProfile = NonNullable<MembershipStatusData["payment"]>;

const profileBackgrounds = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
];

const fallbackStudentProfile: StudentProfile = {
  name: "Siswa",
  initials: "SI",
  greeting: "Selamat datang kembali di dashboard belajar kamu.",
  className: "Kelas belum tersedia",
  status: "Memuat",
  statusNote: "Profil siswa sedang disinkronkan",
  program: "Program belum tersedia",
  programNote: "Data program belajar sedang dimuat",
  classNote: "Kelas aktif akan muncul setelah data siswa tersedia",
  paymentValue: "Menunggu data",
  paymentNote: "Status pembayaran sedang disinkronkan",
};

const subjectSchedules: SubjectSchedule[] = [
  {
    time: "07:00 - 08:30",
    subject: "Matematika",
    teacher: "Bu Sinta",
    room: "Ruang A1",
    badge: "Hari Ini",
  },
  {
    time: "08:45 - 10:15",
    subject: "Bahasa Inggris",
    teacher: "Pak Andi",
    room: "Ruang B2",
    badge: "Hari Ini",
  },
  {
    time: "10:30 - 12:00",
    subject: "Fisika",
    teacher: "Bu Rina",
    room: "Ruang Lab",
    badge: "Hari Ini",
  },
];

const allScheduleHref = "/dashboardsiswa/jadwal";
const attendanceHref = "/dashboardsiswa/presensi";

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "SI"
  );
}

function pickRandomBackground() {
  return profileBackgrounds[Math.floor(Math.random() * profileBackgrounds.length)];
}

function formatRoleLabel(role: AuthUser["role"]) {
  switch (role) {
    case "siswa":
      return "Siswa";
    case "guru":
      return "Guru";
    case "admin":
      return "Admin";
    case "owner":
      return "Owner";
    default:
      return "Siswa";
  }
}

function formatAccessStatusLabel(
  accessStatus: MembershipStatusData["accessStatus"] | undefined,
) {
  switch (accessStatus) {
    case "active":
      return "Aktif";
    case "pending":
      return "Pending";
    case "expired":
      return "Berakhir";
    case "not_registered":
      return "Belum Terdaftar";
    default:
      return "Siswa";
  }
}

function buildGreeting(accessStatus: MembershipStatusData["accessStatus"] | undefined) {
  switch (accessStatus) {
    case "active":
      return "Selamat datang kembali di dashboard belajar kamu.";
    case "pending":
      return "Akun siswa kamu sudah aktif, tinggal menunggu aktivasi membership belajar.";
    case "expired":
      return "Masa aktif belajar kamu perlu diperbarui agar akses tetap berjalan lancar.";
    case "not_registered":
      return "Lengkapi data membership untuk membuka layanan belajar penuh.";
    default:
      return "Selamat datang kembali di dashboard belajar kamu.";
  }
}

function buildStatusNote(accessStatus: MembershipStatusData["accessStatus"] | undefined) {
  switch (accessStatus) {
    case "active":
      return "Akses belajar berjalan normal";
    case "pending":
      return "Menunggu aktivasi atau verifikasi pembayaran";
    case "expired":
      return "Masa belajar perlu diperpanjang";
    case "not_registered":
      return "Data membership belum ditemukan";
    default:
      return "Status akun siswa berhasil dibaca";
  }
}

function buildPaymentSummary(
  payment: MembershipPaymentProfile | null | undefined,
  accessStatus: MembershipStatusData["accessStatus"] | undefined,
) {
  if (payment?.status === "paid") {
    return {
      value: "Lunas",
      note: "Pembayaran terakhir sudah terverifikasi",
    };
  }

  if (payment?.status === "pending") {
    return {
      value: "Pending",
      note: "Pembayaran sedang menunggu konfirmasi",
    };
  }

  if (payment?.status === "failed") {
    return {
      value: "Gagal",
      note: "Perlu cek ulang proses pembayaran",
    };
  }

  if (accessStatus === "active") {
    return {
      value: "Aman",
      note: "Akses belajar aktif tanpa tagihan tertunda",
    };
  }

  return {
    value: "Tidak Ada",
    note: "Belum ada data tagihan yang tercatat",
  };
}

function buildProfileFromAuthUser(user: AuthUser): StudentProfile {
  return {
    name: user.nama,
    initials: getInitials(user.nama),
    greeting: "Selamat datang kembali di dashboard belajar kamu.",
    className: "Kelas belum tersedia",
    status: formatRoleLabel(user.role),
    statusNote: "Sesi login siswa sudah aktif",
    program: "Program belum tersedia",
    programNote: "Data program belajar sedang dimuat",
    classNote: "Kelas aktif akan muncul setelah data siswa tersedia",
    paymentValue: "Menunggu data",
    paymentNote: "Status pembayaran sedang disinkronkan",
  };
}

function buildProfileFromMembershipData(data?: MembershipStatusData | null) {
  const student = data?.student;
  const user = data?.user;
  const resolvedName = student?.name?.trim() || user?.nama?.trim();

  if (!resolvedName) {
    return null;
  }

  const resolvedStatus =
    student?.status?.trim() || formatAccessStatusLabel(data?.accessStatus);
  const paymentSummary = buildPaymentSummary(data?.payment, data?.accessStatus);

  return {
    name: resolvedName,
    initials: getInitials(resolvedName),
    greeting: buildGreeting(data?.accessStatus),
    className: student?.className?.trim() || "Kelas belum tersedia",
    status: resolvedStatus,
    statusNote: buildStatusNote(data?.accessStatus),
    program: student?.program?.trim() || "Program belum tersedia",
    programNote: student?.program?.trim()
      ? "Program belajar aktif sesuai data siswa"
      : "Program belajar belum tercatat",
    classNote: student?.className?.trim()
      ? "Kelas aktif sinkron dengan akun siswa login"
      : "Kelas aktif belum tersedia di backend",
    paymentValue: paymentSummary.value,
    paymentNote: paymentSummary.note,
  } satisfies StudentProfile;
}

function ProfileStatCard({ icon: Icon, label, value, note, tone }: ProfileStat) {
  return (
    <article
      className={cn(
        "group rounded-[20px] border px-3.5 py-3 transition-all duration-300 hover:-translate-y-0.5",
        tone === "highlight"
          ? "border-orange-100 bg-[linear-gradient(135deg,rgba(255,247,237,0.98),rgba(255,255,255,0.98))] hover:border-orange-200 hover:shadow-[0_18px_28px_-24px_rgba(249,115,22,0.28)]"
          : "border-slate-100 bg-white hover:border-orange-100 hover:shadow-[0_18px_28px_-24px_rgba(15,23,42,0.16)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>
          <p className="mt-1.5 truncate text-sm font-semibold text-slate-800">
            {value}
          </p>
        </div>

        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px] border transition-colors duration-300",
            tone === "highlight"
              ? "border-orange-200 bg-orange-100 text-orange-700 group-hover:bg-white"
              : "border-slate-200 bg-slate-50 text-slate-500 group-hover:border-orange-100 group-hover:bg-orange-50 group-hover:text-orange-600",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>

      <p className="mt-1.5 text-[11px] leading-4 text-slate-500">{note}</p>
    </article>
  );
}

function SubjectScheduleCard({
  time,
  subject,
  teacher,
  room,
  badge,
}: SubjectSchedule) {
  return (
    <article className="group rounded-[20px] border border-orange-100/90 bg-white px-3.5 py-3.5 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_22px_34px_-24px_rgba(249,115,22,0.26)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="w-14 shrink-0 rounded-[18px] border border-orange-100 bg-[linear-gradient(180deg,rgba(255,247,237,0.95),rgba(255,255,255,1))] px-2 py-2 text-center transition-colors duration-300 group-hover:border-orange-200 group-hover:bg-orange-50">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-600">
              Jam
            </p>
            <p className="mt-1 text-[10px] font-bold leading-4 text-slate-700">
              {time}
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-800">
                {subject}
              </h4>
              <Badge
                variant="warning"
                className="border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700"
              >
                {badge}
              </Badge>
            </div>

            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1.5 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-3.5 w-3.5 text-orange-500" />
                {teacher}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-orange-500" />
                {room}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={attendanceHref}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-orange-200 bg-white px-3.5 text-[11px] font-semibold text-orange-700 shadow-sm shadow-orange-100/60 transition-all duration-300 hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 hover:shadow-md hover:shadow-orange-200/50"
        >
          Lihat Absen
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

export default function HeaderProfilSiswa() {
  const [bgImage, setBgImage] = useState(profileBackgrounds[0]);
  const [profile, setProfile] = useState<StudentProfile>(fallbackStudentProfile);

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
        setProfile(fallbackStudentProfile);
        return;
      }

      console.error("[header-profil-siswa] load_auth_profile_failed", error);
    }
  });

  const loadStudentProfile = useEffectEvent(async () => {
    try {
      const response = await membershipService.getMySubscription();
      const membershipProfile = buildProfileFromMembershipData(response.data);

      if (membershipProfile) {
        setProfile(membershipProfile);
        return;
      }

      await loadAuthProfile();
    } catch (error) {
      if (
        error instanceof MembershipRequestError &&
        (error.status === 401 || error.status === 403)
      ) {
        clearAuthClientState();
        setProfile(fallbackStudentProfile);
        return;
      }

      console.error("[header-profil-siswa] load_membership_profile_failed", error);
      await loadAuthProfile();
    }
  });

  useEffect(() => {
    setBgImage(pickRandomBackground());

    queueMicrotask(() => {
      const persistedUser = readPersistedAuthUser();

      if (persistedUser) {
        setProfile(buildProfileFromAuthUser(persistedUser));
      }

      void loadStudentProfile();
    });
  }, []);

  const overviewBadges = [
    profile.className,
    `Status ${profile.status}`,
    profile.program,
  ];

  const profileStats: ProfileStat[] = [
    {
      label: "Program",
      value: profile.program,
      note: profile.programNote,
      icon: BookOpenText,
      tone: "highlight",
    },
    {
      label: "Status",
      value: profile.status,
      note: profile.statusNote,
      icon: Sparkles,
      tone: "highlight",
    },
    {
      label: "Kelas",
      value: profile.className,
      note: profile.classNote,
      icon: GraduationCap,
      tone: "default",
    },
    {
      label: "Tagihan",
      value: profile.paymentValue,
      note: profile.paymentNote,
      icon: CreditCard,
      tone: "default",
    },
  ];

  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      <section className="overflow-hidden rounded-[24px] border border-orange-100/90 bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.22),0_12px_24px_-22px_rgba(249,115,22,0.14)]">
        <div
          className="relative overflow-hidden px-4 py-4 text-white md:px-5 md:py-5"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/92 via-orange-700/82 to-amber-500/82" />
          <div className="absolute -right-8 top-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-8 h-24 w-24 rounded-full bg-amber-200/10 blur-3xl" />

          <div className="relative flex items-start gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border border-white/25 bg-white/15 text-sm font-bold backdrop-blur md:h-[3.5rem] md:w-[3.5rem] md:text-base">
              {profile.initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-bold md:text-base">
                  {profile.name}
                </p>
                <Badge className="border-white/15 bg-white/15 px-2 py-0.5 text-[10px] text-white backdrop-blur">
                  {profile.status}
                </Badge>
              </div>

              <p className="mt-1.5 max-w-sm text-xs leading-5 text-white/90 md:text-sm">
                {profile.greeting}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {overviewBadges.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/12 px-2.5 py-1 text-[10px] font-medium text-white/95 backdrop-blur"
                  >
                    <Sparkles className="h-3 w-3" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2">
          {profileStats.map((item) => (
            <ProfileStatCard key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-orange-100/90 bg-white shadow-[0_18px_40px_-34px_rgba(15,23,42,0.18),0_12px_24px_-22px_rgba(249,115,22,0.12)]">
        <div className="h-1 bg-gradient-to-r from-red-800 via-orange-600 to-amber-500" />

        <div className="p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 text-orange-600">
                <CalendarClock className="h-4 w-4" />
                <p className="text-sm font-semibold">Jadwal Mata Pelajaran</p>
              </div>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Jadwal kelas dan pelajaran aktif untuk sesi belajar hari ini.
              </p>
            </div>

            <Link
              href={allScheduleHref}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 transition-colors duration-300 hover:text-orange-700"
            >
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {subjectSchedules.map((item) => (
              <SubjectScheduleCard key={`${item.subject}-${item.time}`} {...item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
