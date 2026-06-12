export type SubmissionMode = "file" | "text" | "drive";

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
  | "Sudah Dinilai";

export type StudentTask = {
  id: string;
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
};

export type StudentQuizStatus = "Aktif" | "Akan Datang" | "Selesai";

export type StudentQuiz = {
  id: string;
  mapel: string;
  judul: string;
  jumlahSoal: number;
  durasi: string;
  status: StudentQuizStatus;
  jadwal: string;
  skor?: string;
  deskripsi: string;
  href: string;
  answerModes: SubmissionMode[];
  prompt: string;
  panduanJawaban: string[];
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

export const studentQuizzes: StudentQuiz[] = [
  {
    id: "kuis-bing-reading",
    mapel: "Bahasa Inggris",
    judul: "Reading Comprehension Checkpoint",
    jumlahSoal: 15,
    durasi: "20 Menit",
    status: "Aktif",
    jadwal: "Tersedia sampai 27 Mei 2026",
    deskripsi:
      "Kuis singkat untuk mengukur pemahaman bacaan dan vocabulary inti pekan ini.",
    href: "/dashboard-siswa/kuis",
    answerModes: ["text", "drive", "file"],
    prompt:
      "Jelaskan ide pokok teks bacaan dan tulis dua kosakata baru beserta arti singkatnya.",
    panduanJawaban: [
      "Jawaban singkat bisa ditulis langsung pada kolom teks.",
      "Jika jawaban dikerjakan di dokumen terpisah, kirim link Drive yang dapat diakses.",
      "Jika ada lampiran pendukung, kamu juga bisa unggah file.",
    ],
  },
  {
    id: "kuis-biologi-sel",
    mapel: "Biologi",
    judul: "Struktur Sel dan Fungsinya",
    jumlahSoal: 20,
    durasi: "25 Menit",
    status: "Akan Datang",
    jadwal: "Buka 28 Mei 2026, 08.00 WIB",
    deskripsi:
      "Persiapan evaluasi materi sel dengan fokus organel, fungsi, dan perbedaan sel.",
    href: "/dashboard-siswa/kuis",
    answerModes: ["text", "drive"],
    prompt:
      "Kuis akan berisi soal pilihan ganda dan satu soal uraian singkat tentang fungsi organel sel.",
    panduanJawaban: [
      "Siapkan ringkasan materi dalam bentuk teks atau catatan Drive sebelum kuis dibuka.",
      "Pastikan link Drive bersifat terbuka untuk guru jika diminta mengirim lampiran.",
    ],
  },
  {
    id: "kuis-kimia-stoikiometri",
    mapel: "Kimia",
    judul: "Evaluasi Stoikiometri",
    jumlahSoal: 18,
    durasi: "25 Menit",
    status: "Selesai",
    jadwal: "Selesai 18 Mei 2026",
    skor: "88/100",
    deskripsi:
      "Hasil evaluasi stoikiometri dengan catatan peningkatan pada perhitungan mol.",
    href: "/dashboard-siswa/kuis",
    answerModes: ["text", "file"],
    prompt:
      "Gunakan hasil evaluasi ini untuk merefleksikan langkah hitung yang masih perlu diperbaiki.",
    panduanJawaban: [
      "Review jawaban salah dan tulis ulang langkah hitung yang benar.",
      "Jika perlu, unggah file catatan perbaikan untuk dokumentasi pribadi.",
    ],
  },
];
