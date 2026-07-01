import { HydratedDocument, Model, Schema, model, models, type Types } from "mongoose";

export const TEACHER_TRYOUT_QUESTION_ANSWERS = ["A", "B", "C", "D"] as const;

export type TeacherTryoutQuestionAnswer =
  (typeof TEACHER_TRYOUT_QUESTION_ANSWERS)[number];

export interface ITeacherTryoutQuestion {
  questionId: string;
  teacherId: Types.ObjectId;
  tryoutId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: TeacherTryoutQuestionAnswer;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TeacherTryoutQuestionDocument =
  HydratedDocument<ITeacherTryoutQuestion>;

const teacherTryoutQuestionSchema = new Schema<ITeacherTryoutQuestion>(
  {
    questionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Guru wajib diisi."],
      index: true,
    },
    tryoutId: {
      type: String,
      required: [true, "Tryout ID wajib diisi."],
      trim: true,
      index: true,
    },
    questionText: {
      type: String,
      required: [true, "Pertanyaan tryout wajib diisi."],
      trim: true,
    },
    optionA: {
      type: String,
      required: [true, "Opsi A wajib diisi."],
      trim: true,
    },
    optionB: {
      type: String,
      required: [true, "Opsi B wajib diisi."],
      trim: true,
    },
    optionC: {
      type: String,
      required: [true, "Opsi C wajib diisi."],
      trim: true,
    },
    optionD: {
      type: String,
      required: [true, "Opsi D wajib diisi."],
      trim: true,
    },
    correctAnswer: {
      type: String,
      enum: TEACHER_TRYOUT_QUESTION_ANSWERS,
      required: [true, "Jawaban benar wajib diisi."],
    },
    order: {
      type: Number,
      required: [true, "Urutan soal wajib diisi."],
      min: 1,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

teacherTryoutQuestionSchema.index({
  teacherId: 1,
  tryoutId: 1,
  order: 1,
});

export const TeacherTryoutQuestion: Model<ITeacherTryoutQuestion> =
  (models.TeacherTryoutQuestion as
    | Model<ITeacherTryoutQuestion>
    | undefined) ??
  model<ITeacherTryoutQuestion>(
    "TeacherTryoutQuestion",
    teacherTryoutQuestionSchema,
  );
