import { NextRequest } from "next/server";

import { proxyProtectedBackend } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    tryoutId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { tryoutId } = await context.params;

  return proxyProtectedBackend(
    request,
    `/api/student/me/exams/${encodeURIComponent(tryoutId)}/start`,
    {
      method: "POST",
    },
  );
}
