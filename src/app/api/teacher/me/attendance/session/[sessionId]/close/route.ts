import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    sessionId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { sessionId } = await params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/attendance/session/${encodeURIComponent(sessionId)}/close`,
    {
      method: "PATCH",
      body,
    },
  );
}
