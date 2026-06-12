import { NextResponse } from "next/server";

import { clearAuthCookies } from "@/lib/auth-server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
  });

  clearAuthCookies(response);

  return response;
}
