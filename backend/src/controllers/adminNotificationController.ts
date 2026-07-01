import type { Request, Response } from "express";

import { Payment } from "../models/Payment";
import { Room } from "../models/Room";
import { Schedule } from "../models/Schedule";
import { Subscription } from "../models/Subscription";
import { User } from "../models/User";
import asyncHandler from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import {
  buildSchedulePresentation,
  type ScheduleWithTeacher,
} from "../utils/scheduleConflicts";

type AdminNotificationSeverity = "info" | "warning" | "danger";
type AdminNotificationKey =
  | "subscriptions_pending"
  | "payments"
  | "schedule_conflicts"
  | "rooms_empty";

type AdminNotificationSummaryItem = {
  key: AdminNotificationKey;
  title: string;
  message: string;
  count: number;
  severity: AdminNotificationSeverity;
};

function formatItemCount(count: number, singularLabel: string, pluralLabel: string) {
  return `${count} ${count === 1 ? singularLabel : pluralLabel}`;
}

function buildPaymentMessage(counts: {
  pending: number;
  paid: number;
  failed: number;
  expired: number;
}) {
  const segments: string[] = [];

  if (counts.pending > 0) {
    segments.push(
      `${formatItemCount(
        counts.pending,
        "pembayaran menunggu penyelesaian",
        "pembayaran menunggu penyelesaian",
      )}`,
    );
  }

  if (counts.paid > 0) {
    segments.push(
      `${formatItemCount(
        counts.paid,
        "pembayaran berhasil diterima",
        "pembayaran berhasil diterima",
      )}`,
    );
  }

  const failedOrExpiredCount = counts.failed + counts.expired;

  if (failedOrExpiredCount > 0) {
    segments.push(
      `${formatItemCount(
        failedOrExpiredCount,
        "pembayaran gagal atau kedaluwarsa",
        "pembayaran gagal atau kedaluwarsa",
      )}`,
    );
  }

  return segments.join(", ");
}

function getPaymentSeverity(counts: {
  pending: number;
  failed: number;
  expired: number;
}): AdminNotificationSeverity {
  if (counts.failed + counts.expired > 0) {
    return "danger";
  }

  if (counts.pending > 0) {
    return "warning";
  }

  return "info";
}

function getNotificationContribution(item: AdminNotificationSummaryItem) {
  if (item.count > 0) {
    return item.count;
  }

  if (item.key === "rooms_empty") {
    return 1;
  }

  return 0;
}

async function getScheduleDocuments() {
  return (await Schedule.find()
    .populate<{
      teacherId: {
        teacherId: string;
        userId: {
          nama: string;
        };
      };
    }>({
      path: "teacherId",
      populate: {
        path: "userId",
        model: User,
      },
    })
    .sort({ createdAt: -1 })
    .lean()
    .exec()) as unknown as ScheduleWithTeacher[];
}

export const getAdminNotificationSummary = asyncHandler(
  async (_req: Request, res: Response) => {
    const [
      pendingSubscriptionsCount,
      pendingPaymentsCount,
      paidPaymentsCount,
      failedPaymentsCount,
      expiredPaymentsCount,
      totalRoomsCount,
      emptyRoomsCount,
      scheduleDocuments,
    ] = await Promise.all([
      Subscription.countDocuments({
        status: "pending",
        paymentStatus: "pending",
      }).exec(),
      Payment.countDocuments({ status: "pending" }).exec(),
      Payment.countDocuments({ status: "paid" }).exec(),
      Payment.countDocuments({ status: "failed" }).exec(),
      Payment.countDocuments({ status: "expired" }).exec(),
      Room.countDocuments().exec(),
      Room.countDocuments({ status: "Kosong" }).exec(),
      getScheduleDocuments(),
    ]);

    const schedules = buildSchedulePresentation(scheduleDocuments);
    const conflictedSchedulesCount = schedules.filter(
      (schedule) =>
        schedule.status === "Bentrok" || schedule.conflicts.length > 0,
    ).length;

    const items: AdminNotificationSummaryItem[] = [];

    if (pendingSubscriptionsCount > 0) {
      items.push({
        key: "subscriptions_pending",
        title: "Pendaftaran membership",
        message: `${formatItemCount(
          pendingSubscriptionsCount,
          "pendaftaran membership menunggu pembayaran",
          "pendaftaran membership menunggu pembayaran",
        )}`,
        count: pendingSubscriptionsCount,
        severity: "warning",
      });
    }

    const totalPaymentNotifications =
      pendingPaymentsCount +
      paidPaymentsCount +
      failedPaymentsCount +
      expiredPaymentsCount;

    if (totalPaymentNotifications > 0) {
      items.push({
        key: "payments",
        title: "Pembayaran",
        message: buildPaymentMessage({
          pending: pendingPaymentsCount,
          paid: paidPaymentsCount,
          failed: failedPaymentsCount,
          expired: expiredPaymentsCount,
        }),
        count: totalPaymentNotifications,
        severity: getPaymentSeverity({
          pending: pendingPaymentsCount,
          failed: failedPaymentsCount,
          expired: expiredPaymentsCount,
        }),
      });
    }

    if (conflictedSchedulesCount > 0) {
      items.push({
        key: "schedule_conflicts",
        title: "Jadwal",
        message: `${formatItemCount(
          conflictedSchedulesCount,
          "jadwal terdeteksi bentrok",
          "jadwal terdeteksi bentrok",
        )}`,
        count: conflictedSchedulesCount,
        severity: "danger",
      });
    }

    if (totalRoomsCount === 0) {
      items.push({
        key: "rooms_empty",
        title: "Ruangan",
        message: "Belum ada ruangan yang terdaftar",
        count: 0,
        severity: "warning",
      });
    } else if (emptyRoomsCount > 0) {
      items.push({
        key: "rooms_empty",
        title: "Ruangan",
        message: `${formatItemCount(
          emptyRoomsCount,
          "ruangan sedang kosong",
          "ruangan sedang kosong",
        )}`,
        count: emptyRoomsCount,
        severity: "warning",
      });
    }

    const total = items.reduce(
      (currentTotal, item) => currentTotal + getNotificationContribution(item),
      0,
    );

    sendSuccess(res, {
      message: "Ringkasan notifikasi admin berhasil diambil.",
      data: {
        summary: {
          total,
          hasUnreadLikeItems: items.length > 0,
        },
        items,
        generatedAt: new Date().toISOString(),
      },
    });
  },
);
