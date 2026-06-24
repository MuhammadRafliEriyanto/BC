import type { AcademicGradeScheme, AcademicScores } from "@/lib/academic-grades";

export type SubmissionMode = "file" | "text" | "drive";

export type StudentAcademicSummary = {
  classId: string;
  className: string;
  subject: string;
  scheme: AcademicGradeScheme;
  academicYear: string;
  semester: string;
  taskAverage: number | null;
  gradedTaskCount: number;
  scores: AcademicScores;
  note: string;
  finalAverage: number | null;
  evaluatedAt: string | null;
};

export type StudentMaterial = {
  id: string;
  mapel: string;
  judul: string;
  pertemuan: number;
  durasi: string;
  format: "PDF" | "Video" | "Modul";
  status: "Baru" | "Dipelajari";
  ringkasan: string;
  diperbarui: string;
  href: string;
  downloadName: string;
  downloadUrl: string;
  previewHeading: string;
  previewBody: string;
  previewPoints: string[];
};

export type StudentTaskStatus =
  | "Belum Dikerjakan"
  | "Menunggu Dikirim"
  | "Sudah Dikirim"
  | "Sudah Dinilai";

export type StudentTaskGradeStatus = "Belum Dinilai" | "Sudah Dinilai";

export type StudentTaskSubmissionSummary = {
  submitted: boolean;
  submissionId: string | null;
  submissionMode: SubmissionMode | null;
  submittedAt: string | null;
  hasAttachment: boolean;
  driveUrl: string;
  answerTextPreview: string;
};

export type StudentTaskGradeSummary = {
  graded: boolean;
  gradeId: string | null;
  score: number | null;
  note: string;
  status: StudentTaskGradeStatus;
  gradedAt: string | null;
};

export type StudentTaskSubmissionAttachment = {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
};

