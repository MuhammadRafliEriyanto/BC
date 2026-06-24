import { type NextRequest } from "next/server";

import { proxyProtectedBackend } from "@/lib/backend-route";

export async function GET(request: NextRequest) {
  return proxyProtectedBackend(request, "/api/student/me/attendance", {
    method: "GET",
  });
}
