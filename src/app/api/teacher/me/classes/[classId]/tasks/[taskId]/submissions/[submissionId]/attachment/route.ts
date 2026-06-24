import { NextRequest } from "next/server";

import { proxyProtectedBackendRaw } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    classId: string;
    taskId: string;
    submissionId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { classId, taskId, submissionId } = await params;

  return proxyProtectedBackendRaw(
    request,
    `/api/teacher/me/classes/${encodeURIComponent(classId)}/tasks/${encodeURIComponent(taskId)}/submissions/${encodeURIComponent(submissionId)}/attachment`,
    {
      method: "GET",
    },
  );
}
