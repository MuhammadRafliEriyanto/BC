import { NextRequest } from "next/server";

import {
  proxyProtectedBackend,
  readRequestBody,
} from "@/lib/backend-route";

type RouteParams = {
  params: Promise<{
    paymentId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { paymentId } = await params;

  return proxyProtectedBackend(
    request,
    `/api/payments/admin/${encodeURIComponent(paymentId)}`,
    {
      method: "PATCH",
      body: await readRequestBody(request),
    },
  );
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { paymentId } = await params;

  return proxyProtectedBackend(
    request,
    `/api/payments/admin/${encodeURIComponent(paymentId)}`,
    {
      method: "DELETE",
      body: await readRequestBody(request),
    },
  );
}
