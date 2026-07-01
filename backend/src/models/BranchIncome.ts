import { HydratedDocument, Model, Schema, model, models, type Types } from "mongoose";

export const BRANCH_INCOME_STATUSES = [
  "Menunggu",
  "Diterima",
  "Dibatalkan",
] as const;

export type BranchIncomeStatus = (typeof BRANCH_INCOME_STATUSES)[number];

export interface IBranchIncome {
  incomeId: string;
  title: string;
  branch: string;
  category: string;
  payerOrSource: string;
  amount: number;
  paymentMethod: string;
  status: BranchIncomeStatus;
  receivedAt: Date | null;
  note: string;
  createdBy: Types.ObjectId | null;
  updatedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export type BranchIncomeDocument = HydratedDocument<IBranchIncome>;

const branchIncomeSchema = new Schema<IBranchIncome>(
  {
    incomeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Judul pemasukan wajib diisi."],
      trim: true,
    },
    branch: {
      type: String,
      default: "Pusat",
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Kategori pemasukan wajib diisi."],
      trim: true,
    },
    payerOrSource: {
      type: String,
      required: [true, "Sumber pemasukan wajib diisi."],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Nominal pemasukan wajib diisi."],
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: [true, "Metode pembayaran wajib diisi."],
      trim: true,
    },
    status: {
      type: String,
      enum: BRANCH_INCOME_STATUSES,
      required: [true, "Status pemasukan wajib diisi."],
      default: "Menunggu",
    },
    receivedAt: {
      type: Date,
      default: null,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);


branchIncomeSchema.index({ branch: 1, status: 1, createdAt: -1 });
branchIncomeSchema.index({ category: 1, createdAt: -1 });

export const BranchIncome: Model<IBranchIncome> =
  (models.BranchIncome as Model<IBranchIncome> | undefined) ??
  model<IBranchIncome>("BranchIncome", branchIncomeSchema);
