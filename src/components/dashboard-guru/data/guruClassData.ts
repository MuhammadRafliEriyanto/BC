export type JenjangFilter = "Semua" | "SD" | "SMP" | "SMA";
export type GuruJenjang = Exclude<JenjangFilter, "Semua">;
export type ClassStatus = "Aktif" | "Berjalan" | "Selesai";
export type StudentStatus = "Aktif" | "Perlu Pendampingan" | "Cadangan";
export type PresenceStatus =
  | "Belum Absen"
  | "Hadir"
  | "Sakit"
  | "Izin"
  | "Alpa";
export type AssignmentReviewStatus =
  | "Belum Dinilai"
  | "Sebagian Dinilai"
  | "Selesai";
export type AttendanceSessionStatus = "Berlangsung" | "Ditutup";

export const DEFAULT_SEMESTER_MEETING_TARGET = 24;

export type GuruClassSummary = {
  kelasId: string;
  namaKelas: string;
  guru: string;
  jenjang: GuruJenjang;
  tingkat: string;
  mapel: string;
  program: string;
  jadwal: string;
  ruangan: string;
  totalSiswa: number;
  totalPertemuan: number;
  pertemuanSelesai: number;
  tugasBelumDinilai: number;
  aktifMingguIni: boolean;
  status: ClassStatus;
};

export type StudentMeetingHistory = {
  sessionId: string;
  meetingNumber: number;
  meeting: string;
  date: string;
  material: string;
  attendance: PresenceStatus;
  note: string;
  markedAt?: string | null;
};

export type ClassStudent = {
  id: string;
  name: string;
  classLevel: string;
  branch: string;
  status: StudentStatus;
  history: StudentMeetingHistory[];
  scores: {
    tugas: number;
    uts: number;
    uas: number;
  };
};

export type ClassMeeting = {
  id: string;
  meeting: string;
  date: string;
  material: string;
  focus: string;
  attendanceSummary: string;
  note: string;
};

export type ClassAttendanceSession = {
  sessionId: string;
  meetingNumber: number;
  meeting: string;
  date: string;
  startTime: string;
  subject: string;
  room: string;
  status: AttendanceSessionStatus;
  summary: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    belumAbsen: number;
  };
  attendanceSummary: string;
};

export type ClassAssignment = {
  id: string;
  meeting: string;
  title: string;
  deadline: string;
  submittedCount: number;
  totalStudents: number;
  pendingReviewCount: number;
  reviewStatus: AssignmentReviewStatus;
  teacherNote: string;
};

export type ClassDetailData = GuruClassSummary & {
  participants: ClassStudent[];
  meetings: ClassMeeting[];
  assignments: ClassAssignment[];
  attendanceSessions: ClassAttendanceSession[];
};

export const JENJANG_ITEMS: JenjangFilter[] = ["Semua", "SD", "SMP", "SMA"];

export const CLASS_FILTERS: Record<GuruJenjang, string[]> = {
  SD: ["Kelas 4", "Kelas 5", "Kelas 6"],
  SMP: ["Kelas 7", "Kelas 8", "Kelas 9"],
  SMA: ["Kelas 10", "Kelas 11", "Kelas 12"],
};

