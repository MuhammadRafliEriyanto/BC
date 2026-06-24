import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    classId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { classId } = await params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/classes/${encodeURIComponent(classId)}/settings`,
    {
      method: "PATCH",
      body,
    },
  );
}
