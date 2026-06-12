import {
  Activity,
  BookOpenCheck,
  Building2,
  CreditCard,
  GraduationCap,
  LayoutGrid,
  Library,
  LucideIcon,
  ShieldCheck,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";

export type DashboardRole = "owner" | "admin" | "guru" | "siswa";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type DashboardConfig = {
  label: string;
  shortLabel: string;
  description: string;
  searchPlaceholder: string;
  notificationCount: number;
  user: {
    name: string;
    role: string;
    initials: string;
  };
  navItems: DashboardNavItem[];
  insight: {
    title: string;
    description: string;
  };
};

export type StatItem = {
  label: string;
  value: string;
  change: string;
  detail: string;
  tone?: "default" | "success" | "warning" | "info";
  icon: LucideIcon;
};

export type RoleLandingCard = {
  title: string;
  href: string;
  label: string;
  description: string;
  highlights: string[];
  icon: LucideIcon;
};

export const roleLandingCards: RoleLandingCard[] = [
  {
    title: "Owner / Super Admin",
    href: "/dashboard-owner",
    label: "Executive dashboard",
    description: "Pantau performa seluruh cabang, aktivasi siswa, dan ringkasan pemasukan.",
    highlights: ["Global KPI", "Cabang", "Membership"],
    icon: ShieldCheck,
  },
  {
    title: "Admin",
    href: "/dashboard-admin",
    label: "Operational panel",
    description: "Kelola siswa, guru, kelas, verifikasi pembayaran, dan operasional harian.",
    highlights: ["CRUD data", "Jadwal", "Pembayaran"],
    icon: UserCog,
  },
  {
    title: "Guru",
    href: "/dashboard-guru",
    label: "Teaching workflow",
    description: "Atur jadwal mengajar, materi, tugas, penilaian, dan progres siswa.",
    highlights: ["Kelas", "Pembelajaran", "Evaluasi"],
    icon: GraduationCap,
  },
  {
    title: "Siswa",
    href: "/dashboard-siswa",
    label: "Learning hub",
    description: "Lihat jadwal belajar, tugas, nilai, tryout, dan progres pribadi.",
    highlights: ["Materi", "Tugas", "Tryout"],
    icon: BookOpenCheck,
  },
];

export const dashboardConfigs: Record<DashboardRole, DashboardConfig> = {
  owner: {
    label: "Owner / Super Admin",
    shortLabel: "Owner",
    description: "Premium executive dashboard untuk monitoring lintas cabang.",
    searchPlaceholder: "Cari cabang, membership siswa, atau performa KPI...",
    notificationCount: 8,
    user: {
      name: "Nadia Prameswari",
      role: "Super Admin",
      initials: "NP",
    },
    navItems: [
      { label: "Overview", href: "/dashboard-owner", icon: LayoutGrid, badge: "Live" },
      { label: "Cabang", href: "/dashboard-owner/cabang", icon: Building2 },
      { label: "Membership / Aktivasi Siswa", href: "/dashboard-owner/aktivitas", icon: Activity },
    ],
    insight: {
      title: "Health score 92/100",
      description: "Pembayaran tepat waktu naik 8% dan retensi siswa stabil 94%.",
    },
  },
  admin: {
    label: "Admin",
    shortLabel: "Admin",
    description: "Operational admin panel untuk akademik dan operasional harian.",
    searchPlaceholder: "Cari siswa, guru, kelas, atau pembayaran...",
    notificationCount: 12,
    user: {
      name: "Raka Saputra",
      role: "Admin Akademik",
      initials: "RS",
    },
    navItems: [
      { label: "Dashboard", href: "/dashboard-admin", icon: LayoutGrid },
      { label: "Siswa", href: "/dashboard-admin#siswa", icon: Users, badge: "218" },
      { label: "Guru", href: "/dashboard-admin#guru", icon: GraduationCap },
      { label: "Pembayaran", href: "/dashboard-admin#pembayaran", icon: WalletCards, badge: "6" },
    ],
    insight: {
      title: "Operasional hari ini rapi",
      description: "Tidak ada bentrok jadwal kelas dan 6 pembayaran menunggu verifikasi.",
    },
  },
  guru: {
    label: "Guru",
    shortLabel: "Guru",
    description: "",
    searchPlaceholder: "",
    notificationCount: 0,
    user: {
      name: "",
      role: "",
      initials: "",
    },
    navItems: [],
    insight: {
      title: "",
      description: "",
    },
  },
  siswa: {
    label: "Siswa",
    shortLabel: "Siswa",
    description: "",
    searchPlaceholder: "",
    notificationCount: 0,
    user: {
      name: "",
      role: "",
      initials: "",
    },
    navItems: [],
    insight: {
      title: "",
      description: "",
    },
  },
};

export const adminStats: StatItem[] = [
  {
    label: "Siswa aktif",
    value: "872",
    change: "+42",
    detail: "Mayoritas pertumbuhan dari jenjang SMA",
    tone: "info",
    icon: Users,
  },
  {
    label: "Guru aktif",
    value: "64",
    change: "+4",
    detail: "2 guru baru untuk kelas intensif",
    tone: "default",
    icon: GraduationCap,
  },
  {
    label: "Kelas berjalan",
    value: "118",
    change: "+9%",
    detail: "11 kelas tambahan pekan ini",
    tone: "success",
    icon: Library,
  },
  {
    label: "Pembayaran pending",
    value: "6",
    change: "Perlu cek",
    detail: "Semua masuk sebelum pukul 10 pagi",
    tone: "warning",
    icon: CreditCard,
  },
];

export const adminStudents = [
  { name: "Alya Putri", nis: "S-24011", level: "SD 4-6", classGroup: "SD Reguler 5A", branch: "Jakarta Selatan", status: "Aktif", payment: "Lunas", mentor: "Rina Maulida" },
  { name: "Rafi Mahendra", nis: "S-24027", level: "SMP 7-9", classGroup: "SMP Science 8B", branch: "Bandung Timur", status: "Aktif", payment: "Pending", mentor: "Dimas Hendra" },
  { name: "Nabila Zahra", nis: "S-24038", level: "SMA 10-12", classGroup: "SMA UTBK 11A", branch: "Bekasi Barat", status: "Aktif", payment: "Lunas", mentor: "Ayu Kartika" },
  { name: "Gilang Pratama", nis: "S-24045", level: "SMA 10-12", classGroup: "SMA Reguler 12C", branch: "Surabaya Barat", status: "Nonaktif", payment: "Tertunda", mentor: "Mira Wulandari" },
  { name: "Hana Salsabila", nis: "S-24053", level: "SMP 7-9", classGroup: "SMP Focus 9A", branch: "Jakarta Selatan", status: "Aktif", payment: "Lunas", mentor: "Raka Nugraha" },
  { name: "Iqbal Fadhlan", nis: "S-24067", level: "SD 4-6", classGroup: "SD Advance 6B", branch: "Bandung Timur", status: "Aktif", payment: "Verifikasi", mentor: "Nina Astuti" },
];

export const adminTeachers = [
  { name: "Ayu Kartika", subject: "Matematika", classes: 6, status: "Aktif", branch: "Bekasi Barat", availability: "Penuh" },
  { name: "Dimas Hendra", subject: "IPA", classes: 5, status: "Aktif", branch: "Bandung Timur", availability: "Tersedia" },
  { name: "Mira Wulandari", subject: "Bahasa Inggris", classes: 4, status: "Cuti", branch: "Surabaya Barat", availability: "Kembali 28 Mei" },
  { name: "Rina Maulida", subject: "Bahasa Indonesia", classes: 7, status: "Aktif", branch: "Jakarta Selatan", availability: "Penuh" },
];

export const adminClasses = [
  { className: "SMA UTBK 11A", subject: "Matematika", schedule: "Sen, Rab, Jum 16.00", room: "Orion 2", students: 24, status: "Berjalan" },
  { className: "SMP Science 8B", subject: "IPA", schedule: "Sel, Kam 15.30", room: "Aurora 1", students: 18, status: "Berjalan" },
  { className: "SD Advance 6B", subject: "Bahasa Inggris", schedule: "Sen, Rab 14.00", room: "Nova 3", students: 16, status: "Penuh" },
  { className: "SMA Reguler 12C", subject: "Fisika", schedule: "Sab 09.00", room: "Vertex 1", students: 12, status: "Perlu guru pengganti" },
];

export const adminScheduleHighlights = [
  { time: "13.30", className: "SMP Focus 9A", room: "Aurora 3", teacher: "Raka Nugraha" },
  { time: "15.00", className: "SMA UTBK 11A", room: "Orion 2", teacher: "Ayu Kartika" },
  { time: "17.15", className: "SD Reguler 5A", room: "Nova 1", teacher: "Rina Maulida" },
];

export const adminRooms = [
  { room: "Orion 2", capacity: "24/24", nextClass: "SMA UTBK 11A", status: "Penuh" },
  { room: "Aurora 1", capacity: "18/24", nextClass: "SMP Science 8B", status: "Siap" },
  { room: "Nova 3", capacity: "16/18", nextClass: "SD Advance 6B", status: "Hampir penuh" },
  { room: "Vertex 1", capacity: "8/16", nextClass: "Kelas pengganti", status: "Tersedia" },
];

export const adminPaymentVerifications = [
  { student: "Rafi Mahendra", packageName: "SMP Science Plus", amount: "Rp 2.400.000", submittedAt: "20 Mei 2026, 08:12", status: "Perlu verifikasi" },
  { student: "Iqbal Fadhlan", packageName: "SD Advance", amount: "Rp 1.850.000", submittedAt: "20 Mei 2026, 08:47", status: "Menunggu bukti" },
  { student: "Nadia Safitri", packageName: "SMA UTBK Intensif", amount: "Rp 3.950.000", submittedAt: "20 Mei 2026, 09:05", status: "Siap approve" },
];

export const adminJenjangOptions = ["Semua", "SD 4-6", "SMP 7-9", "SMA 10-12"] as const;
export const adminStatusOptions = ["Semua", "Aktif", "Nonaktif"] as const;

export const adminExportActions = [
  "Export data siswa",
  "Export data guru",
  "Unduh jadwal kelas",
  "Download pembayaran",
];