export const GURU_CLASS_DATA: GuruClassSummary[] = [
  {
    kelasId: "KLS-001",
    namaKelas: "SMP 8 Matematika A",
    guru: "Bpk. Ahmad Pratama",
    jenjang: "SMP",
    tingkat: "Kelas 8",
    mapel: "Matematika",
    program: "Reguler Pagi",
    jadwal: "Senin, 07.30 - 09.00 WIB",
    ruangan: "Ruang A1",
    totalSiswa: 24,
    totalPertemuan: 16,
    pertemuanSelesai: 4,
    tugasBelumDinilai: 2,
    aktifMingguIni: true,
    status: "Aktif",
  },
  {
    kelasId: "KLS-002",
    namaKelas: "XI IPA 1 Intensif",
    guru: "Ibu Rani Kusuma",
    jenjang: "SMA",
    tingkat: "Kelas 11",
    mapel: "Aljabar Lanjut",
    program: "Kelas Inti",
    jadwal: "Kamis, 10.00 - 11.30 WIB",
    ruangan: "Ruang C2",
    totalSiswa: 19,
    totalPertemuan: 12,
    pertemuanSelesai: 5,
    tugasBelumDinilai: 2,
    aktifMingguIni: true,
    status: "Berjalan",
  },
  {
    kelasId: "KLS-003",
    namaKelas: "XII IPA Tryout",
    guru: "Bpk. Farhan Hidayat",
    jenjang: "SMA",
    tingkat: "Kelas 12",
    mapel: "Pendalaman UTBK",
    program: "Program Intensif",
    jadwal: "Kamis, 13.00 - 14.30 WIB",
    ruangan: "Lab Numerik",
    totalSiswa: 22,
    totalPertemuan: 8,
    pertemuanSelesai: 2,
    tugasBelumDinilai: 1,
    aktifMingguIni: true,
    status: "Aktif",
  },
  {
    kelasId: "KLS-004",
    namaKelas: "SD 5 Literasi Cerdas",
    guru: "Ibu Sinta Maharani",
    jenjang: "SD",
    tingkat: "Kelas 5",
    mapel: "Bahasa Indonesia",
    program: "Fondasi Literasi",
    jadwal: "Selasa, 15.30 - 17.00 WIB",
    ruangan: "Ruang B1",
    totalSiswa: 17,
    totalPertemuan: 14,
    pertemuanSelesai: 9,
    tugasBelumDinilai: 0,
    aktifMingguIni: true,
    status: "Berjalan",
  },
  {
    kelasId: "KLS-005",
    namaKelas: "SMP 7 Sains Reguler",
    guru: "Bpk. Dimas Wibowo",
    jenjang: "SMP",
    tingkat: "Kelas 7",
    mapel: "IPA Terpadu",
    program: "Reguler Sore",
    jadwal: "Rabu, 16.00 - 17.30 WIB",
    ruangan: "Ruang A3",
    totalSiswa: 21,
    totalPertemuan: 14,
    pertemuanSelesai: 7,
    tugasBelumDinilai: 3,
    aktifMingguIni: false,
    status: "Berjalan",
  },
  {
    kelasId: "KLS-006",
    namaKelas: "X SMA Geometri Fokus",
    guru: "Ibu Annisa Putri",
    jenjang: "SMA",
    tingkat: "Kelas 10",
    mapel: "Geometri Dasar",
    program: "Kelas Inti",
    jadwal: "Jumat, 08.30 - 10.00 WIB",
    ruangan: "Ruang C1",
    totalSiswa: 18,
    totalPertemuan: 10,
    pertemuanSelesai: 8,
    tugasBelumDinilai: 0,
    aktifMingguIni: true,
    status: "Aktif",
  },
  {
    kelasId: "KLS-007",
    namaKelas: "SD 6 Numerasi Plus",
    guru: "Bpk. Rizal Aditya",
    jenjang: "SD",
    tingkat: "Kelas 6",
    mapel: "Matematika",
    program: "Persiapan Ujian",
    jadwal: "Sabtu, 09.00 - 10.30 WIB",
    ruangan: "Ruang B2",
    totalSiswa: 16,
    totalPertemuan: 12,
    pertemuanSelesai: 12,
    tugasBelumDinilai: 0,
    aktifMingguIni: false,
    status: "Selesai",
  },
];

const FIRST_NAMES = [
  "Aisyah",
  "Fadhlan",
  "Nabila",
  "Rizky",
  "Dinda",
  "Farrel",
  "Kayla",
  "Rafif",
  "Salsa",
  "Zidan",
  "Nayla",
  "Arkan",
  "Syifa",
  "Bagas",
  "Citra",
  "Raka",
  "Hana",
  "Gibran",
  "Livia",
  "Athar",
  "Aulia",
  "Naufal",
  "Mika",
  "Adel",
  "Keisha",
  "Faiz",
  "Aqila",
  "Nizam",
];

const LAST_NAMES = [
  "Putri",
  "Ramadhan",
  "Shafa",
  "Akbar",
  "Maharani",
  "Saputra",
  "Pratama",
  "Lestari",
  "Pangestu",
  "Nugraha",
  "Khairunnisa",
  "Wijaya",
  "Permata",
  "Adiputra",
  "Kusuma",
  "Hidayat",
];

