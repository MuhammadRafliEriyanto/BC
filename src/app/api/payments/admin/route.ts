import { NextRequest } from "next/server";

import { proxyProtectedBackend } from "@/lib/backend-route";

export async function GET(request: NextRequest) {
  const queryString = request.nextUrl.search;

  return proxyProtectedBackend(request, `/api/payments/admin${queryString}`, {
    method: "GET",
  });
}
