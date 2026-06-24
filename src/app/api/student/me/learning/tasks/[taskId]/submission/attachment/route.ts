import { NextRequest } from "next/server";

import { proxyProtectedBackendRaw } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { taskId } = await params;

  return proxyProtectedBackendRaw(
    request,
    `/api/student/me/learning/tasks/${encodeURIComponent(taskId)}/submission/attachment`,
    {
      method: "GET",
    },
  );
}
