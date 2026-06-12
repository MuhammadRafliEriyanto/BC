export type StudentTryoutOption = {
  id: string;
  content: string;
};

export type StudentTryoutQuestion = {
  id: string;
  section: string;
  topic: string;
  prompt: string;
  options: StudentTryoutOption[];
  difficulty: "Mudah" | "Sedang" | "Tinggi";
  clue: string;
  correctOptionId: string;
};

export type StudentTryoutSession = {
  id: string;
  title: string;
  code: string;
  subject: string;
  level: string;
  durationMinutes: number;
  totalQuestions: number;
  targetScore: string;
  schedule: string;
  availability: string;
  mode: string;
  href: string;
  instructions: string[];
  focusAreas: string[];
  pacingNotes: {
    label: string;
    value: string;
  }[];
  questions: StudentTryoutQuestion[];
};

const tryoutQuestions: StudentTryoutQuestion[] = [
  {
    id: "tryout-q1",
    section: "Penalaran Matematika",
    topic: "Persamaan Kuadrat",
    prompt:
      "Jika x^2 - 5x + 6 = 0, jumlah semua akar persamaan tersebut adalah ...",
    options: [
      { id: "a", content: "1" },
      { id: "b", content: "5" },
      { id: "c", content: "6" },
      { id: "d", content: "11" },
      { id: "e", content: "30" },
    ],
    difficulty: "Mudah",
    clue:
      "Gunakan hubungan jumlah akar pada persamaan kuadrat ax^2 + bx + c = 0.",
    correctOptionId: "b",
  },
  {
    id: "tryout-q2",
    section: "Literasi Bahasa",
    topic: "Ide Pokok Teks",
    prompt:
      "Kalimat utama paragraf biasanya digunakan untuk menunjukkan ...",
    options: [
      { id: "a", content: "contoh paling panjang dalam paragraf" },
      { id: "b", content: "ide pokok yang menjadi inti pembahasan" },
      { id: "c", content: "data angka untuk memperkuat opini" },
      { id: "d", content: "kesimpulan penulis pada seluruh bacaan" },
      { id: "e", content: "judul pengganti untuk paragraf berikutnya" },
    ],
    difficulty: "Mudah",
    clue: "Fokus pada fungsi kalimat utama terhadap kalimat penjelas.",
    correctOptionId: "b",
  },
  {
    id: "tryout-q3",
    section: "Penalaran Umum",
    topic: "Silogisme",
    prompt:
      "Semua peserta tryout membawa kartu identitas. Sebagian peserta tryout adalah siswa kelas XII. Kesimpulan yang pasti benar adalah ...",
    options: [
      { id: "a", content: "Semua siswa kelas XII membawa kartu identitas." },
      { id: "b", content: "Sebagian siswa kelas XII tidak membawa identitas." },
      { id: "c", content: "Sebagian siswa kelas XII membawa kartu identitas." },
      { id: "d", content: "Hanya siswa kelas XII yang membawa identitas." },
      { id: "e", content: "Tidak ada peserta selain kelas XII." },
    ],
    difficulty: "Sedang",
    clue:
      "Gunakan irisan himpunan antara peserta tryout dan siswa kelas XII.",
    correctOptionId: "c",
  },
  {
    id: "tryout-q4",
    section: "Penalaran Matematika",
    topic: "Barisan Aritmetika",
    prompt:
      "Suku ke-8 suatu barisan aritmetika adalah 31 dan beda barisan 4. Suku pertama barisan tersebut adalah ...",
    options: [
      { id: "a", content: "1" },
      { id: "b", content: "3" },
      { id: "c", content: "5" },
      { id: "d", content: "7" },
      { id: "e", content: "9" },
    ],
    difficulty: "Sedang",
    clue: "Gunakan rumus Un = a + (n - 1)b.",
    correctOptionId: "b",
  },
  {
    id: "tryout-q5",
    section: "Literasi Bahasa",
    topic: "Makna Kata",
    prompt:
      'Kata "konsisten" paling tepat disepadankan dengan makna ...',
    options: [
      { id: "a", content: "berubah-ubah sesuai kondisi" },
      { id: "b", content: "tetap dan selaras dalam tindakan" },
      { id: "c", content: "sulit dipahami oleh orang lain" },
      { id: "d", content: "terlalu cepat mengambil keputusan" },
      { id: "e", content: "tergantung pada pendapat mayoritas" },
    ],
    difficulty: "Mudah",
    clue: "Cari padanan makna yang menunjukkan ketetapan sikap.",
    correctOptionId: "b",
  },
  {
    id: "tryout-q6",
    section: "Penalaran Umum",
    topic: "Pola Bilangan",
    prompt:
      "Deret 2, 6, 12, 20, 30, ... memiliki suku berikutnya sebesar ...",
    options: [
      { id: "a", content: "36" },
      { id: "b", content: "40" },
      { id: "c", content: "42" },
      { id: "d", content: "44" },
      { id: "e", content: "48" },
    ],
    difficulty: "Sedang",
    clue:
      "Perhatikan selisih antar suku yang membentuk pola bertambah teratur.",
    correctOptionId: "c",
  },
  {
    id: "tryout-q7",
    section: "Penalaran Matematika",
    topic: "Peluang",
    prompt:
      "Sebuah dadu dilempar sekali. Peluang muncul angka prima adalah ...",
    options: [
      { id: "a", content: "1/6" },
      { id: "b", content: "1/3" },
      { id: "c", content: "1/2" },
      { id: "d", content: "2/3" },
      { id: "e", content: "5/6" },
    ],
    difficulty: "Mudah",
    clue: "Bilangan prima pada dadu adalah 2, 3, dan 5.",
    correctOptionId: "c",
  },
  {
    id: "tryout-q8",
    section: "Literasi Bahasa",
    topic: "Simpulan Bacaan",
    prompt:
      "Simpulan yang baik pada sebuah bacaan harus disusun berdasarkan ...",
    options: [
      { id: "a", content: "pendapat pribadi pembaca" },
      { id: "b", content: "contoh yang paling menarik saja" },
      { id: "c", content: "gabungan fakta penting dan ide pokok bacaan" },
      { id: "d", content: "kalimat penutup tanpa melihat isi" },
      { id: "e", content: "kalimat pertama dari paragraf terakhir" },
    ],
    difficulty: "Sedang",
    clue: "Simpulan lahir dari inti isi bacaan, bukan opini baru.",
    correctOptionId: "c",
  },
  {
    id: "tryout-q9",
    section: "Penalaran Umum",
    topic: "Analogi",
    prompt: "Guru : Sekolah = Dokter : ...",
    options: [
      { id: "a", content: "Obat" },
      { id: "b", content: "Rumah Sakit" },
      { id: "c", content: "Pasien" },
      { id: "d", content: "Perawat" },
      { id: "e", content: "Stetoskop" },
    ],
    difficulty: "Mudah",
    clue:
      "Hubungan yang dicari adalah profesi dengan tempat utama bekerja.",
    correctOptionId: "b",
  },
  {
    id: "tryout-q10",
    section: "Penalaran Matematika",
    topic: "Fungsi",
    prompt: "Jika f(x) = 3x - 2, maka nilai f(5) adalah ...",
    options: [
      { id: "a", content: "8" },
      { id: "b", content: "11" },
      { id: "c", content: "13" },
      { id: "d", content: "15" },
      { id: "e", content: "17" },
    ],
    difficulty: "Mudah",
    clue: "Substitusikan x = 5 ke persamaan fungsi.",
    correctOptionId: "c",
  },
  {
    id: "tryout-q11",
    section: "Literasi Bahasa",
    topic: "Kalimat Efektif",
    prompt: "Kalimat yang paling efektif adalah ...",
    options: [
      { id: "a", content: "Para siswa-siswa itu sedang belajar bersama." },
      { id: "b", content: "Agar supaya hasilnya baik, ia belajar rutin." },
      { id: "c", content: "Dia belajar rutin untuk meningkatkan nilainya." },
      { id: "d", content: "Mereka saling tolong-menolong satu sama lain." },
      { id: "e", content: "Naik ke atas untuk mengambil buku itu." },
    ],
    difficulty: "Sedang",
    clue: "Kalimat efektif menghindari pemborosan kata dan pengulangan makna.",
    correctOptionId: "c",
  },
  {
    id: "tryout-q12",
    section: "Penalaran Umum",
    topic: "Interpretasi Data",
    prompt:
      "Jumlah peserta tryout naik dari 120 siswa menjadi 150 siswa. Kenaikan tersebut sebesar ...",
    options: [
      { id: "a", content: "20%" },
      { id: "b", content: "25%" },
      { id: "c", content: "30%" },
      { id: "d", content: "35%" },
      { id: "e", content: "40%" },
    ],
    difficulty: "Sedang",
    clue: "Hitung selisih lalu bandingkan terhadap jumlah awal.",
    correctOptionId: "b",
  },
];

