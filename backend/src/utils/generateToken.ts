import jwt, { type SignOptions } from "jsonwebtoken";

import { validateEnv } from "../config/env";
import type { UserRole } from "../models/User";

export interface AuthJwtPayload {
  id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export const ROLE_REDIRECT_MAP: Record<UserRole, string> = {
  owner: "/dashboard-owner",
  admin: "/dashboard-admin",
  guru: "/dashboard-guru",
  siswa: "/dashboard-siswa",
};

export function generateJwtToken(userId: string, role: UserRole): string {
  const { jwtSecret, jwtExpiresIn } = validateEnv();

  return jwt.sign(
    {
      id: userId,
      role,
    },
    jwtSecret,
    {
      expiresIn: jwtExpiresIn as SignOptions["expiresIn"],
    },
  );
}

export function getRedirectPathByRole(role: UserRole): string {
  return ROLE_REDIRECT_MAP[role] ?? "/login";
}
