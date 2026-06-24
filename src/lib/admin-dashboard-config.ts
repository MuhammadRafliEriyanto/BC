import { requestAdminApi } from "@/lib/admin-api";

export type AdminAcademicLevel = "SD" | "SMP" | "SMA";
export type AdminStudentStatus = "Aktif" | "Nonaktif";
export type AdminTeacherAvailability = "Tersedia" | "Padat" | "Cuti";
export type AdminScheduleStatus = "Berjalan" | "Siap" | "Review" | "Bentrok";

export type AdminBillingPackage = {
  packageKey: string;
  packageName: string;
  durationMonth: number;
  amount: number;
};

export type AdminDashboardConfigData = {
  academic: {
    levels: AdminAcademicLevel[];
    gradesByLevel: Record<AdminAcademicLevel, string[]>;
  };
  student: {
    statuses: AdminStudentStatus[];
    classOptions: string[];
    classOptionsByLevel: Record<AdminAcademicLevel, string[]>;
  };
  teacher: {
    statuses: AdminStudentStatus[];
    availabilities: AdminTeacherAvailability[];
  };
  schedule: {
    statuses: AdminScheduleStatus[];
    subjects: string[];
    timeSlots: string[];
    days: string[];
  };
  payment: {
    billingPackages: AdminBillingPackage[];
    batchClassOptionsByLevel: Record<AdminAcademicLevel, string[]>;
  };
};

export const defaultAdminDashboardConfig: AdminDashboardConfigData = {
  academic: {
    levels: ["SD", "SMP", "SMA"],
    gradesByLevel: {
      SD: ["2", "3", "4", "5", "6"],
      SMP: ["7", "8", "9"],
      SMA: ["10", "11", "12"],
    },
  },
  student: {
    statuses: ["Aktif", "Nonaktif"],
    classOptions: [
      "SD 2",
      "SD 3",
      "SD 4",
      "SD 5",
      "SD 6",
      "SMP 7",
      "SMP 8",
      "SMP 9",
      "SMA 10",
      "SMA 11",
      "SMA 12",
    ],
    classOptionsByLevel: {
      SD: ["SD 2", "SD 3", "SD 4", "SD 5", "SD 6"],
      SMP: ["SMP 7", "SMP 8", "SMP 9"],
      SMA: ["SMA 10", "SMA 11", "SMA 12"],
    },
  },
  teacher: {
    statuses: ["Aktif", "Nonaktif"],
    availabilities: ["Tersedia", "Padat", "Cuti"],
  },
  schedule: {
    statuses: ["Berjalan", "Siap", "Review", "Bentrok"],
    subjects: [
      "Matematika",
      "Bahasa Indonesia",
      "Bahasa Inggris",
      "IPA",
      "IPS",
      "Guru Kelas SD",
    ],
    timeSlots: [
      "13:00 - 14:00",
      "14:00 - 15:00",
      "15:00 - 16:00",
      "16:00 - 17:00",
    ],
    days: [
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
      "Minggu",
    ],
  },
  payment: {
    billingPackages: [
      {
        packageKey: "1-semester",
        packageName: "1 Semester",
        durationMonth: 6,
        amount: 1_850_000,
      },
      {
        packageKey: "2-semester",
        packageName: "2 Semester",
        durationMonth: 12,
        amount: 3_700_000,
      },
    ],
    batchClassOptionsByLevel: {
      SD: ["Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"],
      SMP: ["Kelas 7", "Kelas 8", "Kelas 9"],
      SMA: ["Kelas 10", "Kelas 11", "Kelas 12"],
    },
  },
};

export async function fetchAdminDashboardConfig() {
  const response = await requestAdminApi<AdminDashboardConfigData>(
    "/api/admin/dashboard-config",
    {
      method: "GET",
    },
  );

  return response.data as AdminDashboardConfigData;
}