const MATERIAL_SETS: Record<string, string[]> = {
  Matematika: [
    "Bilangan Bulat",
    "Pecahan Dasar",
    "Perbandingan",
    "Persamaan Linear",
    "Statistika Dasar",
    "Aritmetika Sosial",
  ],
  "Aljabar Lanjut": [
    "Fungsi Kuadrat",
    "Komposisi Fungsi",
    "Barisan dan Deret",
    "Eksponen dan Logaritma",
    "Limit Dasar",
  ],
  "Pendalaman UTBK": [
    "Strategi Soal TPS",
    "Refleksi Tryout",
    "Latihan Penalaran Kuantitatif",
    "Manajemen Waktu UTBK",
  ],
  "Bahasa Indonesia": [
    "Ide Pokok dan Gagasan Utama",
    "Teks Eksplanasi",
    "Menyusun Ringkasan",
    "Analisis Informasi Teks",
    "Literasi Visual",
  ],
  "IPA Terpadu": [
    "Klasifikasi Makhluk Hidup",
    "Campuran dan Perubahan Zat",
    "Sistem Organ",
    "Gaya dan Gerak",
    "Ekosistem",
  ],
  "Geometri Dasar": [
    "Sudut dan Garis",
    "Segitiga dan Kesebangunan",
    "Bangun Datar",
    "Transformasi Geometri",
    "Volume Bangun Ruang",
  ],
};

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const INDONESIAN_MONTHS: Record<string, string> = {
  Januari: "01",
  Februari: "02",
  Maret: "03",
  April: "04",
  Mei: "05",
  Juni: "06",
  Juli: "07",
  Agustus: "08",
  September: "09",
  Oktober: "10",
  November: "11",
  Desember: "12",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getClassSeed(kelasId: string) {
  return Number.parseInt(kelasId.replace(/\D/g, ""), 10) || 1;
}

function getMeetingLabel(index: number) {
  return `Pertemuan ${index + 1}`;
}

function getMeetingDate(seed: number, meetingIndex: number) {
  const date = new Date(Date.UTC(2026, 0, 6 + seed * 2 + meetingIndex * 7));
  return DATE_FORMATTER.format(date);
}

function toIsoDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parts = value.trim().split(" ");

  if (parts.length !== 3) {
    return value;
  }

  const [day, monthLabel, year] = parts;
  const month = INDONESIAN_MONTHS[monthLabel];

  if (!month) {
    return value;
  }

  return `${year}-${month}-${day.padStart(2, "0")}`;
}

function getDeadlineDate(seed: number, meetingIndex: number) {
  const date = new Date(Date.UTC(2026, 0, 8 + seed * 2 + meetingIndex * 7));
  return DATE_FORMATTER.format(date);
}

function getMaterialForMeeting(mapel: string, meetingIndex: number) {
  const materials = MATERIAL_SETS[mapel] ?? MATERIAL_SETS.Matematika;
  return materials[meetingIndex % materials.length];
}

function getFocusText(mapel: string, material: string) {
  if (mapel === "Bahasa Indonesia") {
    return `Pendalaman ${material.toLowerCase()} melalui latihan literasi terarah.`;
  }

  if (mapel === "Pendalaman UTBK") {
    return `Simulasi ${material.toLowerCase()} dengan strategi pengerjaan cepat.`;
  }

  return `Pendalaman ${material.toLowerCase()} dengan latihan bertahap dan diskusi soal.`;
}

function getMeetingNote(mapel: string, material: string, meetingIndex: number) {
  if (mapel === "Pendalaman UTBK") {
    return meetingIndex % 2 === 0
      ? "Sesi fokus pada akurasi dan efisiensi menjawab soal."
      : "Butuh follow up untuk target waktu beberapa siswa.";
  }

  return meetingIndex % 3 === 0
    ? `Kelas berjalan kondusif dan materi ${material.toLowerCase()} terserap baik.`
    : `Perlu penguatan latihan mandiri untuk materi ${material.toLowerCase()}.`;
}

function getAttendanceStatus(
  seed: number,
  studentIndex: number,
  meetingIndex: number,
): PresenceStatus {
  const value = (seed * 7 + studentIndex * 3 + meetingIndex * 5) % 18;

  if (value === 2 && meetingIndex > 0) {
    return "Izin";
  }

  if (value === 7 && meetingIndex > 1) {
    return "Sakit";
  }

  if (value === 11 && meetingIndex > 2 && studentIndex % 5 === 0) {
    return "Alpa";
  }

  return "Hadir";
}

