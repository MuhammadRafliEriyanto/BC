import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    classId: string;
    studentId: string;
  }>;
};

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { classId, studentId } = await params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/classes/${encodeURIComponent(classId)}/academic-grades/${encodeURIComponent(studentId)}`,
    {
      method: "PUT",
      body,
    },
  );
}
