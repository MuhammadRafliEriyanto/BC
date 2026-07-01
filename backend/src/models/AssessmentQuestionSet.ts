import { HydratedDocument, Model, Schema, model, models } from "mongoose";

export const ASSESSMENT_TYPES = ["UTS", "UAS", "Tryout"] as const;
export const ASSESSMENT_REVIEW_STATUSES = [
  "Perlu Review Guru",
  "Disetujui",
  "Revisi",
] as const;
export const ASSESSMENT_DIFFICULTIES = ["Mudah", "Sedang", "Sulit"] as const;
export const ASSESSMENT_CORRECT_ANSWERS = ["A", "B", "C", "D"] as const;

export type AssessmentType = (typeof ASSESSMENT_TYPES)[number];
export type AssessmentReviewStatus =
  (typeof ASSESSMENT_REVIEW_STATUSES)[number];
export type AssessmentDifficulty = (typeof ASSESSMENT_DIFFICULTIES)[number];
export type AssessmentCorrectAnswer = (typeof ASSESSMENT_CORRECT_ANSWERS)[number];

export interface IAssessmentQuestionOption {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface IAssessmentQuestionItem {
  questionId: string;
  number: number;
  competency: string;
  topic: string;
  indicator: string;
  cognitiveLevel: string;
  difficulty: AssessmentDifficulty;
  question: string;
  options: IAssessmentQuestionOption;
  correctAnswer: AssessmentCorrectAnswer;
  explanation: string;
  reviewStatus: AssessmentReviewStatus;
  reviewerNotes: string;
}

export interface IAssessmentQuestionSet {
  schemaVersion: string;
  questionSetId: string;
  assessmentType: AssessmentType;
  stage: number | null;
  className: string;
  canonicalClassName: string;
  grade: number;
  phase: string;
  subject: string;
  questionCount: number;
  suggestedDurationMinutes: number;
  reviewStatus: AssessmentReviewStatus;
  curriculumNote: string;
  questions: IAssessmentQuestionItem[];
  importedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AssessmentQuestionSetDocument =
  HydratedDocument<IAssessmentQuestionSet>;

const assessmentQuestionOptionSchema =
  new Schema<IAssessmentQuestionOption>(
    {
      A: {
        type: String,
        required: true,
        trim: true,
      },
      B: {
        type: String,
        required: true,
        trim: true,
      },
      C: {
        type: String,
        required: true,
        trim: true,
      },
      D: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      _id: false,
    },
  );

const assessmentQuestionItemSchema = new Schema<IAssessmentQuestionItem>(
  {
    questionId: {
      type: String,
      required: true,
      trim: true,
    },
    number: {
      type: Number,
      required: true,
      min: 1,
    },
    competency: {
      type: String,
      default: "",
      trim: true,
    },
    topic: {
      type: String,
      default: "",
      trim: true,
    },
    indicator: {
      type: String,
      default: "",
      trim: true,
    },
    cognitiveLevel: {
      type: String,
      default: "",
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ASSESSMENT_DIFFICULTIES,
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: assessmentQuestionOptionSchema,
      required: true,
    },
    correctAnswer: {
      type: String,
      enum: ASSESSMENT_CORRECT_ANSWERS,
      required: true,
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
    },
    reviewStatus: {
      type: String,
      enum: ASSESSMENT_REVIEW_STATUSES,
      default: "Perlu Review Guru",
    },
    reviewerNotes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const assessmentQuestionSetSchema = new Schema<IAssessmentQuestionSet>(
  {
    schemaVersion: {
      type: String,
      default: "1.0.0",
      trim: true,
    },
    questionSetId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    assessmentType: {
      type: String,
      enum: ASSESSMENT_TYPES,
      required: true,
      index: true,
    },
    stage: {
      type: Number,
      default: null,
      min: 1,
      max: 3,
      index: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    canonicalClassName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
    grade: {
      type: Number,
      required: true,
      min: 1,
    },
    phase: {
      type: String,
      default: "",
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    questionCount: {
      type: Number,
      required: true,
      min: 0,
    },
    suggestedDurationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    reviewStatus: {
      type: String,
      enum: ASSESSMENT_REVIEW_STATUSES,
      default: "Perlu Review Guru",
      index: true,
    },
    curriculumNote: {
      type: String,
      default: "",
      trim: true,
    },
    questions: {
      type: [assessmentQuestionItemSchema],
      default: [],
    },
    importedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
  },
);

assessmentQuestionSetSchema.index({
  assessmentType: 1,
  canonicalClassName: 1,
  subject: 1,
  stage: 1,
});

export const AssessmentQuestionSet: Model<IAssessmentQuestionSet> =
  (models.AssessmentQuestionSet as
    | Model<IAssessmentQuestionSet>
    | undefined) ??
  model<IAssessmentQuestionSet>(
    "AssessmentQuestionSet",
    assessmentQuestionSetSchema,
  );
