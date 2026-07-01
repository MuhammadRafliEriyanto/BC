import type { Request, Response } from "express";

import { Branch } from "../models/Branch";
import { User } from "../models/User";
import { buildOwnerActivitiesResponse } from "./paymentController";
import asyncHandler from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";

const SEARCH_RESULT_LIMIT = 5;

type OwnerSearchItem = {
  id: string;
  referenceId: string | null;
  title: string;
  subtitle: string;
  meta: string | null;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toSearchToken(value: unknown) {
  return normalizeText(value).toLocaleLowerCase("id-ID");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function joinSegments(...values: Array<string | null | undefined>) {
  return values
    .map((value) => normalizeText(value))
    .filter(Boolean)
    .join(" • ");
}

function matchesSearch(query: string, values: unknown[]) {
  return values.some((value) => toSearchToken(value).includes(query));
}

export const getOwnerSearchResults = asyncHandler(
  async (
    req: Request<Record<string, string>, Record<string, never>, Record<string, never>, {
      q?: string;
    }>,
    res: Response,
  ) => {
    const query = normalizeText(req.query.q);

    if (query.length < 2) {
      sendSuccess(res, {
        message: "Hasil pencarian owner berhasil diambil.",
        data: {
          query,
          branches: [],
          branchAdmins: [],
          payments: [],
          expenses: [],
          activations: [],
        },
      });
      return;
    }

    const normalizedQuery = toSearchToken(query);
    const searchRegex = new RegExp(escapeRegExp(query), "i");

    const [branches, branchAdmins, activities] = await Promise.all([
      Branch.find({
        $or: [
          { branchId: searchRegex },
          { name: searchRegex },
          { shortAddress: searchRegex },
          { fullAddress: searchRegex },
          { phone: searchRegex },
          { email: searchRegex },
          { adminName: searchRegex },
        ],
      })
        .sort({ createdAt: -1, _id: -1 })
        .limit(SEARCH_RESULT_LIMIT)
        .exec(),
      User.find({
        role: "admin",
        $or: [{ nama: searchRegex }, { email: searchRegex }],
      })
        .select("_id nama email isEmailVerified emailVerifiedAt createdAt updatedAt")
        .sort({ createdAt: -1, _id: -1 })
        .limit(SEARCH_RESULT_LIMIT)
        .exec(),
      buildOwnerActivitiesResponse(),
    ]);

    const branchResults: OwnerSearchItem[] = branches.map((branch) => ({
      id: branch._id.toString(),
      referenceId: branch.branchId,
      title: branch.name,
      subtitle:
        joinSegments(branch.shortAddress, branch.fullAddress, branch.status) ||
        "Data cabang",
      meta: normalizeText(branch.adminName) || "Belum ada admin cabang",
    }));

    const branchAdminResults: OwnerSearchItem[] = branchAdmins.map((admin) => ({
      id: admin._id.toString(),
      referenceId: null,
      title: admin.nama,
      subtitle: admin.email,
      meta: admin.isEmailVerified ? "Terverifikasi" : "Belum terverifikasi",
    }));

    const paymentResults: OwnerSearchItem[] = activities.incomingPayments
      .filter((payment) =>
        matchesSearch(normalizedQuery, [
          payment.paymentId,
          payment.studentName,
          payment.studentEmail,
          payment.packageName,
          payment.method,
          payment.provider,
          payment.branch,
          payment.subscriptionCode,
          payment.status,
        ]),
      )
      .slice(0, SEARCH_RESULT_LIMIT)
      .map((payment) => ({
        id: payment.id,
        referenceId: payment.paymentId ?? payment.subscriptionCode ?? null,
        title: payment.studentName,
        subtitle: joinSegments(payment.packageName, payment.branch) || "Pembayaran siswa",
        meta: joinSegments(formatCurrency(payment.amount), payment.status),
      }));

    const expenseResults: OwnerSearchItem[] = activities.outgoingPayments
      .filter((expense) =>
        matchesSearch(normalizedQuery, [
          expense.referenceId,
          expense.title,
          expense.vendor,
          expense.branch,
          expense.category,
          expense.paymentMethod,
          expense.note,
          expense.status,
        ]),
      )
      .slice(0, SEARCH_RESULT_LIMIT)
      .map((expense) => ({
        id: expense.id,
        referenceId: expense.referenceId,
        title: expense.title,
        subtitle: joinSegments(expense.vendor, expense.category, expense.branch) || "Pengeluaran",
        meta: joinSegments(formatCurrency(expense.amount), expense.status),
      }));

    const activationResults: OwnerSearchItem[] = activities.activationStudents
      .filter((activation) =>
        matchesSearch(normalizedQuery, [
          activation.studentId,
          activation.studentName,
          activation.studentEmail,
          activation.membershipPackage,
          activation.branch,
          activation.subscriptionCode,
          activation.paymentId,
          activation.activationStatus,
          activation.paymentStatus,
        ]),
      )
      .slice(0, SEARCH_RESULT_LIMIT)
      .map((activation) => ({
        id: activation.id,
        referenceId: activation.studentId ?? activation.subscriptionCode,
        title: activation.studentName,
        subtitle:
          joinSegments(activation.membershipPackage, activation.branch) ||
          "Aktivasi siswa",
        meta: joinSegments(activation.activationStatus, activation.paymentStatus),
      }));

    sendSuccess(res, {
      message: "Hasil pencarian owner berhasil diambil.",
      data: {
        query,
        branches: branchResults,
        branchAdmins: branchAdminResults,
        payments: paymentResults,
        expenses: expenseResults,
        activations: activationResults,
      },
    });
  },
);
