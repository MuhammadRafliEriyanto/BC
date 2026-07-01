import type { Request, Response } from "express";

import asyncHandler from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { getAdminDashboardConfig } from "../utils/adminDashboardConfig";

export const getAdminDashboardConfigData = asyncHandler(
  async (_req: Request, res: Response) => {
    sendSuccess(res, {
      message: "Konfigurasi dashboard admin berhasil diambil.",
      data: getAdminDashboardConfig(),
    });
  },
);
