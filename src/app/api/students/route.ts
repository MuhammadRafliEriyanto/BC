import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

export async function GET(request: NextRequest) {
  return proxyProtectedBackend(request, `/api/students${request.nextUrl.search}`, {
    method: "GET",
  });
}

export async function POST(request: NextRequest) {
  const body = await readRequestBody(request);

  return proxyProtectedBackend(request, "/api/students", {
    method: "POST",
    body,
  });
}
