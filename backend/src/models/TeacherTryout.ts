import { HydratedDocument, Model, Schema, model, models, type Types } from "mongoose";

export const TEACHER_TRYOUT_JENJANG = ["SD", "SMP", "SMA"] as const;
export const TEACHER_ASSESSMENT_TYPES = [
  "UTS 1",
  "UTS 2",
  "UTS 3",
  "UTS",
  "UAS",
  "Tryout",
] as const;
export const TEACHER_TRYOUT_PUBLISH_STATUSES = [
  "draft",
  "published",
] as const;
export const TEACHER_TRYOUT_QUESTION_SOURCES = [
  "manual",
  "bank",
  "file",
] as const;
export const TEACHER_TRYOUT_REVIEW_STATUSES = [
  "Perlu Review Guru",
  "Disetujui",
  "Revisi",
] as const;

export type TeacherTryoutJenjang =
  (typeof TEACHER_TRYOUT_JENJANG)[number];
export type TeacherAssessmentType = (typeof TEACHER_ASSESSMENT_TYPES)[number];
export type TeacherTryoutPublishStatus =
  (typeof TEACHER_TRYOUT_PUBLISH_STATUSES)[number];
export type TeacherTryoutQuestionSource =
  (typeof TEACHER_TRYOUT_QUESTION_SOURCES)[number];
export type TeacherTryoutReviewStatus =
  (typeof TEACHER_TRYOUT_REVIEW_STATUSES)[number];

export interface ITeacherTryout {
  teacherId: Types.ObjectId;
  tryoutId: string;
  classId: string;
  branch: string;
  canonicalClassName: string;
  assessmentType: TeacherAssessmentType;
  title: string;
  jenjang: TeacherTryoutJenjang;
  kelas: string;
  subject: string;
  stage: number | null;
  durationMinutes: number;
  startAt: Date;
  endAt: Date;
  publishStatus: TeacherTryoutPublishStatus;
  reviewStatus: TeacherTryoutReviewStatus;
  questionSource: TeacherTryoutQuestionSource;
  questionCount: number;
  questionBankId: string | null;
  questionSetId: string | null;
  packageId: string | null;
  fileName: string | null;
  academicYear?: string | null;
  semester?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type TeacherTryoutDocument = HydratedDocument<ITeacherTryout>;

const teacherTryoutSchema = new Schema<ITeacherTryout>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Guru wajib diisi."],
      index: true,
    },
    tryoutId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    classId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    branch: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    canonicalClassName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    assessmentType: {
      type: String,
      enum: TEACHER_ASSESSMENT_TYPES,
      default: "Tryout",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Judul tryout wajib diisi."],
      trim: true,
    },
    jenjang: {
      type: String,
      enum: TEACHER_TRYOUT_JENJANG,
      required: [true, "Jenjang tryout wajib diisi."],
      index: true,
    },
    kelas: {
      type: String,
      required: [true, "Kelas tryout wajib diisi."],
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Mata pelajaran tryout wajib diisi."],
      trim: true,
    },
    stage: {
      type: Number,
      default: null,
      min: 1,
      max: 3,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, "Durasi tryout wajib diisi."],
      min: 15,
    },
    startAt: {
      type: Date,
      required: [true, "Waktu mulai tryout wajib diisi."],
      index: true,
    },
    endAt: {
      type: Date,
      required: [true, "Waktu selesai tryout wajib diisi."],
    },
    publishStatus: {
      type: String,
      enum: TEACHER_TRYOUT_PUBLISH_STATUSES,
      default: "draft",
      index: true,
    },
    reviewStatus: {
      type: String,
      enum: TEACHER_TRYOUT_REVIEW_STATUSES,
      default: "Perlu Review Guru",
      index: true,
    },
    questionSource: {
      type: String,
      enum: TEACHER_TRYOUT_QUESTION_SOURCES,
      default: "manual",
    },
    questionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    questionBankId: {
      type: String,
      default: null,
      trim: true,
    },
    questionSetId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    packageId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    fileName: {
      type: String,
      default: null,
      trim: true,
    },
    academicYear: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    semester: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

teacherTryoutSchema.index({
  teacherId: 1,
  assessmentType: 1,
  jenjang: 1,
  kelas: 1,
  startAt: 1,
});
teacherTryoutSchema.index({
  teacherId: 1,
  classId: 1,
  branch: 1,
  subject: 1,
  stage: 1,
});

export const TeacherTryout: Model<ITeacherTryout> =
  (models.TeacherTryout as Model<ITeacherTryout> | undefined) ??
  model<ITeacherTryout>("TeacherTryout", teacherTryoutSchema);
