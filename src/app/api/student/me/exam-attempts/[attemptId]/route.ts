import { NextRequest } from "next/server";

import { proxyProtectedBackend } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    attemptId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { attemptId } = await context.params;

  return proxyProtectedBackend(
    request,
    `/api/student/me/exam-attempts/${encodeURIComponent(attemptId)}`,
    {
      method: "GET",
    },
  );
}
