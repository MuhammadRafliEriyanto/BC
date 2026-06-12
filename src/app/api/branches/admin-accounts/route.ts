import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

export async function GET(request: NextRequest) {
  return proxyProtectedBackend(request, "/api/branches/admin-accounts", {
    method: "GET",
  });
}

export async function POST(request: NextRequest) {
  const body = await readRequestBody(request);

  return proxyProtectedBackend(request, "/api/branches/admin-accounts", {
    method: "POST",
    body,
  });
}