function getAttendanceNote(status: PresenceStatus, material: string) {
  if (status === "Belum Absen") {
    return `Kehadiran untuk materi ${material.toLowerCase()} belum ditandai.`;
  }

  if (status === "Hadir") {
    return `Mengikuti materi ${material.toLowerCase()} dengan baik dan cukup aktif.`;
  }

  if (status === "Izin") {
    return `Izin resmi, perlu susulan ringkasan materi ${material.toLowerCase()}.`;
  }

  if (status === "Sakit") {
    return `Tidak hadir karena sakit, materi ${material.toLowerCase()} perlu dijadwalkan ulang.`;
  }

  return `Belum ada konfirmasi kehadiran pada materi ${material.toLowerCase()}.`;
}

function createStudentScores(seed: number, studentIndex: number) {
  const base = 70 + ((seed * 11 + studentIndex * 5) % 21);
  const adjustment =
    studentIndex % 9 === 0 ? -8 : studentIndex % 7 === 0 ? 6 : 0;

  const tugas = clamp(base + adjustment + 2, 60, 97);
  const uts = clamp(base + adjustment + 3, 60, 98);
  const uas = clamp(base + adjustment + 4, 61, 99);

  return { tugas, uts, uas };
}

function getStudentStatus(
  scores: ClassStudent["scores"],
  studentIndex: number,
): StudentStatus {
  const average = Math.round(
    (scores.tugas + scores.uts + scores.uas) / 3,
  );

  if (average < 75) {
    return "Perlu Pendampingan";
  }

  if (studentIndex % 13 === 12) {
    return "Cadangan";
  }

  return "Aktif";
}

function getStudentName(seed: number, studentIndex: number) {
  const firstName = FIRST_NAMES[(seed + studentIndex) % FIRST_NAMES.length];
  const lastName =
    LAST_NAMES[(seed * 3 + studentIndex * 2) % LAST_NAMES.length];

  return `${firstName} ${lastName}`;
}

function createMeetings(summary: GuruClassSummary) {
  const seed = getClassSeed(summary.kelasId);

  return Array.from({ length: summary.pertemuanSelesai }, (_, meetingIndex) => {
    const material = getMaterialForMeeting(summary.mapel, meetingIndex);
    const meeting = getMeetingLabel(meetingIndex);
    const hadir = Math.max(summary.totalSiswa - ((seed + meetingIndex) % 4), 1);

    return {
      id: `${summary.kelasId}-meeting-${meetingIndex + 1}`,
      meeting,
      date: getMeetingDate(seed, meetingIndex),
      material,
      focus: getFocusText(summary.mapel, material),
      attendanceSummary: `${hadir}/${summary.totalSiswa} hadir`,
      note: getMeetingNote(summary.mapel, material, meetingIndex),
    };
  });
}

function createParticipants(
  summary: GuruClassSummary,
  meetings: ClassMeeting[],
): ClassStudent[] {
  const seed = getClassSeed(summary.kelasId);

  return Array.from({ length: summary.totalSiswa }, (_, studentIndex) => {
    const scores = createStudentScores(seed, studentIndex);
    const history = meetings.map((meeting, meetingIndex) => {
      const attendance = getAttendanceStatus(seed, studentIndex, meetingIndex);

      return {
        sessionId: `${summary.kelasId}-session-${meetingIndex + 1}`,
        meetingNumber: meetingIndex + 1,
        meeting: meeting.meeting,
        date: meeting.date,
        material: meeting.material,
        attendance,
        note: getAttendanceNote(attendance, meeting.material),
        markedAt: `${toIsoDate(meeting.date)}T${String(15 + (meetingIndex % 4)).padStart(2, "0")}:00:00.000Z`,
      };
    });

    return {
      id: `${summary.kelasId}-student-${studentIndex + 1}`,
      name: getStudentName(seed, studentIndex),
      classLevel: `${summary.jenjang} / ${summary.tingkat}`,
      branch: summary.program,
      status: getStudentStatus(scores, studentIndex),
      history,
      scores,
    };
  });
}

