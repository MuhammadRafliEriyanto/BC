import { type MembershipAccessStatus } from "./subscription";

export type StudentMembershipContentAccess = {
  isMembershipLocked: boolean;
  accessStatus: MembershipAccessStatus;
  message: string | null;
};

export function resolveStudentMembershipContentAccess(
  accessStatus: MembershipAccessStatus,
): StudentMembershipContentAccess {
  if (accessStatus === "active") {
    return {
      isMembershipLocked: false,
      accessStatus,
      message: null,
    };
  }

  if (accessStatus === "pending") {
    return {
      isMembershipLocked: true,
      accessStatus,
      message:
        "Pembayaran membership masih pending. Selesaikan pembayaran untuk membuka akses materi, tugas, jadwal, absensi, nilai, dan tryout.",
    };
  }

  if (accessStatus === "expired") {
    return {
      isMembershipLocked: true,
      accessStatus,
      message:
        "Membership sudah berakhir. Perpanjang membership untuk membuka akses materi, tugas, jadwal, absensi, nilai, dan tryout.",
    };
  }

  return {
    isMembershipLocked: true,
    accessStatus,
    message:
      "Membership belum aktif. Aktifkan membership untuk membuka akses materi, tugas, jadwal, absensi, nilai, dan tryout.",
  };
}
