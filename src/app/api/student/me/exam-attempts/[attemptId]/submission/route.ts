import { NextRequest } from "next/server";

import {
  proxyProtectedBackend,
  readRequestBody,
} from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    attemptId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { attemptId } = await context.params;

  return proxyProtectedBackend(
    request,
    `/api/student/me/exam-attempts/${encodeURIComponent(attemptId)}/submission`,
    {
      method: "POST",
      body: await readRequestBody(request),
    },
  );
}
