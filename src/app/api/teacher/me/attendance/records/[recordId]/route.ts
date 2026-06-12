import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    recordId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { recordId } = await params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/attendance/records/${encodeURIComponent(recordId)}`,
    {
      method: "PATCH",
      body,
    },
  );
}
