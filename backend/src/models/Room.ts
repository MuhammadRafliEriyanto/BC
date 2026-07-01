import { HydratedDocument, Model, Schema, model, models } from "mongoose";

export const ROOM_STATUSES = ["Dipakai", "Kosong", "Persiapan"] as const;

export type RoomStatus = (typeof ROOM_STATUSES)[number];

export interface IRoom {
  roomId: string;
  name: string;
  floor: string;
  status: RoomStatus;
  activeClass: string;
  teacher: string;
  time: string;
  occupancy: number;
  capacityLabel: string;
  nextSession: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RoomDocument = HydratedDocument<IRoom>;

const roomSchema = new Schema<IRoom>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Nama ruangan wajib diisi."],
      trim: true,
    },
    floor: {
      type: String,
      required: [true, "Lantai wajib diisi."],
      trim: true,
    },
    status: {
      type: String,
      enum: ROOM_STATUSES,
      default: "Kosong",
    },
    activeClass: {
      type: String,
      required: [true, "Kelas aktif wajib diisi."],
      trim: true,
    },
    teacher: {
      type: String,
      required: [true, "Guru wajib diisi."],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "Waktu wajib diisi."],
      trim: true,
    },
    occupancy: {
      type: Number,
      required: [true, "Utilisasi wajib diisi."],
      min: 0,
      max: 100,
    },
    capacityLabel: {
      type: String,
      required: [true, "Kapasitas wajib diisi."],
      trim: true,
    },
    nextSession: {
      type: String,
      required: [true, "Sesi berikutnya wajib diisi."],
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Room: Model<IRoom> =
  (models.Room as Model<IRoom> | undefined) ?? model<IRoom>("Room", roomSchema);
