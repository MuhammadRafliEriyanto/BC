import type { Response } from "express";

export type ErrorDetails = Record<string, unknown> | null;

export class AppError extends Error {
  statusCode: number;
  errors: ErrorDetails;
  errorCode: string | null;

  constructor(
    statusCode: number,
    message: string,
    errors: ErrorDetails = null,
    errorCode: string | null = null,
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.errorCode = errorCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

interface SuccessOptions<T extends Record<string, unknown>> {
  statusCode?: number;
  message?: string;
  data?: T;
}

interface ErrorOptions {
  statusCode?: number;
  message?: string;
  errors?: ErrorDetails;
  errorCode?: string | null;
}

export function sendSuccess<T extends Record<string, unknown>>(
  res: Response,
  { statusCode = 200, message = "Berhasil.", data = {} as T }: SuccessOptions<T> = {},
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  {
    statusCode = 500,
    message = "Terjadi kesalahan.",
    errors = null,
    errorCode = null,
  }: ErrorOptions = {},
) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errorCode ? { errorCode } : {}),
    ...(errors ? { errors } : {}),
  });
}
