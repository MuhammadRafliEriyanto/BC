import { NextRequest } from "next/server";

import { proxyPublicBackend } from "@/lib/backend-route";

export async function GET(request: NextRequest) {
  const paymentId = request.nextUrl.searchParams.get("paymentId")?.trim();

  if (!paymentId) {
    return Response.json(
      {
        success: false,
        message: "paymentId wajib dikirim.",
      },
      {
        status: 400,
      },
    );
  }

  const params = new URLSearchParams({ paymentId });

  return proxyPublicBackend(`/api/payments/status?${params.toString()}`, {
    method: "GET",
  });
}