export type StudentTaskSubmissionDetail = {
  id: string;
  submissionId: string;
  classId: string;
  taskId: string;
  studentId: string;
  submissionMode: SubmissionMode;
  answerText: string;
  driveUrl: string;
  note: string;
  attachment: StudentTaskSubmissionAttachment | null;
  submittedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type StudentTask = {
  id: string;
  classId: string;
  className: string;
  mapel: string;
  judul: string;
  pertemuan: number;
  deadline: string;
  estimasi: string;
  poin: string;
  status: StudentTaskStatus;
  deskripsi: string;
  detailHref: string;
  submitHref: string;
  attachmentName?: string;
  attachmentUrl?: string;
  submissionModes: SubmissionMode[];
  instruksiPengumpulan: string[];
  mySubmission?: StudentTaskSubmissionSummary;
  myGrade?: StudentTaskGradeSummary;
};

function createTextDownloadUrl(title: string, sections: string[]): string {
  const body = [title, "", ...sections].join("\n");
  return `data:text/plain;charset=utf-8,${encodeURIComponent(body)}`;
}

export const studentMaterials: StudentMaterial[] = [
  {
    id: "materi-ipa-tata-surya",
    mapel: "IPA",
    judul: "Tata Surya",
    pertemuan: 2,
    durasi: "15 Menit Baca",
    format: "Modul",
    status: "Baru",
    ringkasan:
      "Memahami susunan planet, orbit, dan pengaruh gerak benda langit.",
    diperbarui: "Diperbarui hari ini",
    href: "/dashboard-siswa/materi",
    downloadName: "materi-tata-surya.txt",
    downloadUrl: createTextDownloadUrl("Materi Tata Surya", [
      "Ringkasan materi: Memahami susunan planet, orbit, dan pengaruh gerak benda langit.",
      "Poin penting 1: Urutan planet dari Matahari dan karakteristik umumnya.",
      "Poin penting 2: Perbedaan planet dalam dan planet luar.",
      "Poin penting 3: Pengaruh rotasi dan revolusi terhadap fenomena alam.",
      "Latihan mandiri: Buat peta konsep sederhana tentang Tata Surya.",
    ]),
    previewHeading: "Gambaran umum Tata Surya",
    previewBody:
      "Materi ini dirancang untuk membantu kamu memahami struktur dasar Tata Surya sebelum masuk ke latihan soal dan diskusi kelas.",
    previewPoints: [
      "Memahami urutan planet dan ciri utamanya.",
      "Membedakan rotasi, revolusi, dan pengaruhnya.",
      "Menghubungkan gerak benda langit dengan fenomena sehari-hari.",
    ],
  },
  {
    id: "materi-bing-basic-grammar",
    mapel: "Bahasa Inggris",
    judul: "Basic Grammar",
    pertemuan: 4,
    durasi: "20 Menit Baca",
    format: "PDF",
    status: "Dipelajari",
    ringkasan:
      "Review tenses dasar, subject-verb agreement, dan pola kalimat umum.",
    diperbarui: "Diperbarui kemarin",
    href: "/dashboard-siswa/materi",
    downloadName: "basic-grammar-review.txt",
    downloadUrl: createTextDownloadUrl("Basic Grammar Review", [
      "Ringkasan materi: Tenses dasar, subject-verb agreement, dan pola kalimat umum.",
      "Simple present digunakan untuk kebiasaan dan fakta umum.",
      "Simple past digunakan untuk kejadian yang sudah selesai di masa lalu.",
      "Perhatikan kesesuaian subjek dan kata kerja pada setiap kalimat.",
      "Latihan mandiri: Ubah 5 kalimat present ke bentuk past tense.",
    ]),
    previewHeading: "Review grammar inti",
    previewBody:
      "Materi ini cocok untuk penguatan fondasi grammar sebelum latihan reading dan writing yang lebih kompleks.",
    previewPoints: [
      "Mengulas simple present dan simple past.",
      "Mengecek subject-verb agreement pada kalimat aktif.",
      "Melatih penyusunan kalimat sederhana yang rapi.",
    ],
  },
  {
    id: "materi-mtk-limit-fungsi",
    mapel: "Matematika",
    judul: "Limit Fungsi Dasar",
    pertemuan: 6,
    durasi: "12 Menit Video",
    format: "Video",
    status: "Baru",
    ringkasan:
      "Pendahuluan konsep limit fungsi dan strategi menyelesaikan soal cepat.",
    diperbarui: "Diperbarui 2 hari lalu",
    href: "/dashboard-siswa/materi",
    downloadName: "limit-fungsi-dasar.txt",
    downloadUrl: createTextDownloadUrl("Limit Fungsi Dasar", [
      "Ringkasan materi: Pendahuluan konsep limit fungsi dan strategi menyelesaikan soal cepat.",
      "Pahami makna limit saat x mendekati nilai tertentu.",
      "Kenali bentuk substitusi langsung dan bentuk tak tentu.",
      "Gunakan faktorisasi atau penyederhanaan untuk limit dasar.",
      "Latihan mandiri: Kerjakan 5 soal limit fungsi tingkat dasar.",
    ]),
    previewHeading: "Pengantar limit fungsi",
    previewBody:
      "Materi ini membantu kamu menangkap ide dasar limit secara intuitif sebelum masuk ke bentuk soal yang lebih formal.",
    previewPoints: [
      "Memahami konsep nilai pendekatan pada fungsi.",
      "Mengidentifikasi bentuk limit yang bisa disubstitusi langsung.",
      "Menyusun langkah penyelesaian singkat untuk latihan dasar.",
    ],
  },
];

export const studentTasks: StudentTask[] = [
  {
    id: "tugas-bindo-esai",
    classId: "class-demo-bahasa-indonesia",
    className: "SMA 10",
    mapel: "Bahasa Indonesia",
    judul: "Menulis Esai",
    pertemuan: 3,
    deadline: "24 Mei 2026, 20.00 WIB",
    estimasi: "30 Menit",
    poin: "100 Poin",
    status: "Menunggu Dikirim",
    deskripsi:
      "Tulis esai singkat bertema literasi digital dengan struktur pembuka, isi, dan penutup.",
    detailHref: "/dashboard-siswa/tugas",
    submitHref: "/dashboard-siswa/kirim-tugas",
    submissionModes: ["text", "drive", "file"],
    instruksiPengumpulan: [
      "Jawaban boleh ditulis langsung pada kolom teks jika singkat.",
      "Jika dikerjakan di Google Docs, kirim link Drive yang bisa diakses guru.",
      "Jika ada lampiran tambahan, unggah file pendukung dalam format PDF atau DOCX.",
    ],
  },
  {
    id: "tugas-mtk-aljabar",
    classId: "class-demo-matematika",
    className: "SMA 10",
    mapel: "Matematika",
    judul: "Aljabar Dasar",
    pertemuan: 5,
    deadline: "26 Mei 2026, 19.00 WIB",
    estimasi: "45 Menit",
    poin: "100 Poin",
    status: "Belum Dikerjakan",
    deskripsi:
      "Kerjakan 10 soal aljabar dasar dan unggah lembar jawaban atau kirim tautan kerja dari Drive.",
    detailHref: "/dashboard-siswa/tugas",
    submitHref: "/dashboard-siswa/kirim-tugas",
    submissionModes: ["file", "drive", "text"],
    instruksiPengumpulan: [
      "Boleh unggah file jawaban hasil scan atau ketikan.",
      "Boleh tempel langkah penyelesaian singkat dalam bentuk teks.",
      "Jika mengerjakan di spreadsheet atau dokumen online, kirim link Drive.",
    ],
  },
  {
    id: "tugas-fisika-gerak",
    classId: "class-demo-fisika",
    className: "SMA 10",
    mapel: "Fisika",
    judul: "Analisis Gerak Lurus",
    pertemuan: 2,
    deadline: "20 Mei 2026, 18.00 WIB",
    estimasi: "25 Menit",
    poin: "95 Poin",
    status: "Sudah Dinilai",
    deskripsi:
      "Review hasil latihan gerak lurus dan cek catatan perbaikan dari guru.",
    detailHref: "/dashboard-siswa/tugas",
    submitHref: "/dashboard-siswa/kirim-tugas",
    submissionModes: ["text", "drive", "file"],
    instruksiPengumpulan: [
      "Tugas ini sudah dinilai, gunakan catatan guru untuk revisi mandiri.",
      "Jika diminta revisi, kamu bisa kirim ulang via teks, file, atau link Drive.",
    ],
  },
];
