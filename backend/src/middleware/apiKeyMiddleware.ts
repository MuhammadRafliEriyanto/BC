import type { NextFunction, Request, Response } from "express";

import { validateEnv } from "../config/env";
import { AppError } from "../utils/apiResponse";

export default function apiKeyMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const incomingApiKeyHeader = req.headers["x-api-key"];
  const incomingApiKey = Array.isArray(incomingApiKeyHeader)
    ? incomingApiKeyHeader[0]
    : incomingApiKeyHeader;
  const { apiKey } = validateEnv();

  if (!incomingApiKey || incomingApiKey !== apiKey) {
    next(new AppError(401, "API key tidak valid."));
    return;
  }

  next();
}
