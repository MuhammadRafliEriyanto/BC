import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type RouteParams = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { paymentId } = await params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(
    request,
    `/api/payments/admin/${encodeURIComponent(paymentId)}/status`,
    {
      method: "PATCH",
      body,
    },
  );
}