export const studentTryoutSession: StudentTryoutSession = {
  id: "tryout-utbk-2026-01",
  title: "Tryout UTBK Campuran - Paket Fokus 01",
  code: "TO-UTBK-01",
  subject: "Campuran Penalaran dan Literasi",
  level: "SMA Kelas 12",
  durationMinutes: 90,
  totalQuestions: tryoutQuestions.length,
  targetScore: "85+ poin",
  schedule: "25 Mei 2026, 13.30 WIB",
  availability: "Akses dibuka sampai 25 Mei 2026, 18.00 WIB",
  mode: "CBT Mandiri Terjadwal",
  href: "/dashboard-siswa/tryout",
  instructions: [
    "Klik mulai tryout saat kamu benar-benar siap karena timer akan berjalan terus sampai selesai.",
    "Setiap jawaban tersimpan otomatis di tampilan ini, jadi kamu bisa fokus pindah soal tanpa klik simpan.",
    "Gunakan penanda soal di panel kanan untuk melihat mana yang sudah dijawab dan mana yang masih perlu dicek ulang.",
    "Setelah waktu habis, tryout akan dikirim otomatis agar tidak ada jawaban yang hilang.",
  ],
  focusAreas: [
    "Persamaan dan fungsi dasar",
    "Pemahaman ide pokok bacaan",
    "Silogisme dan pola penalaran",
    "Analisis data sederhana",
  ],
  pacingNotes: [
    { label: "Pace ideal", value: "7-8 menit per soal" },
    { label: "Soal mudah", value: "Kerjakan lebih dulu" },
    { label: "Review akhir", value: "Sisakan 10 menit" },
  ],
  questions: tryoutQuestions,
};
