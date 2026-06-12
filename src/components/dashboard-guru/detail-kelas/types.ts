import type { LucideIcon } from "lucide-react";

import type {
  ClassAttendanceSession,
  ClassDetailData,
  ClassStudent,
} from "@/components/dashboard-guru/data/guruClassData";

export type DetailSection =
  | "peserta"
  | "absensi"
  | "pertemuan"
  | "tugas"
  | "belum-dinilai"
  | "nilai";

export type GradeStatus = "Sangat Baik" | "Baik" | "Perlu Bimbingan";
export type MateriStatus = "Draft" | "Dipublikasikan";
export type TugasStatusPenilaian = "Sudah Dinilai" | "Belum Dinilai";
export type DialogMode = "add" | "edit";

export type LearningAttachmentMeta = {
  attachmentFileName?: string;
  attachmentMimeType?: string;
  attachmentSize?: number;
  attachmentUrl?: string;
};

export type MateriPertemuan = {
  id: string;
  kelasId: string;
  pertemuanKe: number;
  tanggal: string;
  judulMateri: string;
  deskripsi: string;
  linkMateri?: string;
  statusMateri: MateriStatus;
} & LearningAttachmentMeta;

export type TugasPertemuan = {
  id: string;
  kelasId: string;
  pertemuanKe: number;
  judulTugas: string;
  deskripsi: string;
  deadline: string;
  jumlahMengumpulkan: number;
  statusPenilaian: TugasStatusPenilaian;
} & LearningAttachmentMeta;

export type NilaiSiswa = {
  studentId: string;
  tugas: number;
  kuis: number;
  uts: number;
  uas: number;
};

export type NilaiDraft = {
  studentId: string;
  tugas: number;
  kuis: number;
  uts: number;
  uas: number;
  note: string;
};

export type DetailSectionItem = {
  key: DetailSection;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
};

export type DetailKelasSidebarProps = {
  activeSection: DetailSection;
  onSectionChange: (section: DetailSection) => void;
  sectionItems: DetailSectionItem[];
};

export type PesertaKelasTableProps = {
  activeClass: ClassDetailData;
};

export type AbsensiPertemuanTableProps = {
  kelasName: string;
  participants: ClassStudent[];
  sessions: ClassAttendanceSession[];
};

export type DetailPertemuanTableProps = {
  kelasName: string;
  materials: MateriPertemuan[];
  totalMeetings: number;
  onAdd: () => void;
  onEdit: (material: MateriPertemuan) => void;
  onDelete: (materialId: string) => void;
};

export type TugasPertemuanTableProps = {
  kelasName: string;
  tasks: TugasPertemuan[];
  onAdd: () => void;
  onEdit: (task: TugasPertemuan) => void;
  onDelete: (taskId: string) => void;
  onGradeNow: (task: TugasPertemuan) => void;
};

export type BelumDinilaiTableProps = {
  kelasName: string;
  tasks: TugasPertemuan[];
  onGradeNow: (task: TugasPertemuan) => void;
};

export type TabelNilaiTableProps = {
  participants: ClassStudent[];
  nilaiRows: NilaiSiswa[];
  onEditNilai: (studentId: string) => void;
};

export type MateriFormDialogProps = {
  draft: MateriPertemuan | null;
  mode: DialogMode;
  onChange: (field: keyof MateriPertemuan, value: string | number) => void;
  onAttachmentChange: (file: File | null) => void;
  onClearSelectedAttachment: () => void;
  onRemoveExistingAttachment: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
  selectedAttachmentName?: string;
  existingAttachmentName?: string;
  attachmentMarkedForRemoval?: boolean;
};

export type TugasFormDialogProps = {
  draft: TugasPertemuan | null;
  mode: DialogMode;
  onChange: (field: keyof TugasPertemuan, value: string | number) => void;
  onAttachmentChange: (file: File | null) => void;
  onClearSelectedAttachment: () => void;
  onRemoveExistingAttachment: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  open: boolean;
  selectedAttachmentName?: string;
  existingAttachmentName?: string;
  attachmentMarkedForRemoval?: boolean;
};

export type NilaiFormDialogProps = {
  draft: NilaiDraft | null;
  mode: DialogMode;
  onChange: (field: keyof NilaiDraft, value: string | number) => void;
  onOpenChange: (open: boolean) => void;
  onStudentChange: (studentId: string) => void;
  onTaskChange: (taskId: string) => void;
  onSubmit: () => void;
  open: boolean;
  participants: ClassStudent[];
  selectedStudentId: string;
  selectedTask: TugasPertemuan | null;
  tasks: TugasPertemuan[];
};
