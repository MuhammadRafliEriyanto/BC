import type { NextFunction, Request, RequestHandler, Response } from "express";

import type { UserRole } from "../models/User";
import { AppError } from "../utils/apiResponse";

export default function authorizeRole(...allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new AppError(401, "User belum terautentikasi."));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(403, "Anda tidak memiliki akses ke resource ini."));
      return;
    }

    next();
  };
}
