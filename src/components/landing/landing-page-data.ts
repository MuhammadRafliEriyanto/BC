import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  BrainCircuit,
  ChartNoAxesColumn,
  CheckCircle2,
  Clock3,
  FileCheck2,
  GraduationCap,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export type LandingNavLink = {
  label: string;
  href: string;
};

export type LandingMetric = {
  label: string;
  value: string;
  detail: string;
};

export type LandingPreviewItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type LandingBenefit = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type LandingStep = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type LandingEventItem = {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const landingNavLinks: LandingNavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Program", href: "#program" },
  { label: "Paket", href: "#paket" },
];

export const landingBenefits: LandingBenefit[] = [
  {
    title: "Nuansa bimbel yang lebih personal",
    description:
      "Copy dan struktur halaman dibuat terasa hangat seperti layanan les, bukan platform belajar yang terlalu generik.",
    icon: MessagesSquare,
  },
  {
    title: "Arah belajar lebih mudah dipahami",
    description:
      "Calon siswa bisa langsung melihat jenjang, paket, dan langkah pendaftaran tanpa harus menebak-nebak alurnya.",
    icon: BrainCircuit,
  },
  {
    title: "Flow membership tetap aman",
    description:
      "Paket, payment, dan status akses siswa tetap memakai logic yang sudah ada sehingga proses aktivasi tetap tertata.",
    icon: ShieldCheck,
  },
  {
    title: "Tampilan lebih tenang dan clean",
    description:
      "Visual dipadatkan ke bagian yang penting saja supaya lebih nyaman dibaca oleh siswa maupun orang tua.",
    icon: ChartNoAxesColumn,
  },
];

export const landingSteps: LandingStep[] = [
  {
    title: "Isi data siswa",
    description:
      "Masukkan nama, email, nomor HP, jenjang, dan kelas melalui halaman daftar online.",
    icon: FileCheck2,
  },
  {
    title: "Pilih program dan paket",
    description:
      "Tentukan membership yang sesuai dengan ritme belajar siswa agar proses mulai terasa lebih jelas sejak awal.",
    icon: GraduationCap,
  },
  {
    title: "Verifikasi lalu aktif",
    description:
      "Setelah email diverifikasi dan payment dikonfirmasi, akses dashboard siswa dibuka mengikuti status membership.",
    icon: CheckCircle2,
  },
];

export const landingPromises = [
  {
    icon: Sparkles,
    label: "Nuansa bimbel yang lebih hangat",
  },
  {
    icon: BookOpenCheck,
    label: "Program sesuai jenjang siswa",
  },
  {
    icon: Clock3,
    label: "Pendaftaran online yang ringkas",
  },
];

export const landingEventItems: LandingEventItem[] = [
  {
    label: "Tryout & evaluasi",
    title: "Ruang untuk sesi latihan yang lebih terarah",
    description:
      "Homepage bisa memperkenalkan ritme tryout, penguatan materi, dan evaluasi yang membantu siswa tetap konsisten.",
    icon: BookOpenCheck,
  },
  {
    label: "Jadwal belajar",
    title: "Informasi program terasa lebih mudah diikuti",
    description:
      "Orang tua dan siswa bisa langsung menangkap bahwa kelas, membership, dan progres belajar disusun lebih tertata.",
    icon: Clock3,
  },
  {
    label: "Aktivasi akses",
    title: "Status membership tidak lagi membingungkan",
    description:
      "Dari daftar online sampai akses dashboard, setiap langkah terasa lebih jelas dan mudah dipahami sejak awal.",
    icon: ShieldCheck,
  },
];
