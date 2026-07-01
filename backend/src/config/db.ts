import mongoose from "mongoose";

import { validateEnv } from "./env";

let listenersRegistered = false;

export async function connectDB(): Promise<typeof mongoose> {
  const { mongoUri } = validateEnv();

  if (!listenersRegistered) {
    mongoose.connection.on("connected", () => {
      console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB error:", error.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    listenersRegistered = true;
  }

  console.log("Mencoba koneksi ke MongoDB...");

  return mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
    family: 4
  });
}

export default connectDB;