function createAttendanceSessions(
  summary: GuruClassSummary,
  meetings: ClassMeeting[],
  participants: ClassStudent[],
): ClassAttendanceSession[] {
  return meetings.map((meeting, meetingIndex) => {
    const histories = participants
      .map((participant) => participant.history[meetingIndex]?.attendance)
      .filter(Boolean) as PresenceStatus[];
    const hadir = histories.filter((status) => status === "Hadir").length;
    const sakit = histories.filter((status) => status === "Sakit").length;
    const izin = histories.filter((status) => status === "Izin").length;
    const alpa = histories.filter((status) => status === "Alpa").length;
    const belumAbsen = histories.filter(
      (status) => status === "Belum Absen",
    ).length;

    return {
      sessionId: `${summary.kelasId}-session-${meetingIndex + 1}`,
      meetingNumber: meetingIndex + 1,
      meeting: meeting.meeting,
      date: meeting.date,
      startTime: "15:30",
      subject: summary.mapel,
      room: summary.ruangan,
      status: "Ditutup",
      summary: {
        hadir,
        sakit,
        izin,
        alpa,
        belumAbsen,
      },
      attendanceSummary: `${hadir}/${summary.totalSiswa} hadir`,
    };
  });
}

function getTeacherNote(
  reviewStatus: AssignmentReviewStatus,
  material: string,
  pendingReviewCount: number,
) {
  if (reviewStatus === "Selesai") {
    return `Seluruh penilaian untuk tugas ${material.toLowerCase()} sudah ditutup.`;
  }

  if (reviewStatus === "Sebagian Dinilai") {
    return `${pendingReviewCount} hasil tugas ${material.toLowerCase()} masih menunggu finalisasi.`;
  }

  return `Review tugas ${material.toLowerCase()} belum dimulai dan perlu prioritas tindak lanjut.`;
}

function createAssignments(
  summary: GuruClassSummary,
  meetings: ClassMeeting[],
): ClassAssignment[] {
  const seed = getClassSeed(summary.kelasId);
  const pendingSlots = Math.min(summary.tugasBelumDinilai, meetings.length);

  return meetings.map((meeting, meetingIndex) => {
    const submittedCount = Math.max(
      summary.totalSiswa - ((seed + meetingIndex) % 4),
      summary.totalSiswa - 4,
    );
    const reviewStatus: AssignmentReviewStatus =
      meetingIndex >= pendingSlots
        ? "Selesai"
        : meetingIndex === 0
          ? "Belum Dinilai"
          : "Sebagian Dinilai";
    const pendingReviewCount =
      reviewStatus === "Selesai"
        ? 0
        : clamp(
            summary.totalSiswa - submittedCount + 2 + ((seed + meetingIndex) % 5),
            1,
            summary.totalSiswa,
          );

    return {
      id: `${summary.kelasId}-assignment-${meetingIndex + 1}`,
      meeting: meeting.meeting,
      title: `Tugas ${meeting.material}`,
      deadline: getDeadlineDate(seed, meetingIndex),
      submittedCount,
      totalStudents: summary.totalSiswa,
      pendingReviewCount,
      reviewStatus,
      teacherNote: getTeacherNote(
        reviewStatus,
        meeting.material,
        pendingReviewCount,
      ),
    };
  });
}

function createClassDetail(summary: GuruClassSummary): ClassDetailData {
  const meetings = createMeetings(summary);
  const participants = createParticipants(summary, meetings);
  const assignments = createAssignments(summary, meetings);
  const attendanceSessions = createAttendanceSessions(
    summary,
    meetings,
    participants,
  );

  return {
    ...summary,
    participants,
    meetings,
    assignments,
    attendanceSessions,
  };
}

export const DETAIL_KELAS_DATA: ClassDetailData[] =
  GURU_CLASS_DATA.map(createClassDetail);

export function resolveGuruClassSummary(kelasId?: string | null) {
  if (!kelasId) {
    return GURU_CLASS_DATA[0];
  }

  return (
    GURU_CLASS_DATA.find((item) => item.kelasId === kelasId) ??
    GURU_CLASS_DATA[0]
  );
}

export function resolveGuruClassDetail(kelasId?: string | null) {
  if (!kelasId) {
    return DETAIL_KELAS_DATA[0];
  }

  return (
    DETAIL_KELAS_DATA.find((item) => item.kelasId === kelasId) ??
    DETAIL_KELAS_DATA[0]
  );
}

export function hasGuruClassDetail(kelasId?: string | null) {
  if (!kelasId) {
    return true;
  }

  return DETAIL_KELAS_DATA.some((item) => item.kelasId === kelasId);
}
