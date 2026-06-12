import { NextRequest } from "next/server";

import { proxyProtectedBackendRaw } from "@/lib/backend-route";

export async function GET(request: NextRequest) {
  return proxyProtectedBackendRaw(
    request,
    `/api/students/export${request.nextUrl.search}`,
    {
      method: "GET",
    },
  );
}
