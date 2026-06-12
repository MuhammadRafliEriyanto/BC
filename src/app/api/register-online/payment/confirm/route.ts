import { NextRequest } from "next/server";

import { proxyPublicBackend, readRequestBody } from "@/lib/backend-route";

export async function POST(request: NextRequest) {
  const body = await readRequestBody(request);

  return proxyPublicBackend("/api/payments/confirm", {
    method: "POST",
    body,
  });
}
