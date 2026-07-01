import { HydratedDocument, Model, Schema, model, models, type Types } from "mongoose";

export interface ITeacherClassSetting {
  classId: string;
  teacherId: Types.ObjectId;
  className: string;
  branch: string;
  targetMeetingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TeacherClassSettingDocument = HydratedDocument<ITeacherClassSetting>;

const teacherClassSettingSchema = new Schema<ITeacherClassSetting>(
  {
    classId: {
      type: String,
      required: [true, "Class ID wajib diisi."],
      trim: true,
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Guru wajib diisi."],
      index: true,
    },
    className: {
      type: String,
      required: [true, "Nama kelas wajib diisi."],
      trim: true,
    },
    branch: {
      type: String,
      default: "",
      trim: true,
    },
    targetMeetingCount: {
      type: Number,
      required: [true, "Target pertemuan wajib diisi."],
      min: 1,
    },
  },
  {
    timestamps: true,
  },
);

teacherClassSettingSchema.index(
  {
    teacherId: 1,
    classId: 1,
  },
  {
    unique: true,
  },
);

export const TeacherClassSetting: Model<ITeacherClassSetting> =
  (models.TeacherClassSetting as Model<ITeacherClassSetting> | undefined) ??
  model<ITeacherClassSetting>(
    "TeacherClassSetting",
    teacherClassSettingSchema,
  );
